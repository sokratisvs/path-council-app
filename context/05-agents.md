# Feature 05: Agent Definitions and Provider Layer

Read `ai-workflow-rules.md` before starting.

We are building the agent definitions, persona library, and provider adapter layer. This is pure logic — no UI. All files live in `lib/`.

## Provider Adapters

Create one adapter file per provider. All adapters implement the same interface.

### Interface

```ts
// lib/providers/types.ts

export interface LLMCallParams {
  apiKey: string
  model: string
  systemPrompt: string
  userMessage: string
  maxTokens?: number
}

export type LLMCallResult =
  | { ok: true; content: string }
  | { ok: false; error: string }

export interface LLMAdapter {
  call(params: LLMCallParams): Promise<LLMCallResult>
}
```

### Adapter Files

`lib/providers/anthropic.ts` — Uses `/v1/messages`. Auth header: `x-api-key`. Version header: `anthropic-version: 2023-06-01`. Response: `data.content[0].text`.

`lib/providers/openai.ts` — Uses `/v1/chat/completions`. Auth: `Authorization: Bearer`. System message as first message in array. Response: `data.choices[0].message.content`.

`lib/providers/google.ts` — Uses `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}`. System instruction via `system_instruction.parts[0].text`. Response: `data.candidates[0].content.parts[0].text`.

`lib/providers/mistral.ts` — Uses `https://api.mistral.ai/v1/chat/completions`. Same shape as OpenAI.

`lib/providers/groq.ts` — Uses `https://api.groq.com/openai/v1/chat/completions`. Same shape as OpenAI.

### Provider Registry

`lib/providers/index.ts` — Exports a `getAdapter(providerId: ProviderId): LLMAdapter` function that returns the correct adapter. Throws if an unknown provider ID is passed.

### Safe Parse Helper

`lib/providers/parse-json.ts` — Exports:

```ts
export function safeParseJSON<T>(raw: string): T | null
```

Strips markdown fences (` ```json ` and ` ``` `), trims whitespace, attempts `JSON.parse`, returns `null` on any failure. Never throws.

---

## Agent Definitions

`lib/agents/definitions.ts`

Define the five specialist agents as an array of `AgentDefinition` objects.

```ts
export type AgentId = 'realist' | 'optimist' | 'critic' | 'strategist' | 'aicoach'

export interface AgentDefinition {
  id: AgentId
  name: string
  color: string          // CSS variable reference e.g. 'var(--agent-realist)'
  role: string           // Short role description shown in the UI
  buildSystemPrompt: (profile: string, personaId: string | null) => string
}
```

**Realist system prompt:**
You are The Realist — a pragmatic career and life advisor. Evaluate what is genuinely achievable for this person given their real constraints, timeline, and current market conditions. Be direct. Ground every claim in reality. Call out wishful thinking. Name one path you think is realistic and one you think is not and explain why. Respond in 4–6 focused sentences.

**Optimist system prompt:**
You are The Optimist — a strengths-focused life advisor. Surface the overlooked strengths, underrated opportunities, and hidden leverage points in this person's profile. Push back constructively on self-limiting beliefs. Name the path you think has the most upside for this person and explain what unlocks it. Respond in 4–6 focused sentences.

**Critic system prompt:**
You are The Critic — a rigorous, unsentimental advisor. Identify the key blind spots, skill gaps, risks, and uncomfortable questions this person is probably avoiding. Do not soften the message — be direct and specific. Name the path you think carries the most risk for this person. Respond in 4–6 focused sentences.

**Strategist system prompt:**
You are The Strategist — a systems-oriented advisor who thinks in compounding advantages. Propose the most powerful move sequence available to this person: what to do first, what to do next, and how the moves compound. Name the path with the best leverage-to-effort ratio. Respond in 4–6 focused sentences.

**AI Coach system prompt:**
You are The AI Coach — an expert in applied AI tools for personal and professional growth. Identify the most specific, actionable ways AI tools can give this person an unfair advantage across their options. Name concrete tools, workflows and use cases — not generic statements about AI. Name the path where AI gives the greatest leverage. Respond in 4–6 focused sentences.

---

## Persona Library

`lib/agents/personas.ts`

Export a `PERSONAS` record mapping each `AgentId` to an array of persona definitions:

```ts
export interface AgentPersona {
  id: string
  label: string
  promptPrefix: (profile: string) => string  // Prepended to the base system prompt
}
```

Each persona `promptPrefix` adds a first-person voice introduction before the base role prompt. Example for Realist / "Operator who bootstrapped and sold":

> You are The Realist, speaking from the perspective of an operator who bootstrapped a company to profitability and sold it. You've made every hiring, product, and runway mistake there is. You have no patience for plans that ignore unit economics, customer behaviour, or execution risk.

Define all personas from `project-overview.md` per agent role (3 personas + default per agent = 4 options each, 20 total).

---

## Agent Caller

`lib/agents/caller.ts`

```ts
export async function callAgent(
  agentId: AgentId,
  config: SetupConfig,
  profile: UserProfile,
  personas: Record<AgentId, string | null>
): Promise<AgentCallResult>
```

1. Get the agent definition from `definitions.ts`
2. Build the system prompt using the agent's `buildSystemPrompt`, passing the selected persona ID
3. Serialise the profile into the user message string
4. Call the adapter via `getAdapter(config.provider).call(...)`
5. Return `{ agentId, content, error? }`

### Profile Serialisation

`lib/agents/profile-serialiser.ts`

```ts
export function serialiseProfile(profile: UserProfile): string
```

Builds a multi-line string of labelled profile fields. Example:

```
Situation: mid-career and looking to grow or pivot
Field: product design
AI usage: I experiment occasionally but not consistently
Energised by: creating things people use and love, building my own thing on my own terms
Frustration: I feel invisible at my current company despite strong output
Vision: Running a small product studio with 3–4 people, working on meaningful problems
Strengths: Systems thinking, visual design, clear communication
Skill gaps: Business development, pricing, networking
Constraints: limited time due to family or caregiving, financial pressure
Target direction: starting or growing my own business
Additional context: Based in a mid-size European city, 8–10 hours per week available
```

---

## Synthesis Agent

`lib/agents/synthesis.ts`

```ts
export async function runSynthesis(
  agentResults: AgentCallResult[],
  consensusScores: PathConsensus[],
  config: SetupConfig,
  profile: UserProfile
): Promise<SynthesisOutput>
```

The synthesis system prompt instructs the model to act as an impartial senior advisor who has just read all the specialist agents' perspectives and the disagreement scores, and must now produce exactly three ranked recommended paths.

The user message passes:
- All agent outputs (labelled by agent name)
- All consensus scores (labelled by path name and score)
- The user's serialised profile

The synthesis model must respond with valid JSON only matching `SynthesisOutput` schema (defined in `architecture.md`). Use `safeParseJSON` on the response.

`lib/agents/synthesis-prompt.ts` — exports the system prompt builder for the synthesis agent.

---

## Files to Create

- `lib/providers/types.ts`
- `lib/providers/anthropic.ts`
- `lib/providers/openai.ts`
- `lib/providers/google.ts`
- `lib/providers/mistral.ts`
- `lib/providers/groq.ts`
- `lib/providers/index.ts`
- `lib/providers/parse-json.ts`
- `lib/agents/definitions.ts`
- `lib/agents/personas.ts`
- `lib/agents/caller.ts`
- `lib/agents/profile-serialiser.ts`
- `lib/agents/synthesis.ts`
- `lib/agents/synthesis-prompt.ts`

## Check When Done

- Each adapter can be called independently with a real API key and returns a clean string response
- `safeParseJSON` returns `null` on malformed input without throwing
- `callAgent` returns a correctly typed result for both success and error cases
- Profile serialiser produces a clean, readable string from a `UserProfile` object
- Synthesis prompt builder produces a valid system prompt string
- `npm run build` passes with no TypeScript errors
