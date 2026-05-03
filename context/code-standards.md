# Code Standards

## General

- Keep modules small and single-purpose
- Fix root causes — do not layer workarounds
- Do not mix unrelated concerns in one component or function
- Respect the system boundaries defined in `architecture.md`
- Every file should be nameable by the single responsibility it owns

## TypeScript

- Strict mode is required throughout
- Avoid `any` — use explicit interfaces or narrowly scoped generics
- All agent definitions, session schemas and provider adapter contracts must be typed using the interfaces in `architecture.md`
- Validate and parse LLM JSON responses at the boundary before trusting them — use a safe parse helper that returns `null` on failure rather than throwing
- Use `interface` for object contracts; use `type` for unions and mapped types

## Next.js

- Default to server components
- Add `use client` only where browser interactivity, hooks, or localStorage access require it
- The main compass app shell and all its children are client components — this is intentional and documented
- No API routes are needed; all LLM calls are client-side with user-supplied keys
- Keep `app/page.tsx` as a thin shell that mounts the top-level compass state machine

## React

- Top-level screen state lives in one root state machine component (`CompassApp`)
- Each screen (`Setup`, `Questionnaire`, `Arena`, `Results`, `Revisit`) is a self-contained component receiving props from the root
- Do not use global state libraries — React state and props are sufficient for this app's scope
- Avoid prop drilling beyond two levels — pass a callback or use a small context for deeply shared state (e.g. provider config)

## Styling

- Use CSS custom property tokens defined in `globals.css` — no hardcoded hex values
- Reference tokens through Tailwind utility names defined in `ui-context.md`
- Border radius scale: `rounded-xl` for tags/pills/badges, `rounded-2xl` for cards and panels, `rounded-3xl` for modals and overlays
- Animation: use Tailwind `transition` and `duration-*` utilities for state transitions; use `@keyframes` in globals.css for the arena spinner and agent entry animations
- Dark only — no light mode variants anywhere

## LLM Provider Layer

- Each provider lives in its own file under `lib/providers/`
- All adapters implement the `LLMAdapter` interface — no provider-specific logic leaks outside its adapter file
- Use `Promise.allSettled` for parallel agent calls — never `Promise.all` (one agent failure must not abort the whole council)
- Parse and sanitise every LLM response before using it — strip markdown fences, handle empty responses, handle rate limit errors gracefully
- Log agent errors to console in development; surface a graceful fallback message in the UI

## Agent and Scoring Layer

- Agent definitions live in `lib/agents/definitions.ts`
- Persona libraries live in `lib/agents/personas.ts`
- System prompt builder functions are pure functions — no side effects
- The disagreement scorer lives in `lib/scoring/consensus.ts`
- The synthesis prompt builder lives in `lib/agents/synthesis.ts`
- Challenge prompt builders live in `lib/agents/challenge.ts`

## Session Storage

- All localStorage access goes through `lib/storage/session.ts`
- Exported functions: `saveSession`, `loadSession`, `clearSession`, `hasSavedSession`, `getDaysSinceSaved`
- Never access `localStorage` directly in components — always use the storage helpers
- Guard all localStorage access with `typeof window !== 'undefined'` checks
- Session schema version is stored alongside data — if version mismatches on load, clear and prompt a fresh start

## Component Patterns

- Setup screen components live in `components/setup/`
- Questionnaire step components live in `components/questionnaire/`
- Arena components live in `components/arena/`
- Results components live in `components/results/`
- Shared primitives (tag selector, step nav, progress dots, copy button) live in `components/shared/`
- Never import arena or results components into setup or questionnaire — dependency direction is always downward through the flow

## File Naming

- Use kebab-case for all files and directories
- Name files after the responsibility they own: `consensus-scorer.ts`, `anthropic-adapter.ts`, `agent-definitions.ts`, `challenge-prompt.ts`
- Do not suffix files with their type (`button-component.tsx` → `button.tsx`)

## Error Handling

- Wrap all provider `call()` invocations in try/catch
- Return a typed `Result<T, Error>` shape from the provider layer — never let LLM errors bubble as uncaught exceptions
- If an agent fails, mark its output as `{ error: true, agentId }` and continue — the synthesis agent must handle partial agent results gracefully
- Show per-agent error states in the arena view rather than aborting the whole session
