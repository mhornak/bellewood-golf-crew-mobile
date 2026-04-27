---
name: start-iteration
description: Start a new iteration of work in this repo. Use at the beginning of any new unit of work — a feature, a refactor, or a non-trivial bug fix. Creates the iteration record in docs/implementation/NNN-*.md and adds it to the backlog.
---

# Start Iteration

## When to Use

At the beginning of a new unit of work — a feature, screen, refactor,
or non-trivial bug fix.

## Steps

1. Read `docs/implementation/backlog.md` and the existing iteration files
   in `docs/implementation/` to determine the next iteration number
   (zero-padded, three digits — `001`, `002`, `017`, etc.).
2. Create `docs/implementation/NNN-iteration-title.md` with these sections:
   - **Date**: Today's date (YYYY-MM-DD)
   - **Status**: In Progress
   - **Goal**: One sentence describing the objective
   - **What We Set Out to Build**: Bullet list of planned deliverables
   - **Architecture Notes**: (optional) Anything relevant about how this
     fits into the existing app — affected components, new hooks, GraphQL
     additions, navigation changes, etc.
3. Update `docs/implementation/backlog.md`: move/add the entry to the
   "In Progress" section.
4. Use the TodoList tool to track step-by-step work within the session.
5. Verify the starting state is green: `npx tsc --noEmit` should pass
   before making changes.

## Why This Matters

A written goal forces clarity before code is touched. The iteration record
also becomes the artifact that the `complete-iteration` skill closes out,
ensuring every unit of work leaves both an implementation record and a
learnings doc behind.
