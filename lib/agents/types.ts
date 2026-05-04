import type { AgentId } from './definitions'

export interface AgentOutput {
  verdict: string
  topPaths: string[]
  primaryRisk: string
  primaryOpportunity: string
  stance: 'bullish' | 'cautious' | 'bearish'
  reasoning: string
}

export interface IndustryInsiderDef {
  title: string
  systemPrompt: string
  graphNodeBias: string[]
}

export interface AgentCallResult {
  agentId: AgentId
  output: AgentOutput | null
  raw: string
  error?: string
}

export type { PathConsensus } from '@/lib/scoring/types'

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
  summary: string
  strengths: string[]
  blindSpots: string[]
  overallConsensus: string
}
