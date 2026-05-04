'use client'

import type { AgentId } from '@/lib/agents/definitions'
import type { AgentPathSentiment, AgentStance } from '@/lib/scoring/types'
import type { IndustryInsiderDef } from '@/lib/agents/types'
import { agentDisplayName } from '@/lib/agents/definitions'

interface AgentVoicesProps {
  agentVoices: Record<AgentId, string>
  agentSentiments: AgentPathSentiment[]
  industryInsiderDef?: IndustryInsiderDef
}

function stanceDotClass(stance: AgentStance): string {
  if (stance === 'support') return 'bg-positive'
  if (stance === 'oppose') return 'bg-danger'
  return 'bg-muted'
}

export function AgentVoices({ agentVoices, agentSentiments, industryInsiderDef }: AgentVoicesProps) {
  const sentimentMap: Partial<Record<AgentId, AgentStance>> = {}
  for (const s of agentSentiments) {
    sentimentMap[s.agentId] = s.stance
  }

  const entries = Object.entries(agentVoices) as [AgentId, string][]

  return (
    <div className="space-y-2">
      <p className="text-muted text-xs font-medium uppercase tracking-wide">Expert perspectives</p>
      <div className="space-y-2">
        {entries.map(([agentId, quote]) => {
          const stance = sentimentMap[agentId] ?? 'neutral'
          const displayName = agentDisplayName(agentId, industryInsiderDef?.title)
          return (
            <div key={agentId} className="flex items-start gap-2">
              <span
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${stanceDotClass(stance)}`}
              />
              <div>
                <span className="text-muted text-xs">{displayName}</span>
                <span className="text-muted text-xs"> — </span>
                <span className="text-secondary text-xs italic">{quote}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
