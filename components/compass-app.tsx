'use client'

import { useState } from 'react'

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

  return (
    <div className="flex-1 overflow-auto">
      {screen === 'setup' && <PlaceholderScreen name="Setup" />}
      {screen === 'questionnaire' && <PlaceholderScreen name="Questionnaire" />}
      {screen === 'arena' && <PlaceholderScreen name="Arena" />}
      {screen === 'results' && <PlaceholderScreen name="Results" />}
      {screen === 'revisit-questionnaire' && <PlaceholderScreen name="Revisit Questionnaire" />}
      {screen === 'continuity-results' && <PlaceholderScreen name="Continuity Results" />}
    </div>
  )
}
