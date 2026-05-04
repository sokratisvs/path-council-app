import { describe, it, expect } from 'vitest'
import { PERSONA_DEFS } from '@/lib/agents/personas'
import { AGENT_IDS_CONST } from '@/lib/agents/definitions'
import type { AgentId } from '@/lib/agents/definitions'

const STATIC_AGENTS: AgentId[] = ['financial', 'psychologist', 'strategist', 'skills']

describe('PERSONA_DEFS', () => {
  it('has entries for every agent id', () => {
    for (const id of AGENT_IDS_CONST) {
      expect(PERSONA_DEFS).toHaveProperty(id)
    }
  })

  it.each(STATIC_AGENTS)('%s has exactly 3 personas', (id) => {
    expect(PERSONA_DEFS[id]).toHaveLength(3)
  })

  it('industry has no curated personas (always dynamic)', () => {
    expect(PERSONA_DEFS.industry).toHaveLength(0)
  })

  it.each(STATIC_AGENTS)('%s personas have label and promptPrefix', (id) => {
    for (const persona of PERSONA_DEFS[id]) {
      expect(persona.label).toBeTruthy()
      expect(persona.promptPrefix).toBeTruthy()
      expect(typeof persona.promptPrefix).toBe('string')
    }
  })

  it('financial personas match spec labels', () => {
    const labels = PERSONA_DEFS.financial.map((p) => p.label)
    expect(labels).toContain('Bootstrapped founder who reached profitability without VC')
    expect(labels).toContain('CFP who advises high-earning professionals making career pivots')
    expect(labels).toContain('Operator who has managed tight budgets across three recessions')
  })

  it('psychologist personas match spec labels', () => {
    const labels = PERSONA_DEFS.psychologist.map((p) => p.label)
    expect(labels).toContain('Clinical psychologist specialising in career transitions and identity shifts')
    expect(labels).toContain('Executive coach who works with high-performers navigating burnout')
    expect(labels).toContain('Therapist who has helped hundreds of people leave stable careers for something meaningful')
  })
})
