# Conventions

> Coding conventions for Bellewood Golf Crew. Referenced from `AGENTS.md`.

## TypeScript

- Strict mode is on (`tsconfig.json` extends `expo/tsconfig.base` with `"strict": true`).
- Prefer explicit types on exported functions, hooks, and component props.
- Avoid `any`; use `unknown` and narrow when the shape is uncertain.

## React Native components

- Functional components only.
- One screen/component per file under `src/components/`.
- Hooks live in `src/hooks/`; one hook per file, named `use<Thing>.ts`.
- Co-locate styles with the component using `StyleSheet.create`.

## Data layer

- All GraphQL access goes through `src/lib/api.ts` and `src/lib/appsync.ts` —
  do not call the AppSync client directly from components.
- New backend operations: add the query/mutation to `src/lib/api.ts`, then expose
  it through a hook in `src/hooks/`.

## Imports

- Absolute-from-`src` imports are not configured; use relative paths.
- Group imports: third-party, then internal, separated by a blank line.

## File naming

- Components: PascalCase (`SessionCard.tsx`).
- Hooks: camelCase starting with `use` (`useGolfSessions.ts`).
- Utilities/contexts: camelCase or PascalCase matching the export.

## TODO

<!-- Add real conventions as patterns emerge. Ask the agent to extract them: "What patterns have you noticed in this codebase? Add them here." -->
