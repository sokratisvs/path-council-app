# Feature 06: Disagreement Scoring

Read `ai-workflow-rules.md` before starting.

We are building the disagreement scoring layer. After all specialist agents have responded, a lightweight scoring pass extracts each agent's stance toward each potential path and produces a consensus score per path. The synthesis agent uses these scores when ranking the final three recommendations.

## What Scoring Produces

```ts
// lib/scoring/types.ts

export type AgentStance = 'support' | 'neutral' | 'oppose'

export interface AgentPathSentiment {
  agentId: AgentId
  pathName: string
  stance: AgentStance
  quote: string          // Short extracted quote (1 sentence) supporting the stance classification
}

export interface PathConsensus {
  pathName: string
  score: number          // 0–100
  descriptor: 'Strong consensus' | 'Moderate consensus' | 'Speculative'
  supportingAgents: AgentId[]
  opposingAgents: AgentId[]
  neutralAgents: AgentId[]
  agentSentiments: AgentPathSentiment[]
}
```

## Scoring Process

The scorer makes one LLM call using the same provider and API key the user chose. It does not use a separate provider.

### Scorer Prompt

`lib/scoring/scorer-prompt.ts`

The system prompt instructs the model to act as a neutral analyst reading a set of advisor opinions. Given the agent outputs, it must identify which paths each agent mentioned and classify their stance (support / neutral / oppose) with a one-sentence justification quote.

The user message passes all agent outputs as a structured block. Example format:

```
THE REALIST said:
{realist output}

THE OPTIMIST said:
{optimist output}

THE CRITIC said:
{critic output}

THE STRATEGIST said:
{strategist output}

THE AI COACH said:
{aicoach output}
```

The model must respond with JSON only — an array of `AgentPathSentiment` objects. Use `safeParseJSON` on the response.

### Consensus Score Calculation

After parsing the sentiment array, calculate consensus scores in `lib/scoring/calculate.ts`:

```ts
export function calculateConsensus(
  sentiments: AgentPathSentiment[],
  activeAgents: AgentId[]
): PathConsensus[]
```

Algorithm:
1. Collect all unique path names mentioned across sentiments.
2. For each path, count supporting, neutral, and opposing agents.
3. Score formula: `(supportCount * 2 + neutralCount) / (activeAgents.length * 2) * 100`, clamped to 0–100, rounded to nearest integer.
4. Assign descriptor: 80–100 → "Strong consensus", 50–79 → "Moderate consensus", 0–49 → "Speculative".
5. Return a `PathConsensus` array sorted by score descending.

### Main Scorer Function

`lib/scoring/consensus.ts`

```ts
export async function scoreConsensus(
  agentResults: AgentCallResult[],
  config: SetupConfig,
  activeAgents: AgentId[]
): Promise<PathConsensus[]>
```

1. Filter out errored agent results — only score successful outputs.
2. If fewer than two successful agents, return an empty array (cannot score meaningfully).
3. Build the scorer user message from successful agent outputs.
4. Make the LLM call via `getAdapter(config.provider).call(...)` with the scorer system prompt.
5. Parse the response with `safeParseJSON`.
6. If parsing fails, return an empty array — synthesis must handle this gracefully.
7. Calculate consensus scores and return the sorted array.

## Passing Scores to Synthesis

The synthesis agent receives the consensus scores as part of its user message. Format:

```
CONSENSUS SCORES:
{pathName}: {score}/100 — {descriptor} ({supportingAgents} agreed, {opposingAgents} pushed back)
```

If the consensus scores array is empty (scoring failed), the synthesis agent receives no consensus data and must produce recommendations from agent outputs alone. The synthesis prompt must handle this case.

## Files to Create

- `lib/scoring/types.ts`
- `lib/scoring/scorer-prompt.ts`
- `lib/scoring/calculate.ts`
- `lib/scoring/consensus.ts`

## Check When Done

- Scorer makes a single LLM call and returns a parsed sentiment array on success
- `calculateConsensus` produces correctly scored and sorted `PathConsensus` objects
- Score formula is correct: two successful supporting agents out of two active agents → 100
- `safeParseJSON` failure returns empty array without throwing
- Synthesis receives a correctly formatted consensus block in its user message
- `npm run build` passes
