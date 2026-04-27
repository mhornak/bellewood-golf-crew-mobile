---
name: complete-iteration
description: Close out an iteration. Use after finishing a feature, refactor, or non-trivial bug fix. Updates the iteration record, creates a paired learnings doc, refreshes architecture if needed, and moves the entry to Completed in the backlog.
---

# Complete Iteration

## When to Use

After finishing the work described in an iteration record under
`docs/implementation/NNN-*.md`.

## Steps

### 1. Run quality gates

- `npx tsc --noEmit` — must pass.
- Manually smoke-test the affected flows in Expo Go or the dev client.
- If the change touches a release-bound surface, build a TestFlight
  preview via the `eas-testflight-build` skill before closing out.

### 2. Close out the implementation record

Open `docs/implementation/NNN-*.md` and:

1. Set **Status** to `Complete`.
2. Add the date completed.
3. Add these sections:
   - **What We Actually Built**: What was delivered. May differ from plan.
   - **What Changed From Plan**: Any deviations and why.
   - **Test / Verification Coverage**: How the change was verified
     (typecheck, manual flows, TestFlight build, etc.).

### 3. Create the learnings doc

Create `docs/learnings/NNN-iteration-title-learnings.md` with:

- **What Worked**: Approaches, tools, or patterns that were effective.
- **What Didn't Work**: Problems encountered, dead ends.
- **Patterns That Emerged**: Reusable patterns worth codifying.
- **What We'd Do Differently**: Hindsight improvements.

### 4. Update architecture if it changed

If new components, hooks, contexts, navigation routes, GraphQL operations,
or external dependencies landed, run the `update-architecture` skill so
`docs/architecture/overview.md` reflects the current system.

### 5. Update the backlog

In `docs/implementation/backlog.md`:

- Move the iteration from **In Progress** to **Completed**.
- Add or refine **Remaining** entries based on what surfaced during the work.

### 6. Update AGENTS.md or convention docs (only if a new pattern emerged)

If the iteration produced a reusable convention worth enforcing, add it to
`docs/conventions.md` or — if it should always be in agent context — to the
relevant section of `AGENTS.md`. Keep `AGENTS.md` under 60 lines; prefer
`docs/conventions.md` for anything detailed.
