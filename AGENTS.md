# Agent Notes

This is a small Vite + React workout tracker. Keep changes focused and preserve the app's fast, single-purpose feel.

## Project Shape

- Entry point: `main.jsx`
- Main app: `workout_tracker.jsx`
- Static shell: `index.html`
- Build config: `vite.config.js`
- Seed/sample data: `sessions.json`, `workouts.json`
- Deployment helpers: `deploy.sh`, `setup-aws.sh`, `seed-dev.sh`

Most UI, state, data definitions, and inline styles currently live in `workout_tracker.jsx`. Prefer matching that style for small changes. Split code only when it clearly reduces complexity.

## Commands

- Install dependencies: `npm install`
- Start local dev server: `npm run dev`
- Production build: `npm run build`

There is no test runner configured. Use `npm run build` as the default verification step after code changes.

## Data And Persistence

The app stores workout data in Upstash Redis through these Vite env vars:

- `VITE_UPSTASH_URL`
- `VITE_UPSTASH_TOKEN`

In dev mode, keys are prefixed with `dev-`. Production uses the unprefixed keys. Be careful when changing persistence code or running scripts that touch Upstash.

Primary keys used by the app:

- `workout-sessions`
- `workout-custom-exercises`
- `workout-plans`

`localStorage` is used for the in-progress workout (`wip`) so users can resume a session.

## Implementation Conventions

- Use React function components and hooks.
- Keep dependencies minimal; the app currently only depends on React, React DOM, Vite, and the Vite React plugin.
- Inline style objects are the dominant styling pattern. Reuse `S` where possible.
- Keep mobile ergonomics in mind. This app is likely used mid-workout, so controls should be large enough to tap and state should not be easy to lose.
- Preserve existing workout/session data shapes unless a migration is explicitly part of the task.
- When editing exercise IDs or workout IDs, consider existing history that may reference those IDs.

## Deployment Notes

`./deploy.sh` builds the app, syncs `dist/` to the `workouts.waltercarlson.com` S3 bucket, and invalidates CloudFront using `.cf-dist-id`.

Do not run deployment scripts unless the user explicitly asks. For ordinary feature work, stop at `npm run build`.

## Safety Checklist

Before finishing code changes:

1. Run `npm run build`.
2. Check that no production data script or deploy script was run unintentionally.
3. Mention any verification that could not be completed.
