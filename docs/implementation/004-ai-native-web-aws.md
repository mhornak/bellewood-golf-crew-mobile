# Iteration 004 — AI Native the Web + AWS Repos

**Date**: 2026-04-28
**Status**: Complete
**Completed**: 2026-04-28

## Goal

Apply the AI Native Repos Recommendations to `golf-scheduler` (web) and
`golf-scheduler-aws` (CDK backend). Web gets the full mobile-equivalent
treatment (AI Native + compound engineering); AWS gets lightweight AI
Native only.

## Background

Iterations 001–003 lived primarily in `golf-scheduler-mobile` because
that's where the AI Native + compound engineering scaffolding existed.
Iteration 001 spilled into the web repo (AASA + fallback page); iteration
002 was almost entirely web. Both worked, but the lack of a per-repo
compound engineering setup in the web repo meant iteration records and
learnings always lived "across the fence" in mobile, which got awkward
for web-only iterations like 002.

This iteration evens the playing field: any future repo-internal work
on either web or AWS gets first-class scaffolding.

## What We Set Out to Build

### `golf-scheduler` (web) — full setup

- `AGENTS.md` (≤60 lines, tailored to Next.js 15 / App Router / Tailwind / AWS Amplify v6)
- `CLAUDE.md` symlink → `AGENTS.md`
- `.agents/skills/` with the four compound engineering skills
  (`start-iteration`, `complete-iteration`, `record-decision`,
  `update-architecture`) plus `skill-hygiene`
- `.agents/commands/.gitkeep`
- `.claude/skills`, `.claude/commands`, `.cursor/commands` symlinks
- `docs/architecture/overview.md`, `docs/conventions.md`, `docs/testing.md`
- `docs/decisions/.gitkeep`, `docs/learnings/.gitkeep`
- `docs/implementation/backlog.md`
- Quality gates in skills are tailored to web: `npm run lint` for
  start-iteration, `npm run lint && npm run build` for complete-iteration.

### `golf-scheduler-aws` — lightweight setup

- `AGENTS.md` (≤60 lines, tailored to CDK v2 / TypeScript / AppSync / DynamoDB)
- `CLAUDE.md` symlink → `AGENTS.md`
- `.agents/skills/skill-hygiene/SKILL.md` only (no compound engineering loop)
- `.agents/commands/.gitkeep`
- `.claude/skills`, `.claude/commands`, `.cursor/commands` symlinks
- `docs/architecture.md` (flat file, not folder — no need for sub-pages yet)
- `docs/conventions.md`
- No `docs/implementation/`, `docs/decisions/`, `docs/learnings/` —
  promoted to compound engineering only when iterations frequency justifies.

## Architecture Notes

- **Cross-repo iteration tracking convention** — iterations that span
  multiple repos continue to be tracked primarily in the mobile repo
  (where they originate from a product perspective). Web-only
  iterations going forward will be tracked in the web repo's own
  backlog with their own 001 numbering. AWS work is tracked
  ad-hoc in commit messages until / unless we add compound engineering
  there too.
- **Per-repo quality gate differs** — mobile uses `npx tsc --noEmit`,
  web uses `npm run lint && npm run build`, AWS would use
  `npm run build && npm run test` if/when compound engineering lands.
- This iteration's record lives in mobile per the cross-repo
  convention (same as 001, 002).

## What We Actually Built

**`golf-scheduler` (web) — full setup landed:**

- `AGENTS.md` (57 lines, under the 60-line cap), tailored to the
  Next.js 15 / App Router / Tailwind / AWS Amplify stack.
- `CLAUDE.md` symlink → `AGENTS.md`.
- `.agents/skills/` populated with five skills:
  `start-iteration`, `complete-iteration`, `record-decision`,
  `update-architecture`, `skill-hygiene`. The four compound
  engineering skills are tailored to web quality gates
  (`npm run lint`, `npm run build`).
- `.agents/commands/.gitkeep`.
- Symlinks: `.claude/skills`, `.claude/commands`, `.cursor/commands`
  all pointing into `.agents/`.
- `docs/architecture/overview.md` — full system architecture with
  routing, data layer, components, build & deploy, cross-repo notes.
- `docs/conventions.md`, `docs/testing.md`.
- `docs/decisions/.gitkeep`, `docs/learnings/.gitkeep`.
- `docs/implementation/backlog.md` — empty backlog ready for
  web-only iteration 001 to land.

**`golf-scheduler-aws` — lightweight setup landed:**

- `AGENTS.md` (54 lines), tailored to CDK v2 / TypeScript / AppSync /
  DynamoDB. Includes `cdk diff`, `cdk deploy`, `cdk synth` commands.
- `CLAUDE.md` symlink → `AGENTS.md`.
- `.agents/skills/skill-hygiene/SKILL.md` only.
- `.agents/commands/.gitkeep`.
- Symlinks: `.claude/skills`, `.claude/commands`, `.cursor/commands`.
- `docs/architecture.md` (flat, not a folder) — DynamoDB single-table
  design, AppSync setup, resolver structure, deploy notes.
- `docs/conventions.md` — CDK / resolver / deploy conventions.
- No `docs/implementation/`, `docs/decisions/`, `docs/learnings/`
  folders — promoted to compound engineering only when iteration
  frequency justifies.

## What Changed From Plan

The web AGENTS.md came in at 67 lines on first draft, over the 60-line
cap. Trimmed mid-iteration by compressing the Compound Engineering
section into a single paragraph (instead of four numbered steps),
collapsing the Documentation references onto two lines, and combining
Code Layout entries. Final 57 lines. No content lost — just denser.

## Test / Verification Coverage

- `wc -l AGENTS.md` for both repos confirmed under 60 (57 web, 54 AWS).
- `find` walk verified file tree matches the plan in both repos.
- `ls -la .claude/ .cursor/` in both repos confirmed all symlinks
  resolve and point at `.agents/`.
- `head` of `CLAUDE.md` in both repos confirmed it surfaces
  `AGENTS.md` content via the symlink.
- `git status --short` in both repos shows the AI Native scaffolding
  as untracked, ready for clean self-contained commits.
- No code-level verification needed — this iteration is meta-tooling
  scaffolding, not feature work.
