import type { AgentId } from '@/lib/agents/definitions'

export type AgentStance = 'support' | 'neutral' | 'oppose'

export interface AgentPathSentiment {
  agentId: AgentId
  pathName: string
  stance: AgentStance
  quote: string
}

export interface PathConsensus {
  pathName: string
  score: number
  descriptor: 'Strong consensus' | 'Moderate consensus' | 'Speculative'
  supportingAgents: AgentId[]
  opposingAgents: AgentId[]
  neutralAgents: AgentId[]
  agentSentiments: AgentPathSentiment[]
}
