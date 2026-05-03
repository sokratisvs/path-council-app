'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { PROVIDER_CONFIGS } from '@/lib/providers/config'
import type { SetupConfig } from '@/lib/providers/config'
import type { ProviderId } from '@/lib/providers/env'
import { AGENT_IDS } from '@/lib/agents/personas'
import type { AgentId } from '@/lib/agents/personas'
import { ProviderCard } from './provider-card'
import { AgentCouncilConfig } from './agent-council-config'
import { SectionHeading } from '@/components/shared/section-heading'
import { FormField } from '@/components/shared/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const PROVIDER_IDS = Object.keys(PROVIDER_CONFIGS) as ProviderId[]

function buildDefaultPersonas(): Record<AgentId, string | null> {
  return Object.fromEntries(AGENT_IDS.map((id) => [id, null])) as Record<AgentId, string | null>
}

interface Props {
  onContinue: (config: SetupConfig) => void
}

export function SetupScreen({ onContinue }: Props) {
  const [provider, setProvider] = useState<ProviderId | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [model, setModel] = useState('')
  const [activeAgents, setActiveAgents] = useState<AgentId[]>([...AGENT_IDS])
  const [agentPersonas, setAgentPersonas] = useState<Record<AgentId, string | null>>(buildDefaultPersonas)
  const [errors, setErrors] = useState<{ provider?: string; apiKey?: string; agents?: string }>({})

  function handleProviderSelect(id: ProviderId) {
    setProvider(id)
    setModel(PROVIDER_CONFIGS[id].defaultModel)
    setErrors((e) => ({ ...e, provider: undefined }))
  }

  function handleToggleAgent(id: AgentId) {
    setActiveAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
    setErrors((e) => ({ ...e, agents: undefined }))
  }

  function handlePersonaChange(id: AgentId, persona: string | null) {
    setAgentPersonas((prev) => ({ ...prev, [id]: persona }))
  }

  function handleContinue() {
    const next: typeof errors = {}
    if (!provider) next.provider = 'Select a provider to continue.'
    if (!apiKey.trim()) next.apiKey = 'Enter your API key to continue.'
    if (activeAgents.length < 2) next.agents = 'At least two agents must be active.'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }
    onContinue({
      provider: provider!,
      apiKey: apiKey.trim(),
      model,
      activeAgents,
      agentPersonas,
    })
  }

  const providerConfig = provider ? PROVIDER_CONFIGS[provider] : null

  return (
    <div className="flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg flex flex-col gap-8">

        {/* Section 1: Provider */}
        <section className="flex flex-col gap-3">
          <SectionHeading title="Choose your AI provider" />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {PROVIDER_IDS.map((id) => (
              <ProviderCard
                key={id}
                config={PROVIDER_CONFIGS[id]}
                selected={provider === id}
                onSelect={() => handleProviderSelect(id)}
              />
            ))}
          </div>
          {errors.provider && (
            <p className="text-xs text-danger">{errors.provider}</p>
          )}
        </section>

        {/* Section 2: API Key + Model */}
        {providerConfig && (
          <>
            <Separator className="bg-default" />
            <section className="flex flex-col gap-4">
              <FormField
                label={providerConfig.keyLabel}
                htmlFor="api-key"
                hint={providerConfig.keyNote}
                error={errors.apiKey}
              >
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value)
                      setErrors((err) => ({ ...err, apiKey: undefined }))
                    }}
                    placeholder="Paste your API key…"
                    className={[
                      'font-mono bg-elevated border-default rounded-2xl text-primary placeholder:text-faint pr-10',
                      'focus-visible:ring-2 focus-visible:ring-brand/40',
                      errors.apiKey ? 'border-danger' : '',
                    ].join(' ')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>

              <div className="flex items-center gap-2 rounded-xl bg-secure-dim px-3 py-2">
                <Lock className="h-4 w-4 text-secure shrink-0" />
                <p className="text-xs text-secure">
                  Your API key is encrypted with AES-256-GCM before storage. It is never readable by us.
                </p>
              </div>

              <FormField label="Model" htmlFor="model-select">
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger id="model-select" className="bg-elevated border-default rounded-2xl text-primary focus:ring-brand/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-elevated border-default rounded-2xl">
                    {providerConfig.models.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="text-sm">
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </section>
          </>
        )}

        {/* Section 3: Agent Council */}
        <Separator className="bg-default" />
        <AgentCouncilConfig
          activeAgents={activeAgents}
          agentPersonas={agentPersonas}
          onToggleAgent={handleToggleAgent}
          onPersonaChange={handlePersonaChange}
        />
        {errors.agents && (
          <p className="text-xs text-danger -mt-4">{errors.agents}</p>
        )}

        {/* Continue */}
        <Button
          onClick={handleContinue}
          className="w-full bg-brand text-white rounded-2xl hover:opacity-90 transition-opacity"
        >
          Start questionnaire →
        </Button>

      </div>
    </div>
  )
}
