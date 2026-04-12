#!/usr/bin/env bash
# deploy.sh — Build and deploy to S3, then invalidate CloudFront cache.
# Run setup-aws.sh once before using this.
set -euo pipefail

BUCKET="workouts.waltercarlson.com"

# ── Preflight ──────────────────────────────────────────────────────────────────
if [ ! -f .cf-dist-id ]; then
  echo "ERROR: .cf-dist-id not found — run ./setup-aws.sh first"
  exit 1
fi
CF_DIST_ID=$(cat .cf-dist-id)
echo "Deploying to s3://$BUCKET  (CloudFront: $CF_DIST_ID)"
echo ""

# ── Build ──────────────────────────────────────────────────────────────────────
echo "── Building ───────────────────────────────────────────────────────────────"
npm run build
echo ""

# ── Upload ─────────────────────────────────────────────────────────────────────
echo "── Uploading to S3 ────────────────────────────────────────────────────────"

# Vite puts content hashes in asset filenames (main-BxYz1234.js), so they can
# be cached forever. Upload assets first, then index.html.
aws s3 sync dist/ "s3://$BUCKET" \
  --delete \
  --exclude "index.html" \
  --cache-control "public,max-age=31536000,immutable" \
  --output text | grep -v "^$" || true

# index.html must never be cached so browsers always fetch the latest version
aws s3 cp dist/index.html "s3://$BUCKET/index.html" \
  --cache-control "no-cache,no-store,must-revalidate" \
  --content-type "text/html"

echo ""

# ── CloudFront invalidation ────────────────────────────────────────────────────
echo "── CloudFront cache invalidation ──────────────────────────────────────────"
INV_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$CF_DIST_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' --output text)
echo "Invalidation started: $INV_ID"
echo "(Changes are live within ~30 seconds)"
echo ""

echo "  https://workouts.waltercarlson.com  ✓"
