# Feature 07: Results Screen

Read `ai-workflow-rules.md` before starting.

We are building the results screen. It renders the three recommended paths from the synthesis output, each with consensus scores, agent voices, AI advantage notes, 30/60/90-day milestones, mentor prompts, and a challenge mode entry point.

## Screen Entry

The results screen receives:

```ts
interface ResultsProps {
  agentResults: Record<AgentId, AgentCallResult>
  consensusScores: PathConsensus[]
  synthesis: SynthesisOutput
  config: SetupConfig
  profile: UserProfile
  onRestart: () => void
}
```

## Layout

Centered column, `max-w-2xl`. Summary section at top. Three path cards below. Agent debate log toggle at bottom. Restart button at bottom.

## Summary Section

- Label: "Your situation in one read"
- Body: `synthesis.summary` — `text-primary`, `text-base`, `leading-relaxed`
- Divider below

- Label: "What you bring"
- Pills row: `synthesis.strengths` — each as a `bg-subtle` `text-secondary` pill, `rounded-xl`

- Label: "Watch out for"
- Pills row: `synthesis.blindSpots` — each as a `bg-danger-dim` `text-danger` pill, `rounded-xl`

- Divider below

## Path Cards

Three path cards, one per `synthesis.paths`, ordered by rank.

The top-ranked card (rank 1) uses `border-brand` border instead of `border-default`.

### Path Card Structure

**Header row:**
- Rank badge: "1st choice" / "2nd choice" / "3rd choice" — `bg-subtle` `text-muted` `rounded-xl` `text-xs`
- Path name: `text-primary` `text-base font-medium`
- Time horizon: `text-muted` `text-sm`

**Consensus score bar:**
- Label: consensus descriptor ("Strong consensus" / "Moderate consensus" / "Speculative") + score ("82/100")
- Bar: full-width, 6px height, `rounded-xl`, `bg-subtle` background
- Fill color: `bg-positive` (80–100), `bg-warning` (50–79), `bg-danger` (0–49)
- Fill width: `{score}%`

**Description:**
- `text-secondary` `text-sm` `leading-relaxed`

**Agent voices:**
- Label: "Agent perspectives"
- One row per agent voice in `path.agentVoices`
- Each row: stance dot (8px circle — `bg-positive` / `bg-muted` / `bg-danger`) + agent name in `text-muted text-xs` + quote in `text-secondary text-xs italic`
- Show all agents, including those who opposed

**AI advantage row:**
- `bg-brand-dim` `rounded-2xl` `p-4`
- Label: "AI advantage" in `text-brand text-xs font-medium uppercase tracking-wide`
- Body: `path.aiAdvantage` in `text-brand text-sm`

**30/60/90-day milestones:**
- Label: "Your roadmap"
- Three rows labelled "30 days", "60 days", "90 days"
- Each row: period label in `text-muted text-xs` + milestone text in `text-secondary text-sm`

**Trade-off:**
- `text-muted text-xs italic` — prefixed with "Trade-off: "

**Action row:**
- "Get mentor prompts" button → expands the mentor prompts section inline below the path card
- "Challenge this path" button → opens the challenge mode panel

## Agent Debate Log

Collapsed by default. Toggle button below the path cards: "Show full agent debate"

When expanded, shows one section per active agent with:
- Agent name + role badge
- Full agent response text

## Restart

"Start over" button at the bottom — calls `onRestart`.

## Files to Create

- `components/results/results-screen.tsx` — root results component
- `components/results/summary-section.tsx` — summary, strengths, blind spots
- `components/results/path-card.tsx` — individual path card with all sub-sections
- `components/results/consensus-bar.tsx` — consensus score bar component
- `components/results/agent-voices.tsx` — agent perspectives rows
- `components/results/milestone-list.tsx` — 30/60/90 roadmap rows
- `components/results/debate-log.tsx` — collapsible full agent debate log

## Check When Done

- All three path cards render with correct data from synthesis output
- Consensus bar fills correctly and uses correct color per score range
- Agent voices show correct stance colors
- AI advantage row renders with brand dim background
- Milestones render all three periods
- Debate log toggles correctly
- Rank 1 card has brand border accent
- `npm run build` passes

---

# Feature 08: Mentor Prompts

Read `ai-workflow-rules.md` before starting.

We are building the mentor prompt pack. For each recommended path, three ready-to-send outreach messages are generated and displayed inline within the path card.

## When Mentor Prompts Are Generated

Mentor prompts are generated on demand when the user clicks "Get mentor prompts" on a path card. They are not generated during the main synthesis run.

This avoids unnecessary API calls for paths the user never engages with.

## Mentor Prompt Generation

`lib/agents/mentor-prompts.ts`

```ts
export async function generateMentorPrompts(
  path: RecommendedPath,
  profile: UserProfile,
  config: SetupConfig
): Promise<MentorPrompt[]>
```

Makes a single LLM call. The system prompt instructs the model to write three outreach messages for someone trying to connect with a mentor or peer in the target path's field. Messages must be specific to the user's background and the path — not generic templates.

The model must respond with JSON only — an array of three `MentorPrompt` objects.

```ts
interface MentorPrompt {
  format: 'cold-email' | 'linkedin' | 'community'
  subject?: string    // Only for cold-email
  message: string
}
```

### Prompt Format Instructions

**Cold email:** Professional but not stiff. Subject line included. 3–4 short paragraphs. References the user's background and the specific path they are pursuing. Ends with a low-friction ask (e.g. "Would you be open to a 20-minute call?").

**LinkedIn note:** 300 characters maximum (LinkedIn connection note limit). First-person. Specific to the path and user background. Not a pitch — a genuine human introduction.

**Community post:** A short forum/Slack/Discord message asking for advice or introductions from people who have pursued this path. Conversational tone. 3–6 sentences.

## Mentor Prompts UI

`components/results/mentor-prompts-panel.tsx`

Appears below the path card when the user clicks "Get mentor prompts". If the prompts have not been generated yet, show a loading state (spinner + "Generating your outreach pack…") while the LLM call runs.

Once loaded, show three sections:

Each section:
- Format label: "Cold email" / "LinkedIn note" / "Community post" — `text-muted text-xs uppercase tracking-wide`
- Subject line (cold email only): `text-secondary text-sm font-medium`
- Message body: `text-secondary text-sm leading-relaxed`, monospace font for authenticity
- "Copy" button — copies the message to clipboard; label toggles to "Copied ✓" for 2 seconds

Cache generated prompts in component state so re-expanding the panel does not re-trigger the LLM call.

## Check When Done

- "Get mentor prompts" triggers the LLM call only once per path
- Loading state shows while the call is in progress
- All three prompt formats render correctly
- Copy button works and shows a brief "Copied" confirmation
- Cold email includes subject line; LinkedIn note; community post uses conversational tone
- `npm run build` passes

---

# Feature 09: Challenge Mode

Read `ai-workflow-rules.md` before starting.

We are building challenge mode. After reviewing a recommended path, users can push back with a written objection. A subset of agents (Realist, Critic, Strategist) responds to the objection — either defending the path, updating it, or conceding.

## Challenge Entry

Each path card has a "Challenge this path" button. Clicking it opens the challenge panel inline below the path card (not a modal).

## Challenge Panel

`components/results/challenge-panel.tsx`

**Input state (before submission):**
- Label: "Push back on this path"
- Description: "Write your objection. The Realist, Critic, and Strategist will respond directly."
- Textarea placeholder: "e.g. I don't think this is realistic given my financial situation, or I've already tried this and it didn't work…"
- "Submit objection" button — disabled while empty

**Loading state:**
- Show three agent mini-cards (Realist, Critic, Strategist) in thinking state while responses arrive in parallel

**Response state:**
- Three agent response cards, one per agent
- Each card shows: agent name + color identifier + outcome badge + response text
- Outcome badge: "Defends" (positive) / "Updates" (warning) / "Concedes" (danger)
- Response text: `text-secondary text-sm leading-relaxed`

After challenge responses appear, show a "Challenge again" button to submit a new objection.

## Challenge LLM Calls

`lib/agents/challenge.ts`

```ts
export async function runChallengeRound(
  path: RecommendedPath,
  objection: string,
  agentResults: Record<AgentId, AgentCallResult>,
  config: SetupConfig
): Promise<AgentChallengeResponse[]>
```

Calls Realist, Critic, and Strategist in parallel (`Promise.allSettled`). Each receives:
- Their original analysis of this path
- The synthesis description of this path
- The user's objection

Each agent must respond with JSON only:

```ts
interface AgentChallengeResponse {
  agentId: AgentId
  outcome: 'defend' | 'update' | 'concede'
  response: string   // 2–4 sentences
}
```

`lib/agents/challenge-prompt.ts` — exports the challenge system prompt builder per agent.

**Realist challenge prompt:** "You previously analysed this person's profile and the path above was part of your assessment. The user has pushed back with the objection below. Decide whether you defend your position with new evidence or reasoning, update your recommendation given valid new information, or concede that the objection reveals a real problem. Respond with a JSON object only: { outcome: 'defend' | 'update' | 'concede', response: '...' }."

**Critic challenge prompt:** Same structure, adapted to the Critic's voice.

**Strategist challenge prompt:** Same structure, adapted to the Strategist's voice.

## Challenge History

Store challenge exchanges in component state. If the user challenges the same path multiple times, show all exchanges chronologically below the path card, newest at the bottom.

## Check When Done

- Challenge panel opens inline below the correct path card
- Objection textarea is required before submission
- All three agents respond in parallel; each card shows correct outcome badge
- Multiple challenge rounds accumulate correctly
- `npm run build` passes

---

# Feature 10: Session Storage and Continuity

Read `ai-workflow-rules.md` before starting.

We are building session persistence via localStorage and the continuity revisit flow that returning users experience.

## Session Storage Helpers

`lib/storage/session.ts`

```ts
const SESSION_KEY = 'life-path-compass-session'
const SESSION_VERSION = 1

export function saveSession(session: CompassSession): void
export function loadSession(): CompassSession | null
export function clearSession(): void
export function hasSavedSession(): boolean
export function getDaysSinceSaved(): number | null
```

All functions guard against `typeof window === 'undefined'`. `loadSession` checks the stored version number — if it mismatches `SESSION_VERSION`, clears and returns `null`. `getDaysSinceSaved` calculates the diff between `session.savedAt` and today in whole days.

**When to save:** Call `saveSession` after the results screen is fully rendered (synthesis complete). Pass the full `CompassSession` object.

**What to save:** Full `CompassSession` as defined in `architecture.md`. The API key is never saved.

## Revisit Banner (Setup Screen)

On setup screen mount, call `hasSavedSession()`. If true, show a `<RevisitBanner />` above the provider section.

`components/setup/revisit-banner.tsx`

Banner content:
- Icon: calendar or clock (Lucide)
- Text: "You have a saved session from {N} days ago. Continue where you left off?"
- "Resume session" button → transitions to the revisit questionnaire screen
- "Start fresh" button → clears the session and proceeds to normal setup
- If `getDaysSinceSaved()` returns 0 or 1, text reads "from today" / "from yesterday"

## Revisit Questionnaire Screen

`components/revisit/revisit-questionnaire-screen.tsx`

A shorter questionnaire — two steps only.

**Step 1 — What changed:**
- Label: "Revisit — step 1 of 2"
- Title: "What has changed since your last session?"
- Textarea: "e.g. I changed jobs, I moved cities, I started a side project, I got clearer on what I want…"
- Tag group: "Progress made" options:
  - Made significant progress on one of my paths
  - Tried something and it didn't work out
  - My situation changed significantly
  - Not much has changed
  - I lost momentum — need a reset

**Step 2 — Progress notes:**
- Label: "Revisit — step 2 of 2"
- Title: "How did the paths play out?"
- Textarea: "Tell us what happened with the recommended paths. Did you follow through? What blocked you? What surprised you?"
- Optional field — can be left blank

On submit, builds a `ContinuityUpdate` object merging the original session profile with the update notes. Passes this to the parent to trigger a new arena run with the augmented profile.

## Continuity Arena Run

When the arena screen receives a continuity run (flagged via a prop), it adapts the agent prompts to reflect that this is a revisit session. Each agent receives:

- The original profile
- The update notes
- Their original output from the previous session

The synthesis prompt for continuity runs produces a `ContinuityReport` instead of a standard `SynthesisOutput`.

`lib/agents/continuity-prompt.ts` — exports the continuity-aware synthesis prompt builder.

## Continuity Results Screen

`components/revisit/continuity-results-screen.tsx`

Renders the `ContinuityReport`:

**Summary section:**
- Label: "What shifted"
- Body: `report.summary`

**Paths still valid:**
- Label: "Still on track"
- List of path names with a positive indicator

**Paths to revisit:**
- Label: "Worth reconsidering"
- List of path names with a neutral indicator

**Updated recommendations:**
- Same path card structure as the main results screen but prefixed with "Updated path"

**One update:**
- Label: "One thing that changed"
- Body: `report.oneUpdate` in italic

After the continuity results, offer "Save updated session" button and "Start fresh" button.

## Files to Create

- `lib/storage/session.ts`
- `components/setup/revisit-banner.tsx`
- `components/revisit/revisit-questionnaire-screen.tsx`
- `components/revisit/continuity-results-screen.tsx`
- `lib/agents/continuity-prompt.ts`

## Check When Done

- `saveSession` correctly serialises and stores the full session (no API key)
- `loadSession` returns `null` on version mismatch and clears stale data
- Revisit banner appears when a saved session exists and handles both "Resume" and "Start fresh" correctly
- Revisit questionnaire collects update notes and builds the correct `ContinuityUpdate` object
- Continuity arena run uses augmented prompts
- Continuity results screen renders all sections of `ContinuityReport`
- `npm run build` passes
