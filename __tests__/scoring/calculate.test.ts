import { describe, it, expect } from 'vitest'
import { calculateConsensus } from '@/lib/scoring/calculate'
import type { AgentPathSentiment } from '@/lib/scoring/types'
import type { AgentId } from '@/lib/agents/definitions'

const ACTIVE: AgentId[] = ['financial', 'psychologist', 'strategist', 'skills', 'industry']

describe('calculateConsensus', () => {
  it('returns 100 when all active agents support a path', () => {
    const sentiments: AgentPathSentiment[] = ACTIVE.map((agentId) => ({
      agentId,
      pathName: 'Path A',
      stance: 'support',
      quote: 'This is great.',
    }))
    const [result] = calculateConsensus(sentiments, ACTIVE)
    expect(result.score).toBe(100)
    expect(result.descriptor).toBe('Strong consensus')
  })

  it('returns 100 for two supporters out of two active agents', () => {
    const twoActive: AgentId[] = ['financial', 'psychologist']
    const sentiments: AgentPathSentiment[] = [
      { agentId: 'financial', pathName: 'Path A', stance: 'support', quote: 'Yes.' },
      { agentId: 'psychologist', pathName: 'Path A', stance: 'support', quote: 'Definitely.' },
    ]
    const [result] = calculateConsensus(sentiments, twoActive)
    expect(result.score).toBe(100)
  })

  it('assigns correct descriptor boundaries', () => {
    const make = (stance: AgentPathSentiment['stance'][]): AgentPathSentiment[] =>
      stance.map((s, i) => ({
        agentId: ACTIVE[i],
        pathName: 'P',
        stance: s,
        quote: 'quote',
      }))

    // 4 support, 1 oppose → (8+0)/10*100 = 80 → Strong consensus
    const strong = calculateConsensus(make(['support', 'support', 'support', 'support', 'oppose']), ACTIVE)
    expect(strong[0].descriptor).toBe('Strong consensus')
    expect(strong[0].score).toBe(80)

    // 2 support, 1 neutral, 2 oppose → (4+1)/10*100 = 50 → Moderate consensus
    const moderate = calculateConsensus(make(['support', 'support', 'neutral', 'oppose', 'oppose']), ACTIVE)
    expect(moderate[0].descriptor).toBe('Moderate consensus')
    expect(moderate[0].score).toBe(50)

    // 1 support, 4 oppose → (2+0)/10*100 = 20 → Speculative
    const speculative = calculateConsensus(make(['support', 'oppose', 'oppose', 'oppose', 'oppose']), ACTIVE)
    expect(speculative[0].descriptor).toBe('Speculative')
    expect(speculative[0].score).toBe(20)
  })

  it('groups sentiments by path name', () => {
    const sentiments: AgentPathSentiment[] = [
      { agentId: 'financial', pathName: 'Path A', stance: 'support', quote: 'q' },
      { agentId: 'psychologist', pathName: 'Path B', stance: 'oppose', quote: 'q' },
    ]
    const results = calculateConsensus(sentiments, ACTIVE)
    expect(results).toHaveLength(2)
    const pathNames = results.map((r) => r.pathName)
    expect(pathNames).toContain('Path A')
    expect(pathNames).toContain('Path B')
  })

  it('sorts results by score descending', () => {
    const sentiments: AgentPathSentiment[] = [
      { agentId: 'financial', pathName: 'Low', stance: 'oppose', quote: 'q' },
      { agentId: 'psychologist', pathName: 'High', stance: 'support', quote: 'q' },
    ]
    const results = calculateConsensus(sentiments, ACTIVE)
    expect(results[0].pathName).toBe('High')
    expect(results[1].pathName).toBe('Low')
  })

  it('clamps score to 0 when all oppose', () => {
    const sentiments: AgentPathSentiment[] = ACTIVE.map((agentId) => ({
      agentId,
      pathName: 'Path',
      stance: 'oppose',
      quote: 'No.',
    }))
    const [result] = calculateConsensus(sentiments, ACTIVE)
    expect(result.score).toBe(0)
  })

  it('populates supportingAgents, opposingAgents, neutralAgents correctly', () => {
    const sentiments: AgentPathSentiment[] = [
      { agentId: 'financial', pathName: 'P', stance: 'support', quote: 'q' },
      { agentId: 'psychologist', pathName: 'P', stance: 'neutral', quote: 'q' },
      { agentId: 'strategist', pathName: 'P', stance: 'oppose', quote: 'q' },
    ]
    const [result] = calculateConsensus(sentiments, ACTIVE)
    expect(result.supportingAgents).toEqual(['financial'])
    expect(result.neutralAgents).toEqual(['psychologist'])
    expect(result.opposingAgents).toEqual(['strategist'])
  })

  it('returns empty array when given no sentiments', () => {
    expect(calculateConsensus([], ACTIVE)).toEqual([])
  })

  it('returns empty array when activeAgents is empty (avoids NaN scores)', () => {
    const sentiments: AgentPathSentiment[] = [
      { agentId: 'financial', pathName: 'P', stance: 'support', quote: 'q' },
    ]
    expect(calculateConsensus(sentiments, [])).toEqual([])
  })
})
