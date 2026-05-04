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
  activeAgents: ['realist', 'optimist'] as AgentId[],
  agentPersonas: {
    realist: null,
    optimist: null,
    critic: null,
    strategist: null,
    aicoach: null,
  },
}

const PERSONAS: Record<AgentId, string | null> = {
  realist: null,
  optimist: null,
  critic: null,
  strategist: null,
  aicoach: null,
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
  it('returns content on success', async () => {
    global.fetch = mockFetch({ choices: [{ message: { content: 'agent reply' } }] })
    const result = await callAgent('realist', CONFIG, PROFILE, PERSONAS)
    expect(result.agentId).toBe('realist')
    expect(result.content).toBe('agent reply')
    expect(result.error).toBeUndefined()
  })

  it('returns error on adapter failure', async () => {
    global.fetch = mockFetch('error body', false)
    const result = await callAgent('optimist', CONFIG, PROFILE, PERSONAS)
    expect(result.agentId).toBe('optimist')
    expect(result.content).toBe('')
    expect(result.error).toBeTruthy()
  })

  it('returns error on fetch throw', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'))
    const result = await callAgent('critic', CONFIG, PROFILE, PERSONAS)
    expect(result.ok).toBeUndefined()
    expect(result.error).toContain('network down')
  })

  it('includes persona prefix in system prompt when persona is set', async () => {
    const spy = mockFetch({ choices: [{ message: { content: 'ok' } }] })
    global.fetch = spy
    const personasWithRealist: Record<AgentId, string | null> = {
      ...PERSONAS,
      realist: 'Operator who bootstrapped and sold a company',
    }
    await callAgent('realist', CONFIG, PROFILE, personasWithRealist)
    const [, init] = spy.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(init.body as string)
    const systemMsg = body.messages[0].content as string
    expect(systemMsg).toContain('bootstrapped')
  })

  it('returns correct agentId regardless of provider', async () => {
    global.fetch = mockFetch({ choices: [{ message: { content: 'ok' } }] })
    for (const agentId of ['realist', 'optimist', 'critic', 'strategist', 'aicoach'] as AgentId[]) {
      const result = await callAgent(agentId, CONFIG, PROFILE, PERSONAS)
      expect(result.agentId).toBe(agentId)
    }
  })
})
