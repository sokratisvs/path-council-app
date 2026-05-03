export const AGENT_IDS = ['realist', 'optimist', 'critic', 'strategist', 'aicoach'] as const
export type AgentId = (typeof AGENT_IDS)[number]

export interface AgentMeta {
  id: AgentId
  name: string
  role: string
  colorVar: string
}

export const AGENT_META: Record<AgentId, AgentMeta> = {
  realist:    { id: 'realist',    name: 'Realist',    role: 'Ground truth & feasibility', colorVar: '--agent-realist' },
  optimist:   { id: 'optimist',   name: 'Optimist',   role: 'Opportunity & momentum',     colorVar: '--agent-optimist' },
  critic:     { id: 'critic',     name: 'Critic',     role: 'Risk & blind spots',          colorVar: '--agent-critic' },
  strategist: { id: 'strategist', name: 'Strategist', role: 'Long-term positioning',       colorVar: '--agent-strategist' },
  aicoach:    { id: 'aicoach',    name: 'AI Coach',   role: 'AI leverage & workflow',      colorVar: '--agent-aicoach' },
}

export const PERSONAS: Record<AgentId, string[]> = {
  realist: [
    'Operator who bootstrapped and sold a company',
    'Ex-McKinsey partner, now operating advisor',
    'Serial technical founder, 3 exits',
  ],
  optimist: [
    'Angel investor who bets on people, not plans',
    'Talent scout at a tier-1 technology company',
    'Career coach specialising in mid-career transitions',
  ],
  critic: [
    'Burned-out founder who rebuilt from scratch',
    'Hiring manager who has reviewed 500+ candidates',
    'Executive coach who works with high-performing people',
  ],
  strategist: [
    'VC partner who thinks in 10-year compounding arcs',
    'Product leader who ships in weeks, not quarters',
    'Systems thinker and published author',
  ],
  aicoach: [
    'AI researcher who applies tools to real workflows daily',
    'Indie hacker who replaced a team of three with AI tools',
    'Educator who teaches AI literacy to non-technical professionals',
  ],
}
