# UI Context

## Theme

Dark only. No light mode. The design language is a clean, dense dark workspace — near-black backgrounds, layered surfaces, and distinct accent colors per agent role. The visual tone should feel like a serious, trustworthy tool, not a chatbot or consumer app.

## Colors

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens via `@theme inline`. Components must use these tokens — no hardcoded hex values or raw Tailwind color classes.

### Base Palette

| Role              | CSS Variable         | Value                       |
| ----------------- | -------------------- | --------------------------- |
| Page background   | `--bg-base`          | `#08080a`                   |
| Surface           | `--bg-surface`       | `#111116`                   |
| Elevated surface  | `--bg-elevated`      | `#18181e`                   |
| Subtle surface    | `--bg-subtle`        | `#1e1e26`                   |
| Default border    | `--border-default`   | `#2a2a35`                   |
| Subtle border     | `--border-subtle`    | `#3a3a48`                   |
| Primary text      | `--text-primary`     | `#f0f0f6`                   |
| Secondary text    | `--text-secondary`   | `#a0a0b8`                   |
| Muted text        | `--text-muted`       | `#606078`                   |
| Faint text        | `--text-faint`       | `#404055`                   |

### Accent Palette

| Role              | CSS Variable          | Value                       |
| ----------------- | --------------------- | --------------------------- |
| Brand accent      | `--accent-brand`      | `#7c6ffc`                   |
| Brand dim         | `--accent-brand-dim`  | `rgba(124, 111, 252, 0.12)` |
| Brand text        | `--accent-brand-text` | `#a89fff`                   |
| Positive          | `--accent-positive`   | `#34d399`                   |
| Positive dim      | `--accent-pos-dim`    | `rgba(52, 211, 153, 0.12)`  |
| Warning           | `--accent-warning`    | `#fbbf24`                   |
| Warning dim       | `--accent-warn-dim`   | `rgba(251, 191, 36, 0.12)`  |
| Danger            | `--accent-danger`     | `#f87171`                   |
| Danger dim        | `--accent-danger-dim` | `rgba(248, 113, 113, 0.12)` |
| Encrypted badge   | `--accent-secure`     | `#60c8ff`                   |
| Encrypted dim     | `--accent-secure-dim` | `rgba(96, 200, 255, 0.10)`  |

### Agent Identity Colors

Each agent has a fixed color used for their avatar, debate turns, and voice quotes. These must not be used interchangeably.

| Agent          | CSS Variable             | Value                       |
| -------------- | ------------------------ | --------------------------- |
| Realist        | `--agent-realist`        | `#34d399`                   |
| Realist dim    | `--agent-realist-dim`    | `rgba(52, 211, 153, 0.12)`  |
| Optimist       | `--agent-optimist`       | `#a89fff`                   |
| Optimist dim   | `--agent-optimist-dim`   | `rgba(168, 159, 255, 0.12)` |
| Critic         | `--agent-critic`         | `#f87171`                   |
| Critic dim     | `--agent-critic-dim`     | `rgba(248, 113, 113, 0.12)` |
| Strategist     | `--agent-strategist`     | `#fbbf24`                   |
| Strategist dim | `--agent-strat-dim`      | `rgba(251, 191, 36, 0.12)`  |
| AI Coach       | `--agent-aicoach`        | `#60c8ff`                   |
| AI Coach dim   | `--agent-aicoach-dim`    | `rgba(96, 200, 255, 0.12)`  |
| Synthesis      | `--agent-synthesis`      | `#7c6ffc`                   |
| Synthesis dim  | `--agent-synth-dim`      | `rgba(124, 111, 252, 0.12)` |

### Tailwind Utility Mapping

| Purpose               | Utility class                   | Resolves to              |
| --------------------- | ------------------------------- | ------------------------ |
| Page background       | `bg-base`                       | `--bg-base`              |
| Surface background    | `bg-surface`                    | `--bg-surface`           |
| Elevated background   | `bg-elevated`                   | `--bg-elevated`          |
| Subtle background     | `bg-subtle`                     | `--bg-subtle`            |
| Default border        | `border-default`                | `--border-default`       |
| Subtle border         | `border-subtle`                 | `--border-subtle`        |
| Primary text          | `text-primary`                  | `--text-primary`         |
| Secondary text        | `text-secondary`                | `--text-secondary`       |
| Muted text            | `text-muted`                    | `--text-muted`           |
| Brand accent bg       | `bg-brand`                      | `--accent-brand`         |
| Brand accent dim bg   | `bg-brand-dim`                  | `--accent-brand-dim`     |
| Brand accent text     | `text-brand`                    | `--accent-brand-text`    |
| Positive text/bg      | `text-positive` / `bg-positive` | `--accent-positive`      |
| Warning text/bg       | `text-warning` / `bg-warning`   | `--accent-warning`       |
| Danger text/bg        | `text-danger` / `bg-danger`     | `--accent-danger`        |
| Secure/encrypted bg   | `bg-secure-dim`                 | `--accent-secure-dim`    |
| Secure/encrypted text | `text-secure`                   | `--accent-secure`        |

Agent color utilities: `text-agent-{id}`, `bg-agent-{id}`, `bg-agent-{id}-dim`. Example: `text-agent-realist`, `bg-agent-critic-dim`.

## Typography

| Role      | Font           | Variable      |
| --------- | -------------- | ------------- |
| UI text   | Geist Sans     | `--font-sans` |
| Code/mono | JetBrains Mono | `--font-mono` |

Both loaded via `next/font/google`. Base body uses Geist Sans with `antialiased`.

## Border Radius

| Context               | Class         |
| --------------------- | ------------- |
| Tags, pills, badges   | `rounded-xl`  |
| Cards, panels, inputs | `rounded-2xl` |
| Modals, overlays      | `rounded-3xl` |

## Layout Patterns

### Auth Screens (Sign In / Sign Up)

Two-column split layout at `md:` breakpoint and above. On mobile, only the right column is shown.

**Left column** (`components/auth/auth-left-panel.tsx`):
- Fixed width (`md:w-[420px]`), full viewport height
- Background: `bg-surface`, right border: `border-default`
- Vertically centered content
- App logomark (32px) + wordmark in `text-primary font-medium`
- Short value proposition in `text-secondary text-sm leading-relaxed` (2–3 lines)
- Three feature pills at bottom: `bg-subtle rounded-xl px-3 py-1.5 text-xs text-muted`
  - Example: "Encrypted · Private · No data sold"
  - Example: "5 specialist AI agents debate your path"
  - Example: "Self-host for full data ownership"
- Privacy notice at bottom: "Your API key is encrypted. We never read your data." + lock icon in `text-muted text-xs`

**Right column**:
- Flexible width, full viewport height
- Background: `bg-base`
- Centered form, `max-w-sm w-full`
- Form title in `text-primary text-xl font-semibold`
- Subtitle in `text-secondary text-sm`
- Form fields stack vertically with `gap-4`
- Submit button full width, `bg-brand text-white rounded-2xl`
- Divider + OAuth button (Google) below submit
- "Already have an account? Sign in" link at bottom in `text-muted text-sm`

### App Shell (Authenticated)

Minimal top navbar + full-width content. No persistent sidebar.

**Top navbar** (`components/app/app-navbar.tsx`):
- Full width, height 48px, `bg-surface border-b border-default`
- Left: App logomark + wordmark
- Center: Breadcrumb or screen title (hidden on mobile)
- Right: Session count badge (number of saved sessions) + user avatar dropdown
- User avatar: 28px circle, initials or photo, `bg-subtle` background, `text-primary text-xs`
- Dropdown: "Account", "Sessions", "Sign out" — `bg-elevated border-default rounded-2xl shadow-lg`

**Encryption indicator** (in navbar, right of breadcrumb):
- Small lock icon + "Encrypted" label in `text-secure text-xs`
- Tooltip: "Your profile and results are encrypted with AES-256-GCM. Only you can decrypt them."

### App Screens (Setup / Questionnaire / Arena / Results)

- **Setup screen**: centered narrow column (`max-w-lg`), sectioned by provider → model → agents
- **Questionnaire screen**: centered narrow column (`max-w-md`), one step at a time with step nav at bottom
- **Arena screen**: centered column (`max-w-2xl`), stacked agent turn cards appearing via SSE stream
- **Results screen**: centered column (`max-w-2xl`), path cards with expandable sections
- **Sessions list screen**: centered column (`max-w-2xl`), card list of past sessions

### Sessions List

Each session card (`components/sessions/session-card.tsx`):
- `bg-surface border border-default rounded-2xl p-5`
- Top row: date in `text-muted text-xs` + status badge (complete / pending / failed) in `rounded-xl text-xs`
- Provider + model label: `text-secondary text-sm`
- Path count: "3 recommended paths" in `text-muted text-xs`
- Action row: "View results" link + "Delete" button (danger)
- No profile or results data shown in the list — requires clicking into the session

### Modals

- Centered overlay, backdrop blur `backdrop-blur-sm`, `bg-surface/80`
- `rounded-3xl`, `max-w-md`, `border border-default`
- Close button top-right: `h-5 w-5` X icon, `text-muted hover:text-primary`

## Component Library

shadcn/ui on top of Tailwind. Components live in `components/ui/`. Use the CLI to add new components. Do not modify `components/ui/*` files.

## Icons

Lucide React. Stroke-based only. Sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons and avatar slots.

## Consensus Score Display

Consensus scores (0–100) displayed as a horizontal bar with numeric label.

- 80–100: `--accent-positive` — "Strong consensus"
- 50–79: `--accent-warning` — "Moderate consensus"
- 0–49: `--accent-danger` — "Speculative"

Bar background: `--bg-subtle`. Label shows score + descriptor.

## Arena Agent Turn Cards

Each agent card in the live debate arena:

- `bg-surface border border-default rounded-2xl p-5`
- Left edge: 2px colored border using agent identity color
- Agent avatar: 28px circle, agent dim color as background, agent initial as text in agent color
- Agent name: `text-primary`, role badge: `text-muted text-xs bg-subtle rounded-xl px-2 py-0.5`
- Body text: `text-secondary text-sm leading-relaxed`
- Loading state: pulsing dots in agent color while awaiting SSE
- Completed state: full text, fade-in animation

## Agent Stance Indicators (Results)

In path cards, each agent voice quote shows a stance dot:

- Support: 8px filled circle in `--accent-positive`
- Neutral: 8px filled circle in `--text-muted`
- Oppose: 8px filled circle in `--accent-danger`

## Knowledge Graph Visualization (Optional)

Shown as a small node-graph preview on the results screen after synthesis:

- Nodes: circles sized by weight (8–20px), colored by node type
  - Role: `--accent-brand`
  - Skill: `--accent-positive`
  - Constraint: `--accent-danger`
  - Aspiration: `--agent-optimist`
  - Gap: `--accent-warning`
- Edges: thin lines in `--border-subtle`
- Background: `--bg-elevated`, `rounded-2xl`
- Tooltip on hover: node label + weight percentage

If `SHOW_GRAPH_VIZ` env flag is false, this component is hidden. Disabled by default for clean UI.

## Privacy & Security Indicators

Shown at key points to reassure users (especially on cloud deployment):

- Setup screen, below API key input: `bg-secure-dim rounded-xl px-3 py-2 text-secure text-xs flex items-center gap-2` — lock icon + "Your API key is encrypted with AES-256-GCM before storage. It is never readable by us."
- Session save confirmation: brief toast, lock icon + "Session encrypted and saved."
- Auth left panel: "Encrypted · Private · No data sold" feature pill.

## Self-Hosting Badge (Footer)

On self-hosted Docker deployments (`DEPLOYMENT_MODE=self-hosted`), show a subtle footer badge:

```
bg-subtle rounded-xl px-3 py-1.5 text-xs text-muted
🔒 Self-hosted — all data stays on your machine
```

## Responsive Breakpoints

- Mobile (`< md`): auth left panel hidden, single-column layout
- Tablet (`md`): two-column auth, full app nav
- Desktop (`lg`): no additional changes — app is intentionally narrow-column

## Forms

- Input fields: `bg-elevated border border-default rounded-2xl text-primary placeholder:text-faint`
- Focus ring: `ring-2 ring-brand/40`
- Error state: `border-danger` + error message in `text-danger text-xs` below field
- Labels: `text-secondary text-sm font-medium`
- Disabled state: `opacity-40 cursor-not-allowed`
