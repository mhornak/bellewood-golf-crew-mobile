---
name: skill-hygiene
description: After creating or modifying any skill, verify it exists in .agents/skills/ (canonical location). If found elsewhere, move it and update symlinks.
---

# Skill Hygiene

## When to Run

After any skill creation, modification, or compound engineering reflection.

## Steps

1. Check if the skill exists in `.agents/skills/`.
2. If found in `.claude/skills/`, `.cursor/skills/`, or other locations instead:
   - Move the skill to `.agents/skills/`.
   - Ensure the symlinks `.claude/skills → ../.agents/skills` and (if applicable) any tool-specific skill symlinks point at the canonical location.
3. Verify all symlinks are intact (`ls -la .claude/ .cursor/`).
4. Report any skills found outside the canonical location.

## Why This Matters

Each tool defaults to writing skills in its own folder. Without enforcement,
skills scatter across `.claude/skills/`, `.cursor/skills/`, and `.agents/skills/`,
making maintenance difficult and causing potential duplication issues.

## Repo-Specific Notes

This repo uses the `.agents/` canonical layout described in `AGENTS.md`. The
expected symlinks are:

- `.claude/skills` → `../.agents/skills`
- `.claude/commands` → `../.agents/commands`
- `.cursor/commands` → `../.agents/commands`
- `CLAUDE.md` → `AGENTS.md`

If any of these are missing or broken, recreate them with `ln -s`.
