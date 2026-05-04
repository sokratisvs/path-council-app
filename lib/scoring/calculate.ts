import type { AgentId } from '@/lib/agents/definitions'
import type { AgentPathSentiment, PathConsensus } from './types'

export function calculateConsensus(
  sentiments: AgentPathSentiment[],
  activeAgents: AgentId[]
): PathConsensus[] {
  if (activeAgents.length === 0) return []

  const pathNames = [...new Set(sentiments.map((s) => s.pathName))]

  return pathNames
    .map((pathName) => {
      const pathSentiments = sentiments.filter((s) => s.pathName === pathName)
      const supportingAgents = pathSentiments
        .filter((s) => s.stance === 'support')
        .map((s) => s.agentId)
      const opposingAgents = pathSentiments
        .filter((s) => s.stance === 'oppose')
        .map((s) => s.agentId)
      const neutralAgents = pathSentiments
        .filter((s) => s.stance === 'neutral')
        .map((s) => s.agentId)

      const raw =
        (supportingAgents.length * 2 + neutralAgents.length) /
        (activeAgents.length * 2) *
        100
      const score = Math.round(Math.min(100, Math.max(0, raw)))

      const descriptor: PathConsensus['descriptor'] =
        score >= 80
          ? 'Strong consensus'
          : score >= 50
            ? 'Moderate consensus'
            : 'Speculative'

      return {
        pathName,
        score,
        descriptor,
        supportingAgents,
        opposingAgents,
        neutralAgents,
        agentSentiments: pathSentiments,
      }
    })
    .sort((a, b) => b.score - a.score)
}
