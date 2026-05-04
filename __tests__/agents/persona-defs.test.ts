import { describe, it, expect } from 'vitest'
import { PERSONA_DEFS } from '@/lib/agents/personas'
import { AGENT_IDS_CONST } from '@/lib/agents/definitions'
import type { AgentId } from '@/lib/agents/definitions'

describe('PERSONA_DEFS', () => {
  it('has entries for every agent id', () => {
    for (const id of AGENT_IDS_CONST) {
      expect(PERSONA_DEFS).toHaveProperty(id)
    }
  })

  it.each(AGENT_IDS_CONST as unknown as AgentId[])('%s has exactly 3 personas', (id) => {
    expect(PERSONA_DEFS[id]).toHaveLength(3)
  })

  it.each(AGENT_IDS_CONST as unknown as AgentId[])('%s personas have label and promptPrefix', (id) => {
    for (const persona of PERSONA_DEFS[id]) {
      expect(persona.label).toBeTruthy()
      expect(persona.promptPrefix).toBeTruthy()
      expect(typeof persona.promptPrefix).toBe('string')
    }
  })

  it('realist personas match PERSONAS strings', () => {
    const labels = PERSONA_DEFS.realist.map((p) => p.label)
    expect(labels).toContain('Operator who bootstrapped and sold a company')
    expect(labels).toContain('Ex-McKinsey partner, now operating advisor')
    expect(labels).toContain('Serial technical founder, 3 exits')
  })
})
