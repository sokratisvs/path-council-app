'use client'

import { useState } from 'react'
import type { SetupConfig } from '@/lib/providers/config'
import type { UserProfile } from '@/lib/questionnaire/types'
import type { AgentId } from '@/lib/agents/definitions'
import type { AgentCallResult, SynthesisOutput, IndustryInsiderDef } from '@/lib/agents/types'
import type { PathConsensus } from '@/lib/scoring/types'
import { SetupScreen } from '@/components/setup/setup-screen'
import { QuestionnaireScreen } from '@/components/questionnaire/questionnaire-screen'
import { ResultsScreen } from '@/components/results/results-screen'

export type Screen =
  | 'setup'
  | 'questionnaire'
  | 'arena'
  | 'results'
  | 'revisit-questionnaire'
  | 'continuity-results'

interface ResultsState {
  agentResults: Record<AgentId, AgentCallResult>
  consensusScores: PathConsensus[]
  synthesis: SynthesisOutput
  industryInsiderDef: IndustryInsiderDef
}

function PlaceholderScreen({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-full text-muted text-sm">
      {name} — coming soon
    </div>
  )
}

export function CompassApp() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [setupConfig, setSetupConfig] = useState<SetupConfig | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [resultsState, setResultsState] = useState<ResultsState | null>(null)

  function handleSetupComplete(config: SetupConfig) {
    setSetupConfig(config)
    setScreen('questionnaire')
  }

  function handleQuestionnaireComplete(profile: UserProfile) {
    setUserProfile(profile)
    setScreen('arena')
  }

  function handleRestart() {
    setSetupConfig(null)
    setUserProfile(null)
    setResultsState(null)
    setScreen('setup')
  }

  return (
    <div className="flex-1 overflow-auto">
      {screen === 'setup' && <SetupScreen onContinue={handleSetupComplete} />}
      {screen === 'questionnaire' && <QuestionnaireScreen onComplete={handleQuestionnaireComplete} />}
      {screen === 'arena' && <PlaceholderScreen name="Arena" />}
      {screen === 'results' && resultsState && setupConfig && userProfile && (
        <ResultsScreen
          agentResults={resultsState.agentResults}
          consensusScores={resultsState.consensusScores}
          synthesis={resultsState.synthesis}
          industryInsiderDef={resultsState.industryInsiderDef}
          config={setupConfig}
          profile={userProfile}
          onRestart={handleRestart}
        />
      )}
      {screen === 'results' && !resultsState && <PlaceholderScreen name="Results" />}
      {screen === 'revisit-questionnaire' && <PlaceholderScreen name="Revisit Questionnaire" />}
      {screen === 'continuity-results' && <PlaceholderScreen name="Continuity Results" />}
    </div>
  )
}
