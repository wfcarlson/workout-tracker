#!/usr/bin/env bash
# setup-aws.sh — Idempotent. Safe to re-run; skips already-created resources.
set -euo pipefail

DOMAIN="workouts.waltercarlson.com"
ROOT_DOMAIN="waltercarlson.com"
BUCKET="$DOMAIN"
REGION="us-east-1"
CF_ZONE_ID="Z2FDTNDATAQYW2"  # CloudFront's hosted zone ID — constant for all CF distributions

# ── Preflight ──────────────────────────────────────────────────────────────────
command -v aws >/dev/null || { echo "ERROR: aws CLI not found — https://aws.amazon.com/cli/"; exit 1; }
command -v jq  >/dev/null || { echo "ERROR: jq not found — brew install jq  or  apt install jq"; exit 1; }
aws sts get-caller-identity > /dev/null || { echo "ERROR: not authenticated — run 'aws configure'"; exit 1; }

CLI_MINOR=$(aws --version 2>&1 | grep -oP '(?<=aws-cli/2\.)\d+')
if [ "${CLI_MINOR:-0}" -lt 9 ]; then
  echo "ERROR: AWS CLI 2.9+ required (OAC support). You have: $(aws --version 2>&1)"
  echo "Upgrade: cd /tmp && curl -sO https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip"
  echo "         unzip awscliv2.zip && sudo ./aws/install --update"
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account: $ACCOUNT_ID  Region: $REGION"
echo ""

# ── S3 ─────────────────────────────────────────────────────────────────────────
echo "── S3 bucket ──────────────────────────────────────────────────────────────"
if aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  echo "Already exists: $BUCKET"
else
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGION"
  echo "Created: $BUCKET"
fi

aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
echo "Public access blocked"
echo ""

# ── ACM Certificate ─────────────────────────────────────────────────────────────
echo "── ACM certificate ────────────────────────────────────────────────────────"
CERT_ARN=$(aws acm list-certificates --region us-east-1 \
  --query "CertificateSummaryList[?DomainName=='${DOMAIN}'] | [?Status!='EXPIRED'] | [0].CertificateArn" \
  --output text)

if [ "$CERT_ARN" = "None" ] || [ -z "$CERT_ARN" ]; then
  CERT_ARN=$(aws acm request-certificate \
    --domain-name "$DOMAIN" \
    --validation-method DNS \
    --region us-east-1 \
    --query 'CertificateArn' --output text)
  echo "Requested: $CERT_ARN"
  echo "Waiting 15s for AWS to populate validation records..."
  sleep 15
else
  echo "Already exists: $CERT_ARN"
fi

CERT=$(aws acm describe-certificate --certificate-arn "$CERT_ARN" --region us-east-1)
CERT_STATUS=$(echo "$CERT" | jq -r '.Certificate.Status')
echo "Status: $CERT_STATUS"

if [ "$CERT_STATUS" != "ISSUED" ]; then
  CNAME_NAME=$(echo "$CERT"  | jq -r '.Certificate.DomainValidationOptions[0].ResourceRecord.Name')
  CNAME_VALUE=$(echo "$CERT" | jq -r '.Certificate.DomainValidationOptions[0].ResourceRecord.Value')

  echo ""
  echo "── Route53: certificate DNS validation ──────────────────────────────────"
  ZONE_ID=$(aws route53 list-hosted-zones \
    --query "HostedZones[?Name=='${ROOT_DOMAIN}.'].Id" \
    --output text | sed 's|/hostedzone/||')
  echo "Hosted zone: $ZONE_ID"

  aws route53 change-resource-record-sets \
    --hosted-zone-id "$ZONE_ID" \
    --change-batch "$(jq -n \
      --arg name  "$CNAME_NAME" \
      --arg value "$CNAME_VALUE" \
      '{Changes:[{Action:"UPSERT",ResourceRecordSet:{Name:$name,Type:"CNAME",TTL:300,ResourceRecords:[{Value:$value}]}}]}'
    )" > /dev/null
  echo "CNAME added. Waiting for validation (usually 1–3 min)..."
  aws acm wait certificate-validated --certificate-arn "$CERT_ARN" --region us-east-1
  echo "Certificate validated ✓"
else
  echo "Already validated ✓"
fi

# Ensure ZONE_ID is set even when cert was already issued
ZONE_ID=${ZONE_ID:-$(aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='${ROOT_DOMAIN}.'].Id" \
  --output text | sed 's|/hostedzone/||')}
echo ""

# ── CloudFront OAC ─────────────────────────────────────────────────────────────
echo "── CloudFront OAC ─────────────────────────────────────────────────────────"
OAC_NAME="${BUCKET}-oac"
OAC_ID=$(aws cloudfront list-origin-access-controls \
  --query "OriginAccessControlList.Items[?Name=='${OAC_NAME}'].Id | [0]" \
  --output text)

if [ "$OAC_ID" = "None" ] || [ -z "$OAC_ID" ]; then
  OAC_ID=$(aws cloudfront create-origin-access-control \
    --origin-access-control-config "$(jq -n \
      --arg name "$OAC_NAME" \
      '{Name:$name,Description:"",OriginAccessControlOriginType:"s3",SigningBehavior:"always",SigningProtocol:"sigv4"}'
    )" \
    --query 'OriginAccessControl.Id' --output text)
  echo "Created OAC: $OAC_ID"
else
  echo "Already exists: $OAC_ID"
fi
echo ""

# ── CloudFront Distribution ─────────────────────────────────────────────────────
echo "── CloudFront distribution ────────────────────────────────────────────────"

# Use saved ID if available, otherwise look up by alias
CF_ID=""
if [ -f .cf-dist-id ]; then
  CF_ID=$(cat .cf-dist-id)
  echo "Found .cf-dist-id: $CF_ID"
fi

if [ -z "$CF_ID" ]; then
  CF_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Aliases.Items[0]=='${DOMAIN}'].Id | [0]" \
    --output text)
  [ "$CF_ID" = "None" ] && CF_ID=""
fi

if [ -z "$CF_ID" ]; then
  echo "Creating distribution..."
  DIST_CONFIG=$(mktemp)
  # CachePolicyId 658327ea-... = AWS managed "CachingOptimized" policy
  cat > "$DIST_CONFIG" << EOF
{
  "CallerReference":   "${DOMAIN}-$(date +%s)",
  "Comment":           "${DOMAIN}",
  "Enabled":           true,
  "HttpVersion":       "http2and3",
  "IsIPV6Enabled":     true,
  "PriceClass":        "PriceClass_100",
  "DefaultRootObject": "index.html",
  "Aliases": { "Quantity": 1, "Items": ["${DOMAIN}"] },
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id":                    "s3-${BUCKET}",
      "DomainName":            "${BUCKET}.s3.${REGION}.amazonaws.com",
      "OriginAccessControlId": "${OAC_ID}",
      "S3OriginConfig":        { "OriginAccessIdentity": "" }
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId":       "s3-${BUCKET}",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress":             true,
    "CachePolicyId":        "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "AllowedMethods": {
      "Quantity": 2, "Items": ["GET","HEAD"],
      "CachedMethods": { "Quantity": 2, "Items": ["GET","HEAD"] }
    }
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [{
      "ErrorCode": 403, "ResponsePagePath": "/index.html",
      "ResponseCode": "200", "ErrorCachingMinTTL": 0
    }]
  },
  "ViewerCertificate": {
    "ACMCertificateArn":      "${CERT_ARN}",
    "SSLSupportMethod":       "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}
EOF
  DIST=$(aws cloudfront create-distribution --distribution-config "file://${DIST_CONFIG}")
  rm "$DIST_CONFIG"
  CF_ID=$(echo "$DIST"     | jq -r '.Distribution.Id')
  CF_DOMAIN=$(echo "$DIST" | jq -r '.Distribution.DomainName')
  echo "$CF_ID" > .cf-dist-id
  echo "Created distribution: $CF_ID"
else
  CF_DOMAIN=$(aws cloudfront get-distribution --id "$CF_ID" \
    --query 'Distribution.DomainName' --output text)
  echo "Already exists: $CF_ID"
  echo "$CF_ID" > .cf-dist-id
fi
echo "CloudFront domain: $CF_DOMAIN"
echo ""

# ── S3 bucket policy ───────────────────────────────────────────────────────────
echo "── S3 bucket policy ───────────────────────────────────────────────────────"
aws s3api put-bucket-policy --bucket "$BUCKET" \
  --policy "$(jq -n \
    --arg bucket "$BUCKET" \
    --arg cf_arn "arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${CF_ID}" \
    '{
      Version: "2012-10-17",
      Statement: [{
        Sid: "AllowCloudFront", Effect: "Allow",
        Principal: { Service: "cloudfront.amazonaws.com" },
        Action: "s3:GetObject",
        Resource: ("arn:aws:s3:::" + $bucket + "/*"),
        Condition: { StringEquals: { "AWS:SourceArn": $cf_arn } }
      }]
    }'
  )"
echo "Bucket policy set"
echo ""

# ── Route53 A record ───────────────────────────────────────────────────────────
echo "── Route53: A record ──────────────────────────────────────────────────────"
aws route53 change-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --change-batch "$(jq -n \
    --arg domain    "$DOMAIN" \
    --arg cf_zone   "$CF_ZONE_ID" \
    --arg cf_domain "$CF_DOMAIN" \
    '{Changes:[{Action:"UPSERT",ResourceRecordSet:{
      Name:$domain, Type:"A",
      AliasTarget:{HostedZoneId:$cf_zone,DNSName:$cf_domain,EvaluateTargetHealth:false}
    }}]}'
  )" > /dev/null
echo "DNS: $DOMAIN → $CF_DOMAIN"
echo ""

echo "══════════════════════════════════════════════════════════════════════"
echo "  Setup complete!"
echo "  CloudFront takes ~15 min for initial global propagation."
echo "  Site: https://${DOMAIN}"
echo ""
echo "  Run ./deploy.sh to build and upload the app."
echo "══════════════════════════════════════════════════════════════════════"
