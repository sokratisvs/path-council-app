'use client'

import { useState } from 'react'
import type { AgentId } from '@/lib/agents/definitions'
import type { AgentCallResult, IndustryInsiderDef } from '@/lib/agents/types'
import { AGENT_DEFINITIONS_MAP, agentDisplayName } from '@/lib/agents/definitions'

interface DebateLogProps {
  agentResults: Record<AgentId, AgentCallResult>
  industryInsiderDef?: IndustryInsiderDef
}

export function DebateLog({ agentResults, industryInsiderDef }: DebateLogProps) {
  const [expanded, setExpanded] = useState(false)
  const [rawOpen, setRawOpen] = useState<Partial<Record<AgentId, boolean>>>({})

  const entries = Object.values(agentResults).filter((r) => !r.error && r.output)

  function toggleRaw(agentId: AgentId) {
    setRawOpen((prev) => ({ ...prev, [agentId]: !prev[agentId] }))
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-muted text-sm underline-offset-2 hover:text-secondary transition-colors duration-150"
      >
        {expanded ? 'Hide agent debate' : 'Show full agent debate'}
      </button>

      {expanded && (
        <div className="space-y-4">
          {entries.map((result) => {
            const def = AGENT_DEFINITIONS_MAP[result.agentId]
            const displayName = agentDisplayName(result.agentId, industryInsiderDef?.title)
            return (
              <div
                key={result.agentId}
                className="rounded-2xl border border-default bg-surface p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-primary text-sm font-medium">{displayName}</span>
                  <span className="rounded-xl bg-subtle px-2 py-0.5 text-muted text-xs">
                    {def?.role ?? ''}
                  </span>
                </div>
                <p className="text-secondary text-sm font-medium">{result.output!.verdict}</p>
                <p className="text-secondary text-sm leading-relaxed">{result.output!.reasoning}</p>
                {result.raw && (
                  <div className="pt-1">
                    <button
                      onClick={() => toggleRaw(result.agentId)}
                      className="text-muted text-xs underline-offset-2 hover:text-secondary transition-colors duration-150"
                    >
                      {rawOpen[result.agentId] ? 'Hide raw response' : 'Show raw response'}
                    </button>
                    {rawOpen[result.agentId] && (
                      <pre className="mt-2 overflow-x-auto rounded-xl bg-subtle p-3 text-muted text-xs leading-relaxed whitespace-pre-wrap">
                        {result.raw}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
