# AI Workflow Rules

## Approach

This project is built incrementally using a spec-driven workflow. Context files define what to build, how to build it, and what the current state of progress is. Always implement against these specs — do not infer or invent behaviour from scratch.

## Scoping Rules

- Work on one feature unit at a time
- Prefer small, verifiable increments over large speculative changes
- Do not combine unrelated system boundaries in a single implementation step

## When to Split Work

Split an implementation step if it combines:

- UI changes and LLM orchestration logic
- Agent definition changes and scoring logic
- Provider adapter changes and component changes
- Session storage logic and results rendering
- Behaviour that is not clearly defined in the context files

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behaviour not defined in the context files
- If a requirement is ambiguous, resolve it in the relevant context file before implementing
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing

## Protected Files

Do not modify generated third-party components unless explicitly instructed:

- `components/ui/*` — shadcn/ui components
- Any third-party library internals

Project-specific styling, layout and feature logic must be implemented in app-level components rather than modifying foundation components. Only modify these files when a task explicitly requires it.

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes affect:

- System architecture or module boundaries
- Session storage schema
- Agent definitions, persona libraries, or scoring logic
- Code conventions or standards
- Feature scope or behaviour

Progress state must reflect the actual state of the implementation, not the intended state.

## LLM Call Safety

- Never hardcode an API key anywhere in the codebase
- Never log API keys to console even in development
- If a provider call fails, record the error and continue — never let one failed agent call abort the whole session
- Test with a minimal prompt before wiring full agent system prompts — verify the adapter returns clean text before building on top of it

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work accurately
4. `npm run build` passes with no TypeScript errors
5. The feature is testable manually in the browser without needing server infrastructure
