# Feature 01: Design System and App Shell

Read `ai-workflow-rules.md` before starting.

We are setting up the foundational design system, installing UI primitives, and creating the top-level app shell that hosts the screen state machine.

## Install Dependencies

```bash
npm install next@latest react@latest react-dom@latest typescript @types/react @types/node
npx create-next-app@latest life-path-compass --typescript --tailwind --eslint --app --src-dir=false
```

After scaffolding:

```bash
npx shadcn@latest init
```

When prompted by shadcn: select Tailwind v4, RSC, TSX, and the default `components.json` configuration.

## shadcn Components to Add

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add tabs
npx shadcn@latest add scroll-area
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add tooltip
```

Do not modify any generated `components/ui/*` files after installation.

## Additional Dependencies

```bash
npm install lucide-react clsx tailwind-merge class-variance-authority
```

## lib/utils.ts

Create `lib/utils.ts` with a `cn()` helper:

```ts
import { clsx, type ClassValue } from 'clsx'
import { tailwindMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Typography

Install Inter and JetBrains Mono via `next/font/google` in `app/layout.tsx`. Apply as CSS variables `--font-sans` and `--font-mono` on the `<html>` element.

## globals.css

Define all CSS custom properties as specified in `ui-context.md`:

- Base palette tokens (`--bg-base` through `--text-faint`)
- Accent palette tokens (`--accent-brand` through `--accent-danger-dim`)
- Agent identity color tokens (`--agent-realist` through `--agent-synth-dim`)
- Map shadcn semantic vars (`--background`, `--foreground`, `--primary`, etc.) to the project tokens so shadcn components adopt the dark theme without modification
- Define `@theme inline` block mapping all tokens to Tailwind utility names per `ui-context.md`
- No media queries — dark only, set once in `:root`

## App Shell

Create `components/compass-app.tsx` as the top-level client component that owns the screen state machine.

Screens: `setup | questionnaire | arena | results | revisit-questionnaire | continuity-results`

```ts
type Screen =
  | 'setup'
  | 'questionnaire'
  | 'arena'
  | 'results'
  | 'revisit-questionnaire'
  | 'continuity-results'
```

The shell renders the correct screen component based on the current screen state. Screen transitions are driven by callbacks passed down as props.

Create placeholder screen components for each screen — empty divs with the screen name as text. These will be replaced in subsequent feature specs.

## app/page.tsx

Mount `<CompassApp />`. Keep this file as thin as possible.

```tsx
import { CompassApp } from '@/components/compass-app'

export default function Page() {
  return <CompassApp />
}
```

## Check When Done

- `npm run build` passes with no TypeScript errors
- All shadcn components import without errors
- `cn()` helper works correctly
- No default light styling appears — background is near-black
- Agent identity colors are defined and verifiable in browser DevTools
- App shell renders and transitions between placeholder screens when state changes
- Typography loads correctly from `next/font/google`
