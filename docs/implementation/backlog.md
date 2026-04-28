# Iteration Backlog

The planned, in-progress, and completed iterations for Bellewood Golf Crew.
Each iteration gets its own `NNN-*.md` file in this folder when work begins
(via the `start-iteration` skill), plus a paired entry in `docs/learnings/`
when the iteration completes (via the `complete-iteration` skill).

## In Progress

| # | Title | Scope | Notes |
|---|-------|-------|-------|
| _none_ | — | — | Pick the next iteration when ready. |

## Remaining

| # | Title | Scope | Dependencies |
|---|-------|-------|--------------|
| 004 | AI-Native the `golf-scheduler` and `golf-scheduler-aws` repos | Apply the AI Native Repo recommendations (AGENTS.md, CLAUDE.md symlink, `.agents/` canonical layout, `.claude/`/`.cursor/` symlinks) to both other repos. Optional compound engineering setup per repo. | None. |
| _backlog_ | Resolve pre-existing TypeScript errors | Fix `SessionCarousel.tsx:252` (`expression of type 'void'`) and `useSessionResponse.ts:42`/`:138` (`isArchived` not on `GolfSession`) so `npx tsc --noEmit` becomes a clean quality gate. Flagged in iteration 001's learnings. | None. |

## Completed

| # | Title | Status | Summary |
|---|-------|--------|---------|
| 001 | iOS Universal Links | Complete (2026-04-28) | Replaced TinyURL+custom-scheme deep linking with iOS Universal Links served from `main.d2m423juctwnaf.amplifyapp.com`. AASA via Next.js Route Handler (not `public/`) to avoid Amplify's CloudFront bypass. `app.json` `associatedDomains`, App.tsx regex updated, `SessionCard.tsx` drops TinyURL. Verified end-to-end on real device. |
| 002 | Polish iOS share-link preview | Complete (2026-04-28) | Added `generateMetadata` to `golf-scheduler/src/app/session/[id]/page.tsx` with server-side AppSync fetches (session + responses + creator). iMessage preview tile now shows session title, formatted date, and In/Maybe/Out summary. Polished the page UI itself for the Safari/non-iOS fallback case. Verified in iMessage. |
| 003 | Polish the share message format | Complete (2026-04-28) | Refactored `SessionCard.tsx::handleShareStatus` — players bucketed by status with counts (In one-per-line, Maybe/Out comma-joined), tighter date format, dropped redundant tag/creator/per-player-status emojis, kept ⛳ on the title and 🚶/🛺 transport emojis on IN players for personality. URL is bare on its own line (rich preview tile from iteration 002 carries the visual). Verified via Expo Go on real device. |

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
- `URL_SHORTENING_FEATURE.md` — URL shortening feature (now superseded by iteration 001)

## Notes

- Each iteration follows the compound engineering loop:
  `start-iteration` → build → ADRs as needed (`record-decision`) →
  `complete-iteration` (implementation record + learnings + architecture update).
- ADRs live in `docs/decisions/NNN-short-title.md`.
- Architecture is a description of what _is_, not a changelog —
  see `docs/architecture/overview.md`.
- Run all `git` commands in your terminal, not via the agent's bash sandbox —
  the sandbox can leave stale `.git/index.lock` files due to FUSE permissions.
- See `.agents/skills/` for the four skills that drive this loop.
