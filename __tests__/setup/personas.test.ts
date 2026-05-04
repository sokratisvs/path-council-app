import { describe, it, expect } from 'vitest'
import { AGENT_IDS, AGENT_META, PERSONAS } from '@/lib/agents/personas'

describe('AGENT_IDS', () => {
  it('contains exactly 5 agents', () => {
    expect(AGENT_IDS).toHaveLength(5)
  })

  it('includes all required agent roles', () => {
    expect(AGENT_IDS).toContain('financial')
    expect(AGENT_IDS).toContain('psychologist')
    expect(AGENT_IDS).toContain('strategist')
    expect(AGENT_IDS).toContain('skills')
    expect(AGENT_IDS).toContain('industry')
  })
})

describe('AGENT_META', () => {
  it.each(AGENT_IDS)('%s has required fields', (id) => {
    const meta = AGENT_META[id]
    expect(meta.id).toBe(id)
    expect(meta.name).toBeTruthy()
    expect(meta.role).toBeTruthy()
    expect(meta.colorVar).toMatch(/^--agent-/)
  })

  it('has entries for every agent id', () => {
    for (const id of AGENT_IDS) {
      expect(AGENT_META).toHaveProperty(id)
    }
  })
})

describe('PERSONAS', () => {
  it('has entries for every agent id', () => {
    for (const id of AGENT_IDS) {
      expect(PERSONAS).toHaveProperty(id)
    }
  })

  it('static agents have 3 personas each', () => {
    for (const id of ['financial', 'psychologist', 'strategist', 'skills'] as const) {
      expect(PERSONAS[id]).toHaveLength(3)
    }
  })

  it('industry has no curated personas', () => {
    expect(PERSONAS.industry).toHaveLength(0)
  })

  it('financial has correct personas', () => {
    expect(PERSONAS.financial).toContain('Bootstrapped founder who reached profitability without VC')
    expect(PERSONAS.financial).toContain('CFP who advises high-earning professionals making career pivots')
    expect(PERSONAS.financial).toContain('Operator who has managed tight budgets across three recessions')
  })

  it('psychologist has correct personas', () => {
    expect(PERSONAS.psychologist).toContain('Clinical psychologist specialising in career transitions and identity shifts')
    expect(PERSONAS.psychologist).toContain('Executive coach who works with high-performers navigating burnout')
    expect(PERSONAS.psychologist).toContain('Therapist who has helped hundreds of people leave stable careers for something meaningful')
  })

  it('strategist has correct personas', () => {
    expect(PERSONAS.strategist).toContain('VC partner who thinks in 10-year compounding arcs')
    expect(PERSONAS.strategist).toContain('Product leader who ships in weeks, not quarters')
    expect(PERSONAS.strategist).toContain('Systems thinker and published author on leverage and career design')
  })

  it('skills has correct personas', () => {
    expect(PERSONAS.skills).toContain('Technical recruiter with 10 years placing candidates across industries')
    expect(PERSONAS.skills).toContain('L&D director who has designed upskilling programmes for 500+ employees')
    expect(PERSONAS.skills).toContain('Self-taught professional who pivoted fields and mapped the learning path')
  })
})
