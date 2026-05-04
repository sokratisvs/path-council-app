import { describe, it, expect } from 'vitest'
import { SYNTHESIS_SYSTEM_PROMPT, buildSynthesisUserMessage } from '@/lib/agents/synthesis-prompt'
import type { AgentCallResult, PathConsensus } from '@/lib/agents/types'

const AGENT_RESULTS: AgentCallResult[] = [
  { agentId: 'realist', content: 'Realist output here.' },
  { agentId: 'optimist', content: 'Optimist output here.' },
  { agentId: 'critic', content: '', error: 'timeout' },
]

const CONSENSUS: PathConsensus[] = [
  { pathName: 'Path A', score: 80, supportingAgents: ['realist', 'optimist'], opposingAgents: ['critic'] },
]

describe('SYNTHESIS_SYSTEM_PROMPT', () => {
  it('is a non-empty string', () => {
    expect(typeof SYNTHESIS_SYSTEM_PROMPT).toBe('string')
    expect(SYNTHESIS_SYSTEM_PROMPT.length).toBeGreaterThan(100)
  })

  it('mentions JSON schema requirement', () => {
    expect(SYNTHESIS_SYSTEM_PROMPT).toContain('JSON')
  })

  it('mentions three paths', () => {
    expect(SYNTHESIS_SYSTEM_PROMPT).toContain('three')
  })
})

describe('buildSynthesisUserMessage', () => {
  it('includes serialised profile', () => {
    const msg = buildSynthesisUserMessage(AGENT_RESULTS, CONSENSUS, 'Field: design')
    expect(msg).toContain('Field: design')
  })

  it('includes agent outputs', () => {
    const msg = buildSynthesisUserMessage(AGENT_RESULTS, CONSENSUS, 'profile')
    expect(msg).toContain('Realist output here.')
    expect(msg).toContain('Optimist output here.')
  })

  it('marks errored agents as unavailable', () => {
    const msg = buildSynthesisUserMessage(AGENT_RESULTS, CONSENSUS, 'profile')
    expect(msg).toContain('unavailable')
    expect(msg).toContain('timeout')
  })

  it('includes consensus scores', () => {
    const msg = buildSynthesisUserMessage(AGENT_RESULTS, CONSENSUS, 'profile')
    expect(msg).toContain('Path A')
    expect(msg).toContain('80/100')
  })

  it('handles empty consensus gracefully', () => {
    const msg = buildSynthesisUserMessage(AGENT_RESULTS, [], 'profile')
    expect(msg).toContain('no scores available')
  })
})
