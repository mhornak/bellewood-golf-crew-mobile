# Iteration 004 — AI Native the Web + AWS Repos — Learnings

## What Worked

1. **Asking about scope before scaffolding.** "Full for both" vs "full
   web + lightweight AWS" vs "lightweight for both" was a real
   product decision, not a technical one. Surfacing it via
   `AskUserQuestion` got us to the right scope (web full, AWS
   lightweight) without doing throwaway work.

2. **Mirroring mobile's structure exactly where it made sense.** The
   `.agents/skills/` + symlinks + `docs/` pattern dropped into both
   repos with no surprises. Symlink commands, `.gitkeep` placeholders,
   and the AGENTS.md skeleton all worked first try in both places.

3. **Tailored quality gates per repo.** Web's `start-iteration` /
   `complete-iteration` skills reference `npm run lint` and
   `npm run build` (web's actual scripts), not mobile's
   `npx tsc --noEmit`. Each repo's compound engineering loop runs
   the right command for that stack.

4. **Going lightweight on AWS.** Resisting the temptation to add the
   full compound engineering loop to a repo that gets touched
   quarterly was the right call. AGENTS.md + skill-hygiene + flat
   `docs/` files is enough; we can layer compound engineering on
   later if AWS work picks up.

5. **Cross-repo iteration convention.** Iterations 001, 002, and now
   004 spanned multiple repos. Keeping the iteration record in the
   mobile repo (the "product home") and noting in each AGENTS.md that
   web/AWS-internal iterations live in their own repo is a clean
   split. No iteration record duplication, no ambiguity about where
   to find the goal.

## What Didn't Work

1. **First-draft AGENTS.md was 67 lines.** The 60-line cap from the
   AI Native Repos card felt generous but isn't — once you've got a
   Compound Engineering section, a Skills and Commands section, and
   a few sub-bullets in Code Layout, you blow past 60 fast. Had to
   trim mid-iteration.

2. **No automated check on AGENTS.md length.** The 60-line cap is
   convention, not enforced. Easy to drift over without noticing on
   the next AGENTS.md edit. Worth a quick `make check`-style script
   eventually.

3. **Three uncommitted-changes piles after this iteration.** Mobile
   has the iteration record + backlog + close-out + learnings. Web
   has the full scaffold. AWS has the lightweight scaffold. Three
   separate commits, in three repos. That's the cost of scaffolding
   three repos at once; not really a problem, just worth flagging
   for when the user is hand-driving the git work.

## Patterns That Emerged

1. **AGENTS.md template (~50–60 lines):** Project intro (4–5 lines)
   → Stack (1–2 lines) → Commands (4–5 bullets) → Code Layout (3–5
   bullets) → Documentation references (1–5 lines) → Compound
   Engineering loop (optional, 6–8 lines) → Skills and Commands
   policy (4–5 lines) → Available Skills list (3–6 bullets) → no-
   commands footnote. Holding to this skeleton makes future
   AGENTS.md authoring near-mechanical.

2. **Lightweight vs. full AI Native split.** Lightweight = AGENTS.md
   + symlinks + `skill-hygiene` + flat `docs/`. Full = lightweight +
   the four compound engineering skills + nested `docs/architecture/`
   + `docs/decisions/` + `docs/implementation/` + `docs/learnings/`.
   Pick lightweight for repos with infrequent iterations (CDK, ops),
   full for repos with regular feature work (apps, services).

3. **Per-repo quality gates baked into the skills.** Don't hardcode
   `npx tsc --noEmit` into a generic `start-iteration` template —
   write the skill against the repo's actual package.json scripts.
   Web → `npm run lint`. Mobile → `npx tsc --noEmit`. AWS (when
   compound engineering lands) → `npm run build && npm run test`.

## What We'd Do Differently

1. **Draft AGENTS.md to a target line count from the start.** Aim
   for ~55 lines on first pass. Saves the trim cycle.

2. **Generate the file tree expectation upfront.** Before writing
   any files, list every path that should exist after the iteration.
   Then the verification step is trivial (`find` walks must match
   the list). I more-or-less did this verbally, but a written
   manifest in the iteration record would be tighter.

3. **For lightweight repos, consider a `cdk-deploy` skill at
   minimum.** AWS got just `skill-hygiene`. Adding a `cdk-deploy`
   skill that documents the diff-then-deploy cadence (and the "merge
   to main first" rule) would have negligible cost and would catch
   any future agent that tries to deploy from a branch. Punted for
   now; trivial follow-up.
