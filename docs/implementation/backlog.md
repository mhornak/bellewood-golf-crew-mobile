# Iteration Backlog

The planned, in-progress, and completed iterations for Bellewood Golf Crew.
Each iteration gets its own `NNN-*.md` file in this folder when work begins
(via the `start-iteration` skill), plus a paired entry in `docs/learnings/`
when the iteration completes (via the `complete-iteration` skill).

## In Progress

| # | Title | Scope | Notes |
|---|-------|-------|-------|
| 001 | iOS Universal Links | Replace broken TinyURL+custom-scheme deep links in `Share Group Status` with Universal Links served from the existing Amplify domain. Touches `golf-scheduler-mobile` (app.json, App.tsx, SessionCard.tsx) and `golf-scheduler` (AASA file, next.config.ts, /session/[id] fallback page). | Native rebuild required — verify via EAS → TestFlight → real-device test. |

## Remaining

| # | Title | Scope | Dependencies |
|---|-------|-------|--------------|
| _add upcoming work here_ | — | — | — |

## Completed

| # | Title | Status | Summary |
|---|-------|--------|---------|
| _none yet_ | — | — | — |

## Deferred

| # | Title | Reason |
|---|-------|--------|
| _none yet_ | — | — |

## Past Work (to migrate)

The following root-level notes predate the compound engineering setup. They
can each be retroactively converted into an iteration record (move to
`docs/implementation/NNN-*.md`) plus a learnings doc when convenient — no rush.

- `ARCHIVE_SESSION_FIX.md` — archive-session bug fix
- `EXPO_SDK_54_UPGRADE.md` — Expo SDK 54 upgrade
- `TRANSPORT_COMMENT_BUG_FIX.md` — transport comment bug fix
- `URL_SHORTENING_FEATURE.md` — URL shortening feature

## Notes

- Each iteration follows the compound engineering loop:
  `start-iteration` → build → ADRs as needed (`record-decision`) →
  `complete-iteration` (implementation record + learnings + architecture update).
- ADRs live in `docs/decisions/NNN-short-title.md`.
- Architecture is a description of what _is_, not a changelog —
  see `docs/architecture/overview.md`.
- See `.agents/skills/` for the four skills that drive this loop.
