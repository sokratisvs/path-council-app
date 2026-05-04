import type { AgentId } from './definitions'

export interface AgentCallResult {
  agentId: AgentId
  content: string
  error?: string
}

export interface PathConsensus {
  pathName: string
  score: number
  supportingAgents: AgentId[]
  opposingAgents: AgentId[]
}

export interface RecommendedPath {
  name: string
  horizon: string
  description: string
  consensusScore: number
  agentVoices: Record<AgentId, string>
  aiAdvantage: string
  milestones: { days30: string; days60: string; days90: string }
  tradeoff: string
}

export interface SynthesisOutput {
  paths: RecommendedPath[]
  overallConsensus: string
}
