import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scoreConsensus } from '@/lib/scoring/consensus'
import type { AgentCallResult } from '@/lib/agents/types'
import type { AgentId } from '@/lib/agents/definitions'
import type { SetupConfig } from '@/lib/providers/config'

vi.mock('@/lib/providers/index', () => ({
  getAdapter: vi.fn(),
}))

vi.mock('@/lib/providers/parse-json', () => ({
  safeParseJSON: vi.fn(),
}))

import { getAdapter } from '@/lib/providers/index'
import { safeParseJSON } from '@/lib/providers/parse-json'

const CONFIG: SetupConfig = {
  provider: 'openai',
  apiKey: 'sk-test',
  model: 'gpt-4o',
  activeAgents: ['financial', 'psychologist'],
  agentPersonas: { financial: null, psychologist: null, strategist: null, skills: null, industry: null },
}

const ACTIVE: AgentId[] = ['financial', 'psychologist']

const SUCCESSFUL_RESULTS: AgentCallResult[] = [
  { agentId: 'financial', output: null, raw: 'Financial says Path A is great.' },
  { agentId: 'psychologist', output: null, raw: 'Psychologist agrees on Path A.' },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('scoreConsensus', () => {
  it('returns empty array when fewer than two successful agents', async () => {
    const results: AgentCallResult[] = [
      { agentId: 'financial', output: null, raw: 'ok' },
      { agentId: 'psychologist', output: null, raw: '', error: 'failed' },
    ]
    const result = await scoreConsensus(results, CONFIG, ACTIVE)
    expect(result).toEqual([])
  })

  it('returns empty array when all agents errored', async () => {
    const results: AgentCallResult[] = [
      { agentId: 'financial', output: null, raw: '', error: 'err' },
      { agentId: 'psychologist', output: null, raw: '', error: 'err' },
    ]
    const result = await scoreConsensus(results, CONFIG, ACTIVE)
    expect(result).toEqual([])
  })

  it('returns empty array when adapter call fails', async () => {
    vi.mocked(getAdapter).mockReturnValue({
      call: vi.fn().mockResolvedValue({ ok: false, error: 'rate limit', content: '' }),
    })
    const result = await scoreConsensus(SUCCESSFUL_RESULTS, CONFIG, ACTIVE)
    expect(result).toEqual([])
  })

  it('returns empty array when safeParseJSON fails', async () => {
    vi.mocked(getAdapter).mockReturnValue({
      call: vi.fn().mockResolvedValue({ ok: true, content: 'not json' }),
    })
    vi.mocked(safeParseJSON).mockReturnValue(null)
    const result = await scoreConsensus(SUCCESSFUL_RESULTS, CONFIG, ACTIVE)
    expect(result).toEqual([])
  })

  it('returns empty array when adapter throws', async () => {
    vi.mocked(getAdapter).mockReturnValue({
      call: vi.fn().mockRejectedValue(new Error('network error')),
    })
    const result = await scoreConsensus(SUCCESSFUL_RESULTS, CONFIG, ACTIVE)
    expect(result).toEqual([])
  })

  it('returns scored consensus on success', async () => {
    vi.mocked(getAdapter).mockReturnValue({
      call: vi.fn().mockResolvedValue({ ok: true, content: '[]' }),
    })
    vi.mocked(safeParseJSON).mockReturnValue([
      { agentId: 'financial', pathName: 'Path A', stance: 'support', quote: 'Great path.' },
      { agentId: 'psychologist', pathName: 'Path A', stance: 'support', quote: 'Agreed.' },
    ])
    const result = await scoreConsensus(SUCCESSFUL_RESULTS, CONFIG, ACTIVE)
    expect(result).toHaveLength(1)
    expect(result[0].pathName).toBe('Path A')
    expect(result[0].score).toBe(100)
    expect(result[0].descriptor).toBe('Strong consensus')
  })

  it('calls adapter with scorer system prompt and user message', async () => {
    const mockCall = vi.fn().mockResolvedValue({ ok: true, content: '[]' })
    vi.mocked(getAdapter).mockReturnValue({ call: mockCall })
    vi.mocked(safeParseJSON).mockReturnValue([])

    await scoreConsensus(SUCCESSFUL_RESULTS, CONFIG, ACTIVE)

    expect(mockCall).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'sk-test',
        model: 'gpt-4o',
      })
    )
  })
})
