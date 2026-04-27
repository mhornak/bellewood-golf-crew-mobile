# AGENTS.md

## Project

Bellewood Golf Crew — Expo / React Native mobile app for scheduling group
golf sessions. AWS Amplify (AppSync GraphQL) backend.

## Stack

Expo SDK 54, React Native 0.81, React 19, TypeScript strict, AWS Amplify v6,
React Navigation v7. New Architecture enabled (`newArchEnabled: true`).

## Commands

- `npm start` — start Expo dev server
- `npm run ios` / `npm run android` / `npm run web` — run the app
- `npx tsc --noEmit` — type-check (quality gate)

## Code Layout

- `App.tsx` — root; `src/components/` — screens & UI
- `src/hooks/` — data hooks (`useGolfSessions`, `useUsers`, `useSessionResponse`)
- `src/contexts/` — contexts (`UserContext`); `src/lib/` — API clients
- `app.json` / `eas.json` — Expo + EAS Build config

## Documentation

For architecture, read `docs/architecture/overview.md`.
For coding conventions, read `docs/conventions.md`.
For testing patterns, read `docs/testing.md`.
For decision history, see `docs/decisions/` (ADRs).
For iteration history, see `docs/implementation/`.

## Compound Engineering

Every unit of work compounds into the next:

1. Start an iteration via the `start-iteration` skill — creates `docs/implementation/NNN-*.md`.
2. Record significant design choices via `record-decision` — creates `docs/decisions/NNN-*.md`.
3. Close out via `complete-iteration` — writes learnings, refreshes architecture.
4. Track work-in-flight and upcoming work in `docs/implementation/backlog.md`.

## Skills and Commands

The canonical location for skills is `.agents/skills/`.
The canonical location for commands is `.agents/commands/`.
When reading, creating, or updating skills or commands, use `.agents/`.
Do NOT read or write `.cursor/skills/`, `.cursor/commands/`, or `.claude/skills/` —
those are symlinks; always work with the canonical files in `.agents/`.

## Available Skills

- `start-iteration` / `complete-iteration` — bookend the compound engineering loop
- `record-decision` — capture an ADR in `docs/decisions/`
- `update-architecture` — refresh `docs/architecture/overview.md`
- `eas-testflight-build` — build and submit iOS to TestFlight
- `skill-hygiene` — verify skills live under `.agents/`

No commands defined yet — add command files to `.agents/commands/` as needed.
