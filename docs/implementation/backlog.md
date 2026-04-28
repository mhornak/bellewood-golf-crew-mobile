# Iteration Backlog

The planned, in-progress, and completed iterations for Bellewood Golf Crew.
Each iteration gets its own `NNN-*.md` file in this folder when work begins
(via the `start-iteration` skill), plus a paired entry in `docs/learnings/`
when the iteration completes (via the `complete-iteration` skill).

## In Progress

| # | Title | Scope | Notes |
|---|-------|-------|-------|
| 002 | Polish iOS share-link preview | Add `generateMetadata` to `golf-scheduler/src/app/session/[id]/page.tsx` and polish the page itself. Server-fetch the session so the iOS Messages rich link preview shows the title, date, and player count. Web-only — no mobile rebuild required. | Verify by re-sharing a session and looking at the iMessage preview bubble. |

## Remaining

| # | Title | Scope | Dependencies |
|---|-------|-------|--------------|
| 003 | Polish the share message format | Clean up `golf-scheduler-mobile/src/components/SessionCard.tsx` `handleShareStatus` — better hierarchy in the message body, smarter player ordering (confirmed first, then undecided, then out), grammar fixes ("1 player confirmed"), tighter date format. Mobile-only; native rebuild not required. | 002 (we'll have a clearer picture of what the message + preview look like together). |

## Completed

| # | Title | Status | Summary |
|---|-------|--------|---------|
| 001 | iOS Universal Links | Complete (2026-04-28) | Replaced TinyURL+custom-scheme deep linking with iOS Universal Links served from `main.d2m423juctwnaf.amplifyapp.com`. AASA via Next.js Route Handler (not `public/`) to avoid Amplify's CloudFront bypass. `app.json` `associatedDomains`, App.tsx regex updated, `SessionCard.tsx` drops TinyURL. Verified end-to-end on real device. |

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
