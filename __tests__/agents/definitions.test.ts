import { describe, it, expect } from 'vitest'
import {
  AGENT_IDS_CONST,
  AGENT_DEFINITIONS,
  AGENT_DEFINITIONS_MAP,
} from '@/lib/agents/definitions'
import type { AgentId } from '@/lib/agents/definitions'

describe('AGENT_IDS_CONST', () => {
  it('contains exactly 5 agents', () => {
    expect(AGENT_IDS_CONST).toHaveLength(5)
  })

  it('includes all required ids', () => {
    const ids: AgentId[] = ['financial', 'psychologist', 'strategist', 'skills', 'industry']
    for (const id of ids) expect(AGENT_IDS_CONST).toContain(id)
  })
})

describe('AGENT_DEFINITIONS', () => {
  it('has an entry for every agent id', () => {
    expect(AGENT_DEFINITIONS).toHaveLength(AGENT_IDS_CONST.length)
    for (const id of AGENT_IDS_CONST) {
      expect(AGENT_DEFINITIONS.find((d) => d.id === id)).toBeDefined()
    }
  })

  it.each(AGENT_IDS_CONST as unknown as AgentId[])('%s has required fields', (id) => {
    const def = AGENT_DEFINITIONS_MAP[id]
    expect(def.id).toBe(id)
    expect(def.name).toBeTruthy()
    expect(def.color).toMatch(/^var\(--agent-/)
    expect(def.role).toBeTruthy()
    expect(typeof def.buildSystemPrompt).toBe('function')
  })

  it.each(AGENT_IDS_CONST as unknown as AgentId[])('%s buildSystemPrompt returns a string', (id) => {
    const def = AGENT_DEFINITIONS_MAP[id]
    const prompt = def.buildSystemPrompt(null)
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(20)
  })

  it.each(AGENT_IDS_CONST as unknown as AgentId[])('%s includes persona prefix when provided', (id) => {
    const def = AGENT_DEFINITIONS_MAP[id]
    const prompt = def.buildSystemPrompt('Custom persona prefix')
    expect(prompt).toContain('Custom persona prefix')
  })

  it.each(AGENT_IDS_CONST as unknown as AgentId[])('%s does not include null/undefined when persona is null', (id) => {
    const def = AGENT_DEFINITIONS_MAP[id]
    const prompt = def.buildSystemPrompt(null)
    expect(prompt).not.toContain('null')
    expect(prompt).not.toContain('undefined')
  })
})
