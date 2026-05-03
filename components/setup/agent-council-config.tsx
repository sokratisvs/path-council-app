'use client'

import { AGENT_IDS } from '@/lib/agents/personas'
import type { AgentId } from '@/lib/agents/personas'
import { AgentConfigRow } from './agent-config-row'
import { SectionHeading } from '@/components/shared/section-heading'

interface Props {
  activeAgents: AgentId[]
  agentPersonas: Record<AgentId, string | null>
  onToggleAgent: (id: AgentId) => void
  onPersonaChange: (id: AgentId, persona: string | null) => void
}

export function AgentCouncilConfig({ activeAgents, agentPersonas, onToggleAgent, onPersonaChange }: Props) {
  const activeCount = activeAgents.length

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading
        title="Configure your agent council"
        description="Each agent analyses your profile from a different angle. Toggle agents on or off and assign a persona to each."
      />

      <div className="flex flex-col divide-y divide-default">
        {AGENT_IDS.map((id) => (
          <AgentConfigRow
            key={id}
            agentId={id}
            active={activeAgents.includes(id)}
            persona={agentPersonas[id]}
            canDeactivate={activeCount > 2}
            onToggle={() => onToggleAgent(id)}
            onPersonaChange={(p) => onPersonaChange(id, p)}
          />
        ))}
      </div>
    </section>
  )
}
