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
| 003 | Polish the share message format | Clean up `golf-scheduler-mobile/src/components/SessionCard.tsx` `handleShareStatus` — better hierarchy in the message body, smarter player ordering (confirmed first, then undecided, then out), grammar fixes ("1 player confirmed"), tighter date format. Mobile-only; native rebuild not required. | None remaining. |
| _004?_ | AI-Native the `golf-scheduler` and `golf-scheduler-aws` repos | Apply the AI Native Repo recommendations (AGENTS.md, CLAUDE.md symlink, `.agents/` canonical layout, `.claude/`/`.cursor/` symlinks) to both other repos. Optional compound engineering setup per repo. | None. Can run independently of 003. |

## Completed

| # | Title | Status | Summary |
|---|-------|--------|---------|
| 001 | iOS Universal Links | Complete (2026-04-28) | Replaced TinyURL+custom-scheme deep linking with iOS Universal Links served from `main.d2m423juctwnaf.amplifyapp.com`. AASA via Next.js Route Handler (not `public/`) to avoid Amplify's CloudFront bypass. `app.json` `associatedDomains`, App.tsx regex updated, `SessionCard.tsx` drops TinyURL. Verified end-to-end on real device. |
| 002 | Polish iOS share-link preview | Complete (2026-04-28) | Added `generateMetadata` to `golf-scheduler/src/app/session/[id]/page.tsx` with server-side AppSync fetches (session + responses + creator). iMessage preview tile now shows session title, formatted date, and In/Maybe/Out summary. Polished the page UI itself for the Safari/non-iOS fallback case. Verified in iMessage. |

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
