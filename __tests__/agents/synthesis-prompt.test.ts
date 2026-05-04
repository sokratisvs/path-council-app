import { describe, it, expect } from 'vitest'
import { SYNTHESIS_SYSTEM_PROMPT, buildSynthesisUserMessage } from '@/lib/agents/synthesis-prompt'
import type { AgentCallResult, AgentOutput, PathConsensus } from '@/lib/agents/types'

const AGENT_OUTPUT: AgentOutput = {
  verdict: 'Strong path forward.',
  topPaths: ['Path A', 'Path B', 'Path C'],
  primaryRisk: 'Runway is tight.',
  primaryOpportunity: 'Market is open.',
  stance: 'bullish',
  reasoning: 'The fundamentals support this transition given current market conditions.',
}

const AGENT_RESULTS: AgentCallResult[] = [
  { agentId: 'financial', output: AGENT_OUTPUT, raw: JSON.stringify(AGENT_OUTPUT) },
  { agentId: 'psychologist', output: AGENT_OUTPUT, raw: JSON.stringify(AGENT_OUTPUT) },
  { agentId: 'strategist', output: null, raw: '', error: 'timeout' },
]

const CONSENSUS: PathConsensus[] = [
  {
    pathName: 'Path A',
    score: 80,
    descriptor: 'Strong consensus',
    supportingAgents: ['financial', 'psychologist'],
    opposingAgents: ['strategist'],
    neutralAgents: [],
    agentSentiments: [],
  },
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

  it('uses new domain-expert agent IDs', () => {
    expect(SYNTHESIS_SYSTEM_PROMPT).toContain('financial')
    expect(SYNTHESIS_SYSTEM_PROMPT).toContain('psychologist')
    expect(SYNTHESIS_SYSTEM_PROMPT).toContain('strategist')
    expect(SYNTHESIS_SYSTEM_PROMPT).toContain('skills')
    expect(SYNTHESIS_SYSTEM_PROMPT).toContain('industry')
  })
})

describe('buildSynthesisUserMessage', () => {
  it('includes serialised profile', () => {
    const msg = buildSynthesisUserMessage(AGENT_RESULTS, CONSENSUS, 'Field: design')
    expect(msg).toContain('Field: design')
  })

  it('includes structured agent output fields', () => {
    const msg = buildSynthesisUserMessage(AGENT_RESULTS, CONSENSUS, 'profile')
    expect(msg).toContain('Strong path forward.')
    expect(msg).toContain('bullish')
    expect(msg).toContain('Runway is tight.')
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
