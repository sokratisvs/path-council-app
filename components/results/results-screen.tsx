'use client'

import type { AgentId } from '@/lib/agents/definitions'
import type { AgentCallResult, SynthesisOutput, IndustryInsiderDef } from '@/lib/agents/types'
import type { PathConsensus } from '@/lib/scoring/types'
import type { SetupConfig } from '@/lib/providers/config'
import type { UserProfile } from '@/lib/questionnaire/types'
import { SummarySection } from './summary-section'
import { PathCard } from './path-card'
import { DebateLog } from './debate-log'

interface ResultsScreenProps {
  agentResults: Record<AgentId, AgentCallResult>
  consensusScores: PathConsensus[]
  synthesis: SynthesisOutput
  config: SetupConfig
  profile: UserProfile
  industryInsiderDef: IndustryInsiderDef
  onRestart: () => void
}

export function ResultsScreen({
  agentResults,
  consensusScores,
  synthesis,
  industryInsiderDef,
  onRestart,
}: ResultsScreenProps) {
  const consensusMap: Record<string, PathConsensus> = {}
  for (const c of consensusScores) {
    consensusMap[c.pathName] = c
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
      <SummarySection
        summary={synthesis.summary}
        strengths={synthesis.strengths}
        blindSpots={synthesis.blindSpots}
      />

      <div className="space-y-6">
        {synthesis.paths.map((path, i) => (
          <PathCard
            key={path.name}
            path={path}
            rank={i + 1}
            consensus={consensusMap[path.name]}
            industryInsiderDef={industryInsiderDef}
          />
        ))}
      </div>

      <DebateLog agentResults={agentResults} industryInsiderDef={industryInsiderDef} />

      <div className="pt-4">
        <button
          onClick={onRestart}
          className="rounded-2xl border border-default bg-elevated px-4 py-2 text-secondary text-sm hover:text-primary transition-colors duration-150"
        >
          Start over
        </button>
      </div>
    </div>
  )
}
