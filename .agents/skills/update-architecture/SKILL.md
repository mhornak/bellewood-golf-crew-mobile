---
name: update-architecture
description: Update docs/architecture/overview.md to reflect the current state of the app. Use after any change that affects components, hooks, navigation, GraphQL operations, contexts, or external dependencies.
---

# Update Architecture

## When to Use

After any change to the app's architecture — new screens or components,
new hooks, new contexts, new GraphQL operations, new navigation routes,
or new external dependencies.

## Steps

1. Read the current `docs/architecture/overview.md`.
2. Update it to reflect the current state of the system.
3. **This is not a changelog.** The doc should always describe what _is_,
   never what _changed_. If a section is no longer accurate, rewrite it,
   don't append.
4. Update specifically:
   - **Client section** if components, hooks, or navigation changed.
   - **Backend integration section** if GraphQL operations, AppSync
     config, or auth flow changed.
   - **Build & deploy section** if `eas.json` profiles or scripts changed.
   - The system diagram (if present) if component relationships changed.
5. If a new convention emerged that's worth enforcing across the codebase,
   also update `docs/conventions.md`.

## Why This Matters

An out-of-date architecture doc is worse than no doc at all — it actively
misleads. Keeping it current is the small ongoing tax that makes onboarding
new contributors (and agents) cheap.
