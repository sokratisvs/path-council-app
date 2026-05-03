# Feature 02: Setup Screen

Read `ai-workflow-rules.md` before starting.

We are building the setup screen where users choose a provider, enter their API key, select a model, configure the agent council, and assign personas to agents.

## Screen Entry

The setup screen is the first screen shown when no saved session exists. If a saved session is detected in localStorage (via `lib/storage/session.ts`), the setup screen shows a revisit banner before the provider section. See Feature 11 (session storage) for the banner behaviour — for now, render a placeholder `<RevisitBanner />` that is always hidden.

## Layout

Centered column, `max-w-lg`, padded vertically. Sections separated by a subtle divider. No card wrapper around the whole screen — whitespace is the container.

## Section 1: Provider Selection

Heading: "Choose your AI provider"

Display six provider cards in a responsive grid (`grid-cols-3` on md, `grid-cols-2` on sm):

| Provider  | Display name | Subline          |
| --------- | ------------ | ---------------- |
| anthropic | Anthropic    | Claude           |
| openai    | OpenAI       | GPT-4o           |
| google    | Google       | Gemini           |
| mistral   | Mistral      | Mistral          |
| groq      | Groq         | Llama / fast     |

Each card: `bg-surface` background, `border-default` border, `rounded-2xl`. Selected state: `border-brand` with `bg-brand-dim` background. One card can be selected at a time.

## Section 2: API Key and Model

Visible only after a provider is selected.

**API key input:**
- Password field by default, toggle to show/hide
- Label text pulled from the provider config (e.g. "Anthropic API key (sk-ant-…)")
- Subtext: where to get the key (e.g. "console.anthropic.com — session only, never stored")
- Monospace font (`font-mono`) for the input value
- Key is stored in React state only — never written to localStorage

**Model selector:**
- Dropdown populated from the provider's model list
- Default selection is the provider's recommended model
- See `lib/providers/` for the model lists per provider

**Provider model lists:**

| Provider  | Models                                                    | Default                  |
| --------- | --------------------------------------------------------- | ------------------------ |
| anthropic | claude-opus-4-5, claude-sonnet-4-5, claude-haiku-4-5     | claude-sonnet-4-5        |
| openai    | gpt-4o, gpt-4o-mini, gpt-4-turbo                         | gpt-4o                   |
| google    | gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash       | gemini-2.0-flash         |
| mistral   | mistral-large-latest, open-mixtral-8x22b                 | mistral-large-latest     |
| groq      | llama-3.3-70b-versatile, mixtral-8x7b-32768              | llama-3.3-70b-versatile  |

## Section 3: Agent Council Configuration

Heading: "Configure your agent council"
Subtext: "Each agent analyses your profile from a different angle. Toggle agents on or off and assign a persona to each."

Render one agent config row per agent (5 total). Each row:

- Left: agent color dot (8px circle using `--agent-{id}` color) + agent name in `text-primary` + role description in `text-muted`
- Right: active toggle (checkbox or switch), persona selector dropdown

**Active toggle:** agents are all active by default. At least two agents must remain active — if a user tries to deactivate a third, show a tooltip: "Keep at least 2 agents active."

**Persona selector:**
- Dropdown showing "Default" plus the curated personas for that agent role
- Persona options are defined in `lib/agents/personas.ts`
- "Default" means the agent's base system prompt is used with no persona overlay
- Selecting a persona replaces the system prompt intro with the persona override

The synthesis agent is not shown in the council config — it always runs and is not configurable.

## Persona Options Per Agent

**Realist:**
- Default
- Operator who bootstrapped and sold a company
- Ex-McKinsey partner, now operating advisor
- Serial technical founder, 3 exits

**Optimist:**
- Default
- Angel investor who bets on people, not plans
- Talent scout at a tier-1 technology company
- Career coach specialising in mid-career transitions

**Critic:**
- Default
- Burned-out founder who rebuilt from scratch
- Hiring manager who has reviewed 500+ candidates
- Executive coach who works with high-performing people

**Strategist:**
- Default
- VC partner who thinks in 10-year compounding arcs
- Product leader who ships in weeks, not quarters
- Systems thinker and published author

**AI Coach:**
- Default
- AI researcher who applies tools to real workflows daily
- Indie hacker who replaced a team of three with AI tools
- Educator who teaches AI literacy to non-technical professionals

## Validation

On "Continue" click:
1. A provider must be selected.
2. The API key field must not be empty.
3. At least two agents must be active.

If validation fails, show an inline error message below the relevant section. Do not use toast notifications.

## Continue Button

Full-width at the bottom of the screen. Label: "Start questionnaire →"

On success, passes the following to the parent shell:

```ts
interface SetupConfig {
  provider: ProviderId
  apiKey: string
  model: string
  activeAgents: AgentId[]
  agentPersonas: Record<AgentId, string | null>
}
```

## Files to Create

- `components/setup/setup-screen.tsx` — root setup screen component
- `components/setup/provider-card.tsx` — individual provider card
- `components/setup/agent-council-config.tsx` — agent council configuration section
- `components/setup/agent-config-row.tsx` — single agent config row with toggle and persona selector
- `lib/providers/config.ts` — provider metadata: display names, model lists, key labels, key notes, API endpoint configs

## Check When Done

- Provider selection, API key entry, model selector, and agent council config all work
- Persona selector renders the correct options per agent
- Validation blocks continuation and shows appropriate messages
- API key field toggles between hidden and visible
- Setup config is passed correctly to the parent shell on continue
- `npm run build` passes
