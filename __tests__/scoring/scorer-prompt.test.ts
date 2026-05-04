import { describe, it, expect } from 'vitest'
import { SCORER_SYSTEM_PROMPT, buildScorerUserMessage } from '@/lib/scoring/scorer-prompt'
import type { AgentCallResult } from '@/lib/agents/types'

const RESULTS: AgentCallResult[] = [
  { agentId: 'financial', output: null, raw: 'Financial expert content here.' },
  { agentId: 'psychologist', output: null, raw: 'Psychologist content here.' },
  { agentId: 'strategist', output: null, raw: '', error: 'timeout' },
]

describe('SCORER_SYSTEM_PROMPT', () => {
  it('is a non-empty string', () => {
    expect(typeof SCORER_SYSTEM_PROMPT).toBe('string')
    expect(SCORER_SYSTEM_PROMPT.length).toBeGreaterThan(50)
  })

  it('mentions JSON requirement', () => {
    expect(SCORER_SYSTEM_PROMPT).toContain('JSON')
  })

  it('lists all three stances', () => {
    expect(SCORER_SYSTEM_PROMPT).toContain('support')
    expect(SCORER_SYSTEM_PROMPT).toContain('neutral')
    expect(SCORER_SYSTEM_PROMPT).toContain('oppose')
  })

  it('uses new domain-expert agent IDs', () => {
    expect(SCORER_SYSTEM_PROMPT).toContain('financial')
    expect(SCORER_SYSTEM_PROMPT).toContain('psychologist')
    expect(SCORER_SYSTEM_PROMPT).toContain('industry')
  })
})

describe('buildScorerUserMessage', () => {
  it('includes successful agent content', () => {
    const msg = buildScorerUserMessage(RESULTS)
    expect(msg).toContain('Financial expert content here.')
    expect(msg).toContain('Psychologist content here.')
  })

  it('excludes errored agents', () => {
    const msg = buildScorerUserMessage(RESULTS)
    expect(msg).not.toContain('timeout')
    expect(msg).not.toContain('THE CAREER STRATEGIST')
  })

  it('uses uppercase agent labels', () => {
    const msg = buildScorerUserMessage(RESULTS)
    expect(msg).toContain('THE FINANCIAL EXPERT')
    expect(msg).toContain('THE PSYCHOLOGIST')
  })

  it('returns empty string when all agents errored', () => {
    const allFailed: AgentCallResult[] = [
      { agentId: 'financial', output: null, raw: '', error: 'err' },
      { agentId: 'psychologist', output: null, raw: '', error: 'err' },
    ]
    expect(buildScorerUserMessage(allFailed)).toBe('')
  })

  it('handles industry insider label correctly', () => {
    const results: AgentCallResult[] = [
      { agentId: 'industry', output: null, raw: 'Industry insider content.' },
    ]
    const msg = buildScorerUserMessage(results)
    expect(msg).toContain('THE INDUSTRY INSIDER')
  })
})
