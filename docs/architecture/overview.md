# Architecture

> Detailed system architecture for Bellewood Golf Crew. Referenced from `AGENTS.md`.

## Overview

Expo / React Native client backed by AWS AppSync (GraphQL). Authentication and
data access go through AWS Amplify v6. Cross-repo: the iOS app shares a
Universal Link domain with a Next.js web app hosted on AWS Amplify Hosting.

## Client (`golf-scheduler-mobile`)

- **Entry point:** `index.ts` registers `App.tsx` via Expo's root component.
- **Navigation:** React Navigation v7 — bottom-tab navigator with nested stacks.
- **State:** React contexts for cross-cutting state (`UserContext`); per-screen state via hooks.
- **Data fetching:** Custom hooks in `src/hooks/` (`useGolfSessions`, `useUsers`, `useSessionResponse`) wrap GraphQL calls.
- **Deep linking:** `App.tsx` `handleDeepLink` parses both:
  - `bellewoodgolf://session/<id>` — legacy custom URL scheme (still works for in-app jumps)
  - `https://main.d2m423juctwnaf.amplifyapp.com/session/<id>` — iOS Universal Link
- **iOS entitlements:** `app.json` declares `ios.associatedDomains: ["applinks:main.d2m423juctwnaf.amplifyapp.com"]`. Native rebuild required when this changes.

## Backend integration

- **Client setup:** `src/lib/appsync.ts` configures the AppSync GraphQL client.
- **Queries / mutations:** Defined in `src/lib/api.ts`.
- **Auth:** AWS Amplify (`aws-amplify` v6).
- **Backend stack** (separate repo `golf-scheduler-aws`): CDK-defined DynamoDB single-table + AppSync GraphQL API with JS resolvers. API key auth.

## Web companion (`golf-scheduler`)

- **Framework:** Next.js 15 (App Router) deployed to AWS Amplify Hosting.
- **Domain:** `main.d2m423juctwnaf.amplifyapp.com`.
- **Role for the mobile app:**
  - Hosts the Apple App Site Association (AASA) file at
    `/.well-known/apple-app-site-association`, served via a Next.js Route
    Handler at `src/app/.well-known/apple-app-site-association/route.ts`
    so `Content-Type: application/json` is set explicitly.
  - Serves a fallback page at `/session/[id]` for non-iOS visitors and
    iOS visitors without the app installed.
- **Amplify Hosting deployment quirks worth knowing:**
  - Files in `public/` are served directly by CloudFront from S3 and
    bypass Next.js compute. Any `headers()` rules in `next.config.ts`
    do **not** apply to them — you'll silently get
    `Content-Type: application/octet-stream` for extension-less files.
  - For controlled response headers, use a Route Handler (server-side
    Next.js) instead of a static file.

## Build & deploy

- **Local dev (mobile):** `npm start` (Expo Go or dev client).
- **EAS Build profiles** (`eas.json`): `development`, `preview`, `production`.
- **TestFlight:** see `.agents/skills/eas-testflight-build/SKILL.md`.
- **Native entitlement changes** (e.g. `associatedDomains`) require a fresh native build via EAS — Expo Go can't apply them.
- **Web deploy:** push to `main` in the `golf-scheduler` repo; AWS Amplify Hosting picks up the change and rebuilds via `amplify.yml`.

## Open questions / TODO

<!-- Migrate the standalone fix/upgrade notes (ARCHIVE_SESSION_FIX.md, EXPO_SDK_54_UPGRADE.md, TRANSPORT_COMMENT_BUG_FIX.md, URL_SHORTENING_FEATURE.md) into this folder over time. -->
<!-- Resolve pre-existing TypeScript errors in `src/components/SessionCarousel.tsx` and `src/hooks/useSessionResponse.ts` so `npx tsc --noEmit` is a clean quality gate. -->
