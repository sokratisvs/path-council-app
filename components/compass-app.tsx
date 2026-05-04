'use client'

import { useState } from 'react'
import type { SetupConfig } from '@/lib/providers/config'
import type { UserProfile } from '@/lib/questionnaire/types'
import { SetupScreen } from '@/components/setup/setup-screen'
import { QuestionnaireScreen } from '@/components/questionnaire/questionnaire-screen'

export type Screen =
  | 'setup'
  | 'questionnaire'
  | 'arena'
  | 'results'
  | 'revisit-questionnaire'
  | 'continuity-results'

function PlaceholderScreen({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-full text-muted text-sm">
      {name} — coming soon
    </div>
  )
}

export function CompassApp() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [setupConfig, setSetupConfig] = useState<SetupConfig | null>(null)  // eslint-disable-line @typescript-eslint/no-unused-vars
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)  // eslint-disable-line @typescript-eslint/no-unused-vars

  function handleSetupComplete(config: SetupConfig) {
    setSetupConfig(config)
    setScreen('questionnaire')
  }

  function handleQuestionnaireComplete(profile: UserProfile) {
    setUserProfile(profile)
    setScreen('arena')
  }

  return (
    <div className="flex-1 overflow-auto">
      {screen === 'setup' && <SetupScreen onContinue={handleSetupComplete} />}
      {screen === 'questionnaire' && <QuestionnaireScreen onComplete={handleQuestionnaireComplete} />}
      {screen === 'arena' && <PlaceholderScreen name="Arena" />}
      {screen === 'results' && <PlaceholderScreen name="Results" />}
      {screen === 'revisit-questionnaire' && <PlaceholderScreen name="Revisit Questionnaire" />}
      {screen === 'continuity-results' && <PlaceholderScreen name="Continuity Results" />}
    </div>
  )
}
