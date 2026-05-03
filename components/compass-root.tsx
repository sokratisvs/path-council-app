'use client'

import { useState } from 'react'
import { VaultScreen } from '@/components/vault/vault-screen'
import { AppNavbar } from '@/components/app/app-navbar'
import { CompassApp } from '@/components/compass-app'

type RootState = 'vault' | 'app'

export function CompassRoot() {
  const [state, setState] = useState<RootState>('vault')

  if (state === 'vault') {
    return <VaultScreen onUnlocked={() => setState('app')} />
  }

  return (
    <div className="flex flex-col min-h-screen bg-base">
      <AppNavbar />
      <CompassApp />
    </div>
  )
}
