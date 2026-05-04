import { describe, it, expect } from 'vitest'
import { SCORER_SYSTEM_PROMPT, buildScorerUserMessage } from '@/lib/scoring/scorer-prompt'
import type { AgentCallResult } from '@/lib/agents/types'

const RESULTS: AgentCallResult[] = [
  { agentId: 'realist', content: 'Realist content here.' },
  { agentId: 'optimist', content: 'Optimist content here.' },
  { agentId: 'critic', content: '', error: 'timeout' },
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
})

describe('buildScorerUserMessage', () => {
  it('includes successful agent content', () => {
    const msg = buildScorerUserMessage(RESULTS)
    expect(msg).toContain('Realist content here.')
    expect(msg).toContain('Optimist content here.')
  })

  it('excludes errored agents', () => {
    const msg = buildScorerUserMessage(RESULTS)
    expect(msg).not.toContain('timeout')
    expect(msg).not.toContain('THE CRITIC')
  })

  it('uses uppercase agent labels', () => {
    const msg = buildScorerUserMessage(RESULTS)
    expect(msg).toContain('THE REALIST')
    expect(msg).toContain('THE OPTIMIST')
  })

  it('returns empty string when all agents errored', () => {
    const allFailed: AgentCallResult[] = [
      { agentId: 'realist', content: '', error: 'err' },
      { agentId: 'optimist', content: '', error: 'err' },
    ]
    expect(buildScorerUserMessage(allFailed)).toBe('')
  })

  it('handles aicoach label correctly', () => {
    const results: AgentCallResult[] = [
      { agentId: 'aicoach', content: 'AI coach content.' },
    ]
    const msg = buildScorerUserMessage(results)
    expect(msg).toContain('THE AI COACH')
  })
})
