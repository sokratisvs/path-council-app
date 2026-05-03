'use client'

import { AGENT_META, PERSONAS } from '@/lib/agents/personas'
import type { AgentId } from '@/lib/agents/personas'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
  agentId: AgentId
  active: boolean
  persona: string | null
  canDeactivate: boolean
  onToggle: () => void
  onPersonaChange: (persona: string | null) => void
}

export function AgentConfigRow({ agentId, active, persona, canDeactivate, onToggle, onPersonaChange }: Props) {
  const meta = AGENT_META[agentId]
  const personas = PERSONAS[agentId]

  const toggle = (
    <Switch
      checked={active}
      onCheckedChange={() => {
        if (!active || canDeactivate) onToggle()
      }}
      disabled={active && !canDeactivate}
      className="data-[state=checked]:bg-brand"
    />
  )

  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className="shrink-0 rounded-full"
        style={{
          width: 8,
          height: 8,
          backgroundColor: `var(${meta.colorVar})`,
          opacity: active ? 1 : 0.3,
        }}
      />

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-none ${active ? 'text-primary' : 'text-muted'}`}>
          {meta.name}
        </p>
        <p className="text-xs text-muted mt-0.5">{meta.role}</p>
      </div>

      <Select
        value={persona ?? 'default'}
        onValueChange={(v) => onPersonaChange(v === 'default' ? null : v)}
        disabled={!active}
      >
        <SelectTrigger className="w-44 h-8 text-xs bg-elevated border-default rounded-xl focus:ring-brand/40 disabled:opacity-40">
          <SelectValue placeholder="Default" />
        </SelectTrigger>
        <SelectContent className="bg-elevated border-default rounded-2xl">
          <SelectItem value="default" className="text-xs">Default</SelectItem>
          {personas.map((p) => (
            <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {active && !canDeactivate ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-not-allowed">{toggle}</span>
            </TooltipTrigger>
            <TooltipContent className="bg-elevated border-default rounded-xl text-xs">
              Keep at least 2 agents active.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        toggle
      )}
    </div>
  )
}
