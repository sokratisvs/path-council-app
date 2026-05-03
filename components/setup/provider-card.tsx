'use client'

import type { ProviderConfig } from '@/lib/providers/config'

interface Props {
  config: ProviderConfig
  selected: boolean
  onSelect: () => void
}

export function ProviderCard({ config, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'flex flex-col gap-1 rounded-2xl border p-4 text-left transition-colors duration-150 cursor-pointer w-full',
        selected
          ? 'border-brand bg-brand-dim'
          : 'border-default bg-surface hover:border-subtle',
      ].join(' ')}
    >
      <span className={`text-sm font-medium ${selected ? 'text-brand' : 'text-primary'}`}>
        {config.name}
      </span>
      <span className="text-xs text-muted">{config.subline}</span>
    </button>
  )
}
