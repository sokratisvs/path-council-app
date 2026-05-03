# Feature 04: Arena — Live Agent Debate View

Read `ai-workflow-rules.md` before starting.

We are building the arena screen that displays the live agent debate as agent calls complete. Agents run in parallel but their cards appear sequentially as results arrive, creating a sense of a council deliberating in real time.

## Screen Entry

The arena screen receives:

```ts
interface ArenaProps {
  config: SetupConfig
  profile: UserProfile
  onComplete: (outputs: AgentRunResult) => void
}

interface AgentRunResult {
  agentOutputs: Record<AgentId, AgentCallResult>
  consensusScores: PathConsensus[]
  synthesisOutput: SynthesisOutput
}

interface AgentCallResult {
  agentId: AgentId
  content: string
  error?: string
}
```

On mount, the arena screen immediately kicks off the full agent run sequence:
1. Launch all active agent calls in parallel via `Promise.allSettled`
2. As each settles, update that agent's card from `thinking` → `complete` (or `error`)
3. After all agents settle, run the scoring pass
4. After scoring, run the synthesis agent call
5. After synthesis completes, call `onComplete` and transition to results

## Layout

Centered column, `max-w-2xl`. Header section at top. Progress bar below header. Stacked agent turn cards below progress bar.

## Header

- Label: "Agent council — in session"
- Title: dynamically updates as the run progresses:
  - While agents are running: "Council deliberating…"
  - Scoring pass: "Scoring agent consensus…"
  - Synthesis running: "Synthesising recommendations…"
  - Complete: "Council complete"

## Progress Bar

Thin (3px) horizontal bar spanning full width. Fills left to right as the session advances.

Progress stages and weights:

| Stage                        | Progress value |
| ---------------------------- | -------------- |
| Starting                     | 0%             |
| Each agent completing (×n)   | Proportional to `50 / activeAgents.length` per agent |
| Scoring pass complete        | 65%            |
| Synthesis running            | 80%            |
| Synthesis complete           | 100%           |

Progress label above the bar: short text matching the current stage.

## Agent Turn Cards

One card per active agent. Cards appear in this order: Realist → Optimist → Critic → Strategist → AI Coach.

**Thinking state (while awaiting response):**
- Left border: 2px solid in agent's identity color
- Agent avatar: 28px circle, `bg-agent-{id}-dim` background, agent initial letter in `text-agent-{id}` color
- Agent name in `text-primary`
- Role badge: agent role description in `text-muted` with `bg-subtle` background, `rounded-xl`
- Body: three pulsing dots in agent identity color with CSS animation

**Complete state:**
- Same layout as thinking state
- Body: full agent response text in `text-secondary`, `text-sm`, `leading-relaxed`
- Subtle fade-in animation when content appears (CSS `opacity` transition, 300ms)

**Error state:**
- Same layout
- Body: error message in `text-danger` — "This agent encountered an error and was skipped."

**Synthesis agent card:**
- Appears after all specialist agents complete and scoring finishes
- Uses `--agent-synthesis` color
- Label: "The Synthesiser"
- Shows a brief loading state while synthesis runs

## Scoring Pass UI

After all agent cards show complete, show a brief interstitial below the last agent card:

- Label: "Scoring consensus…"
- Subtle progress dots animation
- Duration: however long the scoring LLM call takes
- Replace with a brief "Consensus scored" confirmation before synthesis begins

## Running the Agents

The arena component drives all LLM calls. It does not contain the prompt logic — it calls functions from `lib/agents/` and `lib/providers/`.

Sequence:

```ts
// 1. Parallel agent calls
const results = await Promise.allSettled(
  activeAgents.map(agentId => callAgent(agentId, config, profile, personas))
)

// 2. Score consensus
const consensusScores = await scoreConsensus(results, config)

// 3. Synthesis
const synthesisOutput = await runSynthesis(results, consensusScores, config, profile)
```

Each `callAgent` result updates the relevant card's state as it settles.

## Files to Create

- `components/arena/arena-screen.tsx` — root arena component, owns the run sequence
- `components/arena/agent-card.tsx` — individual agent turn card (thinking / complete / error states)
- `components/arena/progress-header.tsx` — header + progress bar + stage label
- `components/arena/scoring-interstitial.tsx` — brief UI between agent completion and synthesis

## Check When Done

- Arena screen mounts and immediately starts agent calls
- Each agent card transitions from thinking → complete as results arrive
- Error state renders correctly for failed agents without aborting the session
- Progress bar advances through all stages correctly
- Scoring interstitial appears and resolves before synthesis card appears
- `onComplete` is called with the full `AgentRunResult` after synthesis finishes
- `npm run build` passes
