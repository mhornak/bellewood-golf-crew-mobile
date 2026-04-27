---
name: record-decision
description: Record an architecture decision (ADR). Use when making a significant design choice — technology, pattern, approach, or trade-off — that future contributors will want to understand.
---

# Record Decision

## When to Use

When making a significant design choice — a technology, pattern, library,
trade-off, or "no" decision (deferring or rejecting an option).

If the choice is small or local (e.g. naming a single function, picking a
loop style), it doesn't need an ADR. ADRs are for decisions that ripple
beyond a single file.

## Steps

1. Read existing decisions in `docs/decisions/` to determine the next
   number (zero-padded, three digits — `001-...`, `002-...`, etc.).
2. Create `docs/decisions/NNN-short-title.md` with these sections:
   - **Date**: When the decision was made (YYYY-MM-DD).
   - **Status**: `Accepted` | `Superseded` | `Deprecated`.
   - **Context**: What problem or question prompted this decision. What
     constraints or alternatives were on the table?
   - **Decision**: What was decided and why.
   - **Consequences**: Positive, negative, and future implications.
   - **References**: (optional) Links to research, docs, GitHub issues,
     or prior art.
3. If the decision affects the app's architecture, run the
   `update-architecture` skill to keep `docs/architecture/overview.md`
   in sync.

## Why This Matters

Decisions that aren't written down get re-litigated. ADRs make it cheap
for a future contributor (human or agent) to understand _why_ the code
looks the way it does, especially for "no" decisions where there's no
code artifact.
