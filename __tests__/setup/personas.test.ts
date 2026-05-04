import { describe, it, expect } from 'vitest'
import { AGENT_IDS, AGENT_META, PERSONAS } from '@/lib/agents/personas'

describe('AGENT_IDS', () => {
  it('contains exactly 5 agents', () => {
    expect(AGENT_IDS).toHaveLength(5)
  })

  it('includes all required agent roles', () => {
    expect(AGENT_IDS).toContain('realist')
    expect(AGENT_IDS).toContain('optimist')
    expect(AGENT_IDS).toContain('critic')
    expect(AGENT_IDS).toContain('strategist')
    expect(AGENT_IDS).toContain('aicoach')
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

  it.each(AGENT_IDS)('%s has at least one persona', (id) => {
    expect(PERSONAS[id].length).toBeGreaterThanOrEqual(1)
  })

  it('realist has correct personas', () => {
    expect(PERSONAS.realist).toContain('Operator who bootstrapped and sold a company')
    expect(PERSONAS.realist).toContain('Ex-McKinsey partner, now operating advisor')
    expect(PERSONAS.realist).toContain('Serial technical founder, 3 exits')
  })

  it('optimist has correct personas', () => {
    expect(PERSONAS.optimist).toContain('Angel investor who bets on people, not plans')
    expect(PERSONAS.optimist).toContain('Talent scout at a tier-1 technology company')
    expect(PERSONAS.optimist).toContain('Career coach specialising in mid-career transitions')
  })

  it('critic has correct personas', () => {
    expect(PERSONAS.critic).toContain('Burned-out founder who rebuilt from scratch')
    expect(PERSONAS.critic).toContain('Hiring manager who has reviewed 500+ candidates')
    expect(PERSONAS.critic).toContain('Executive coach who works with high-performing people')
  })

  it('strategist has correct personas', () => {
    expect(PERSONAS.strategist).toContain('VC partner who thinks in 10-year compounding arcs')
    expect(PERSONAS.strategist).toContain('Product leader who ships in weeks, not quarters')
    expect(PERSONAS.strategist).toContain('Systems thinker and published author')
  })

  it('aicoach has correct personas', () => {
    expect(PERSONAS.aicoach).toContain('AI researcher who applies tools to real workflows daily')
    expect(PERSONAS.aicoach).toContain('Indie hacker who replaced a team of three with AI tools')
    expect(PERSONAS.aicoach).toContain('Educator who teaches AI literacy to non-technical professionals')
  })
})
