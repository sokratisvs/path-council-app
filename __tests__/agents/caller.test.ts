import { describe, it, expect, vi, beforeEach } from 'vitest'
import { callAgent } from '@/lib/agents/caller'
import type { SetupConfig } from '@/lib/providers/config'
import type { UserProfile } from '@/lib/questionnaire/types'
import type { AgentId } from '@/lib/agents/definitions'

const PROFILE: UserProfile = {
  situation: 'early career',
  field: 'software',
  aiUsage: 'daily',
  energisedBy: ['building'],
  frustration: 'slow processes',
  vision: 'own company',
  strengths: 'coding',
  gaps: 'sales',
  constraints: ['time'],
  target: 'entrepreneurship',
  extra: '',
}

const CONFIG: SetupConfig = {
  provider: 'openai',
  apiKey: 'test-key',
  model: 'gpt-4o',
  activeAgents: ['financial', 'psychologist'] as AgentId[],
  agentPersonas: {
    financial: null,
    psychologist: null,
    strategist: null,
    skills: null,
    industry: null,
  },
}

const PERSONAS: Record<AgentId, string | null> = {
  financial: null,
  psychologist: null,
  strategist: null,
  skills: null,
  industry: null,
}

const AGENT_OUTPUT = {
  verdict: 'This path is feasible.',
  topPaths: ['Path A', 'Path B', 'Path C'],
  primaryRisk: 'Financial runway.',
  primaryOpportunity: 'Market timing.',
  stance: 'bullish' as const,
  reasoning: 'Strong fundamentals support this direction.',
}

function mockFetch(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    text: () => Promise.resolve(JSON.stringify(body)),
    json: () => Promise.resolve(body),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('callAgent', () => {
  it('returns parsed output on success with valid JSON', async () => {
    global.fetch = mockFetch({ choices: [{ message: { content: JSON.stringify(AGENT_OUTPUT) } }] })
    const result = await callAgent('financial', CONFIG, PROFILE, PERSONAS)
    expect(result.agentId).toBe('financial')
    expect(result.output).toEqual(AGENT_OUTPUT)
    expect(result.raw).toBe(JSON.stringify(AGENT_OUTPUT))
    expect(result.error).toBeUndefined()
  })

  it('returns null output when response is not valid AgentOutput JSON', async () => {
    global.fetch = mockFetch({ choices: [{ message: { content: 'plain text reply' } }] })
    const result = await callAgent('psychologist', CONFIG, PROFILE, PERSONAS)
    expect(result.agentId).toBe('psychologist')
    expect(result.output).toBeNull()
    expect(result.raw).toBe('plain text reply')
    expect(result.error).toBeUndefined()
  })

  it('returns error on adapter failure', async () => {
    global.fetch = mockFetch('error body', false)
    const result = await callAgent('strategist', CONFIG, PROFILE, PERSONAS)
    expect(result.agentId).toBe('strategist')
    expect(result.output).toBeNull()
    expect(result.raw).toBe('')
    expect(result.error).toBeTruthy()
  })

  it('returns error on fetch throw', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'))
    const result = await callAgent('skills', CONFIG, PROFILE, PERSONAS)
    expect(result.error).toContain('network down')
    expect(result.output).toBeNull()
  })

  it('includes persona prefix in system prompt when persona is set', async () => {
    const spy = mockFetch({ choices: [{ message: { content: '{}' } }] })
    global.fetch = spy
    const personasWithFinancial: Record<AgentId, string | null> = {
      ...PERSONAS,
      financial: 'Bootstrapped founder who reached profitability without VC',
    }
    await callAgent('financial', CONFIG, PROFILE, personasWithFinancial)
    const [, init] = spy.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(init.body as string)
    const systemMsg = body.messages[0].content as string
    expect(systemMsg).toContain('bootstrapped founder')
  })

  it('returns correct agentId regardless of provider', async () => {
    global.fetch = mockFetch({ choices: [{ message: { content: '{}' } }] })
    for (const agentId of ['financial', 'psychologist', 'strategist', 'skills', 'industry'] as AgentId[]) {
      const result = await callAgent(agentId, CONFIG, PROFILE, PERSONAS)
      expect(result.agentId).toBe(agentId)
    }
  })
})
