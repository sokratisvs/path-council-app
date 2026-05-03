# Feature 03: Questionnaire

Read `ai-workflow-rules.md` before starting.

We are building the four-step questionnaire that collects the user's profile. Each step is a self-contained component. Navigation between steps is controlled by the questionnaire root.

## Layout

Centered column, `max-w-md`. Step label at top. Step title and description below. Input area. Navigation at bottom with progress dots and back/next buttons.

## Step Controller

Create `components/questionnaire/questionnaire-screen.tsx` as the step controller. It owns:
- Current step index (0–3)
- All answer state as a `Partial<UserProfile>`
- Step validation before advancing
- Back navigation without clearing answers
- Final submit that serialises the profile and calls `onComplete(profile: UserProfile)`

## Progress Dots

Shown in the nav row at the bottom. Four dots total — filled for completed steps, active for current step, empty for future steps.

## Steps

### Step 1 — Who you are

**Step label:** "Step 1 of 4 — who you are"
**Step title:** "Tell us about yourself"
**Step description:** "No field is mandatory. The more you share, the sharper the analysis."

**Fields:**

1. **Situation** — single-select tag group
   - Options: Student | Early career | Mid-career | Senior professional | In transition | Returning to work | Self-employed | Retired / semi-retired
   - Values: full descriptive strings (e.g. "a student figuring out what to do next")

2. **Field** — free text input
   - Placeholder: "e.g. healthcare, design, software, education, finance, arts…"

3. **AI tool usage** — single-select tag group
   - Options: Barely use them | Experimenting | Regular user | Power user
   - Values: full descriptive strings

**Validation:** None required — all optional. Always allow advancing.

---

### Step 2 — What drives you

**Step label:** "Step 2 of 4 — what drives you"
**Step title:** "What matters most to you?"
**Step description:** "Pick what genuinely resonates — not what sounds impressive."

**Fields:**

1. **Energised by** — multi-select tag group, maximum 3 selections
   - Options: Creating things | Solving problems | Helping people | Leading teams | Financial security | Creative expression | Social impact | Learning & growth | Independence | Recognition
   - Values: full descriptive strings
   - If user tries to select a fourth option, silently ignore the tap

2. **Biggest frustration** — textarea
   - Placeholder: "e.g. I feel stuck, no visibility, lack confidence, unclear next step…"

3. **3–5 year vision** — textarea
   - Placeholder: "e.g. Running my own studio, leading a team, remote work, financial independence…"

**Validation:** None required. Always allow advancing.

---

### Step 3 — Strengths and gaps

**Step label:** "Step 3 of 4 — strengths & gaps"
**Step title:** "What do you bring, and what's missing?"
**Step description:** "Honest answers lead to practical paths, not flattery."

**Fields:**

1. **Strengths** — textarea
   - Placeholder: "e.g. Communication, systems thinking, visual design, empathy, writing…"

2. **Skill gaps** — textarea
   - Placeholder: "e.g. Technical skills, business sense, networking, public speaking, confidence…"

3. **Constraints** — multi-select tag group, no limit
   - Options: Limited time | Financial pressure | Geographic limits | Health considerations | No major constraints
   - Values: full descriptive strings

**Validation:** None required. Always allow advancing.

---

### Step 4 — Your north star

**Step label:** "Step 4 of 4 — your north star"
**Step title:** "What kind of future are you aiming for?"
**Step description:** "Pick the direction that feels most like you — not the right answer."

**Fields:**

1. **Target direction** — single-select tag group
   - Options: Leadership | Deep specialist | Entrepreneurship | Career pivot | Portfolio career | Financial independence | Impact work | Balance & flexibility
   - Values: full descriptive strings

2. **Additional context** — textarea
   - Placeholder: "e.g. Based in a small city, 10 hrs/week to invest, risk-averse, have a family…"

**Validation:** None required. Always allow advancing.

---

## Profile Serialisation

On submit, build a `UserProfile` object from all collected answers. Pass it to `onComplete`. The questionnaire screen does not call any LLM — it only collects data and notifies the parent.

```ts
interface UserProfile {
  situation: string
  field: string
  aiUsage: string
  energisedBy: string[]
  frustration: string
  vision: string
  strengths: string
  gaps: string
  constraints: string[]
  target: string
  extra: string
}
```

## Shared Tag Selector Component

Create `components/shared/tag-selector.tsx`:

```ts
interface TagSelectorProps {
  options: Array<{ label: string; value: string }>
  selected: string | string[]
  mode: 'single' | 'multi'
  maxSelections?: number
  onChange: (value: string | string[]) => void
}
```

Used in steps 1, 2, 3, and 4.

## Files to Create

- `components/questionnaire/questionnaire-screen.tsx` — step controller
- `components/questionnaire/step-who.tsx` — step 1
- `components/questionnaire/step-drives.tsx` — step 2
- `components/questionnaire/step-strengths.tsx` — step 3
- `components/questionnaire/step-north-star.tsx` — step 4
- `components/shared/tag-selector.tsx` — reusable tag selector

## Check When Done

- All four steps render and navigate correctly
- Back navigation preserves entered answers
- Tag selector enforces single vs multi mode and max selections
- Profile object is correctly constructed and passed on submit
- `npm run build` passes
