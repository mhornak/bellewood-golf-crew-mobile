# Testing

> Testing patterns for Bellewood Golf Crew. Referenced from `AGENTS.md`.

## Current state

This repo does not yet have an automated test suite. Quality gates today:

- `npx tsc --noEmit` — full TypeScript check.
- Manual smoke testing in Expo Go / dev client.
- TestFlight builds for pre-release validation
  (see `.agents/skills/eas-testflight-build/SKILL.md`).

## Recommended setup (when adding tests)

- **Unit / hook tests:** Jest + `@testing-library/react-native`.
- **Snapshot tests:** Sparingly, only for stable presentational components.
- **GraphQL mocking:** Mock the `appsync.ts` client at the module boundary so
  tests don't hit real AppSync.

## Conventions (proposed)

- Co-locate tests next to source: `SessionCard.tsx` → `SessionCard.test.tsx`.
- One behavior per test; describe blocks group related cases.
- Test hooks via `@testing-library/react-native`'s `renderHook`.

## TODO

<!-- Update this file once a test runner is added to package.json. -->
