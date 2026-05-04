'use client'

import type { AgentId } from '@/lib/agents/definitions'
import type { RecommendedPath, IndustryInsiderDef } from '@/lib/agents/types'
import type { PathConsensus } from '@/lib/scoring/types'
import { scoreToDescriptor } from '@/lib/scoring/calculate'
import { ConsensusBar } from './consensus-bar'
import { AgentVoices } from './agent-voices'
import { MilestoneList } from './milestone-list'

const RANK_LABELS = ['1st choice', '2nd choice', '3rd choice']

interface PathCardProps {
  path: RecommendedPath
  rank: number
  consensus: PathConsensus | undefined
  industryInsiderDef?: IndustryInsiderDef
}

export function PathCard({ path, rank, consensus, industryInsiderDef }: PathCardProps) {
  const isTop = rank === 1
  const rankLabel = RANK_LABELS[rank - 1] ?? `#${rank}`
  const score = consensus?.score ?? path.consensusScore
  const descriptor = consensus?.descriptor ?? scoreToDescriptor(score)
  const sentiments = consensus?.agentSentiments ?? []

  return (
    <div
      className={`rounded-2xl border bg-surface p-5 space-y-5 ${isTop ? 'border-brand' : 'border-default'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <span className="inline-block rounded-xl bg-subtle px-2.5 py-1 text-muted text-xs mb-1">
            {rankLabel}
          </span>
          <p className="text-primary text-base font-medium">{path.name}</p>
        </div>
        <span className="text-muted text-sm shrink-0 pt-1">{path.horizon}</span>
      </div>

      <ConsensusBar score={score} descriptor={descriptor} />

      <p className="text-secondary text-sm leading-relaxed">{path.description}</p>

      <AgentVoices
        agentVoices={path.agentVoices as Record<AgentId, string>}
        agentSentiments={sentiments}
        industryInsiderDef={industryInsiderDef}
      />

      <div className="rounded-2xl bg-brand-dim p-4 space-y-1">
        <p className="text-brand text-xs font-medium uppercase tracking-wide">AI advantage</p>
        <p className="text-brand text-sm">{path.aiAdvantage}</p>
      </div>

      <MilestoneList milestones={path.milestones} />

      <p className="text-muted text-xs italic">Trade-off: {path.tradeoff}</p>

      <div className="flex gap-3 pt-1">
        <button className="rounded-xl border border-default bg-elevated px-3 py-1.5 text-secondary text-xs hover:text-primary transition-colors duration-150">
          Get mentor prompts
        </button>
        <button className="rounded-xl border border-default bg-elevated px-3 py-1.5 text-secondary text-xs hover:text-primary transition-colors duration-150">
          Challenge this path
        </button>
      </div>
    </div>
  )
}
