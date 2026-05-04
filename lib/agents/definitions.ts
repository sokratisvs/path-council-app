export const AGENT_IDS_CONST = ['financial', 'psychologist', 'strategist', 'skills', 'industry'] as const
export type AgentId = (typeof AGENT_IDS_CONST)[number]

export interface AgentDefinition {
  id: AgentId
  name: string
  color: string
  role: string
  buildSystemPrompt: (personaId: string | null) => string
}

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    id: 'financial',
    name: 'Financial Expert',
    color: 'var(--agent-financial)',
    role: 'Monetary feasibility & risk',
    buildSystemPrompt: (personaId) => {
      const base =
        'You are a Financial Expert evaluating the monetary feasibility of career paths. Assess income potential, runway, transition costs, and financial risk given the user\'s constraints and timeline. Be specific about numbers and viability. Respond in structured JSON.'
      return personaId ? `${personaId}\n\n${base}` : base
    },
  },
  {
    id: 'psychologist',
    name: 'Psychologist',
    color: 'var(--agent-psychologist)',
    role: 'Motivation alignment & wellbeing',
    buildSystemPrompt: (personaId) => {
      const base =
        'You are a Psychologist evaluating motivation alignment, identity fit, burnout risk, and behavioural patterns. Assess how each path aligns with the user\'s values, drives, and psychological needs. Surface patterns the user may not have named. Respond in structured JSON.'
      return personaId ? `${personaId}\n\n${base}` : base
    },
  },
  {
    id: 'strategist',
    name: 'Career Strategist',
    color: 'var(--agent-strategist)',
    role: 'Sequencing & leverage',
    buildSystemPrompt: (personaId) => {
      const base =
        'You are a Career Strategist who sequences moves, identifies leverage points, and thinks in compounding advantages. Propose the most powerful move sequence available to this person and name the path with the best leverage-to-effort ratio. Respond in structured JSON.'
      return personaId ? `${personaId}\n\n${base}` : base
    },
  },
  {
    id: 'skills',
    name: 'Skills Analyst',
    color: 'var(--agent-skills)',
    role: 'Skill gaps & learning paths',
    buildSystemPrompt: (personaId) => {
      const base =
        'You are a Skills Analyst who maps skill gaps to target directions, identifies transferable skills, and designs concrete learning paths. Be specific about what the user needs to learn, how long it takes, and what can be skipped. Respond in structured JSON.'
      return personaId ? `${personaId}\n\n${base}` : base
    },
  },
  {
    id: 'industry',
    name: 'Industry Insider',
    color: 'var(--agent-industry)',
    role: 'Market reality & field dynamics',
    buildSystemPrompt: (personaId) => {
      const base =
        'You are an Industry Insider providing market-reality feedback specific to the user\'s chosen field. Assess current conditions, hiring trends, realistic timelines, and field-specific constraints that outsiders miss. Respond in structured JSON.'
      return personaId ? `${personaId}\n\n${base}` : base
    },
  },
]

export const AGENT_DEFINITIONS_MAP: Record<AgentId, AgentDefinition> = Object.fromEntries(
  AGENT_DEFINITIONS.map((d) => [d.id, d])
) as Record<AgentId, AgentDefinition>

export function agentDisplayName(agentId: AgentId, insiderTitle?: string): string {
  if (agentId === 'industry' && insiderTitle) return insiderTitle
  return AGENT_DEFINITIONS_MAP[agentId]?.name ?? agentId
}
