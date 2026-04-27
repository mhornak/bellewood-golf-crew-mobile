# Architecture

> Detailed system architecture for Bellewood Golf Crew. Referenced from `AGENTS.md`.

## Overview

Expo / React Native client backed by AWS AppSync (GraphQL). Authentication and
data access go through AWS Amplify v6.

## Client

- **Entry point:** `index.ts` registers `App.tsx` via Expo's root component.
- **Navigation:** React Navigation v7 — bottom-tab navigator with nested stacks.
- **State:** React contexts for cross-cutting state (`UserContext`); per-screen state via hooks.
- **Data fetching:** Custom hooks in `src/hooks/` (`useGolfSessions`, `useUsers`, `useSessionResponse`) wrap GraphQL calls.

## Backend integration

- **Client setup:** `src/lib/appsync.ts` configures the AppSync GraphQL client.
- **Queries / mutations:** Defined in `src/lib/api.ts`.
- **Auth:** AWS Amplify (`aws-amplify` v6).

## Build & deploy

- **Local dev:** `npm start` (Expo Go or dev client).
- **EAS Build profiles** (`eas.json`): `development`, `preview`, `production`.
- **TestFlight:** see `.agents/skills/eas-testflight-build/SKILL.md`.

## Open questions / TODO

<!-- Migrate the standalone fix/upgrade notes (ARCHIVE_SESSION_FIX.md, EXPO_SDK_54_UPGRADE.md, TRANSPORT_COMMENT_BUG_FIX.md, URL_SHORTENING_FEATURE.md) into this folder over time. -->
