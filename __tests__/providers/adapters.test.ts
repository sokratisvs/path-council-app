import { describe, it, expect, vi, beforeEach } from 'vitest'
import { anthropicAdapter } from '@/lib/providers/anthropic'
import { openaiAdapter } from '@/lib/providers/openai'
import { googleAdapter } from '@/lib/providers/google'
import { mistralAdapter } from '@/lib/providers/mistral'
import { groqAdapter } from '@/lib/providers/groq'
import { getAdapter } from '@/lib/providers/index'

const PARAMS = {
  apiKey: 'test-key',
  model: 'test-model',
  systemPrompt: 'system',
  userMessage: 'user',
}

function mockFetch(body: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
    json: () => Promise.resolve(body),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('anthropicAdapter', () => {
  it('returns ok result on success', async () => {
    global.fetch = mockFetch({ content: [{ text: 'hello' }] })
    const result = await anthropicAdapter.call(PARAMS)
    expect(result).toEqual({ ok: true, content: 'hello' })
  })

  it('returns error on non-ok response', async () => {
    global.fetch = mockFetch('rate limited', false, 429)
    const result = await anthropicAdapter.call(PARAMS)
    expect(result.ok).toBe(false)
    expect((result as { ok: false; error: string }).error).toContain('429')
  })

  it('returns error on empty content', async () => {
    global.fetch = mockFetch({ content: [] })
    const result = await anthropicAdapter.call(PARAMS)
    expect(result.ok).toBe(false)
  })

  it('returns error on fetch throw', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'))
    const result = await anthropicAdapter.call(PARAMS)
    expect(result.ok).toBe(false)
    expect((result as { ok: false; error: string }).error).toContain('network error')
  })

  it('sends correct headers', async () => {
    const spy = mockFetch({ content: [{ text: 'ok' }] })
    global.fetch = spy
    await anthropicAdapter.call(PARAMS)
    const [, init] = spy.mock.calls[0] as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(headers['x-api-key']).toBe('test-key')
    expect(headers['anthropic-version']).toBe('2023-06-01')
  })
})

describe('openaiAdapter', () => {
  it('returns ok result on success', async () => {
    global.fetch = mockFetch({ choices: [{ message: { content: 'hi' } }] })
    const result = await openaiAdapter.call(PARAMS)
    expect(result).toEqual({ ok: true, content: 'hi' })
  })

  it('returns error on non-ok response', async () => {
    global.fetch = mockFetch('unauthorized', false, 401)
    const result = await openaiAdapter.call(PARAMS)
    expect(result.ok).toBe(false)
  })

  it('sends Bearer auth', async () => {
    const spy = mockFetch({ choices: [{ message: { content: 'ok' } }] })
    global.fetch = spy
    await openaiAdapter.call(PARAMS)
    const [, init] = spy.mock.calls[0] as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer test-key')
  })
})

describe('googleAdapter', () => {
  it('returns ok result on success', async () => {
    global.fetch = mockFetch({
      candidates: [{ content: { parts: [{ text: 'gemini response' }] } }],
    })
    const result = await googleAdapter.call(PARAMS)
    expect(result).toEqual({ ok: true, content: 'gemini response' })
  })

  it('sends api key in header and model in URL', async () => {
    const spy = mockFetch({
      candidates: [{ content: { parts: [{ text: 'ok' }] } }],
    })
    global.fetch = spy
    await googleAdapter.call({ ...PARAMS, apiKey: 'my-key', model: 'gemini-pro' })
    const [url, init] = spy.mock.calls[0] as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(headers['x-goog-api-key']).toBe('my-key')
    expect(url).toContain('gemini-pro')
    expect(url).not.toContain('my-key')
  })

  it('returns error on empty candidates', async () => {
    global.fetch = mockFetch({ candidates: [] })
    const result = await googleAdapter.call(PARAMS)
    expect(result.ok).toBe(false)
  })
})

describe('mistralAdapter', () => {
  it('returns ok result on success', async () => {
    global.fetch = mockFetch({ choices: [{ message: { content: 'mistral response' } }] })
    const result = await mistralAdapter.call(PARAMS)
    expect(result).toEqual({ ok: true, content: 'mistral response' })
  })
})

describe('groqAdapter', () => {
  it('returns ok result on success', async () => {
    global.fetch = mockFetch({ choices: [{ message: { content: 'groq response' } }] })
    const result = await groqAdapter.call(PARAMS)
    expect(result).toEqual({ ok: true, content: 'groq response' })
  })

  it('uses groq endpoint', async () => {
    const spy = mockFetch({ choices: [{ message: { content: 'ok' } }] })
    global.fetch = spy
    await groqAdapter.call(PARAMS)
    const [url] = spy.mock.calls[0] as [string]
    expect(url).toContain('groq.com')
  })
})

describe('getAdapter', () => {
  it('returns the correct adapter for each provider', () => {
    expect(getAdapter('anthropic')).toBe(anthropicAdapter)
    expect(getAdapter('openai')).toBe(openaiAdapter)
    expect(getAdapter('google')).toBe(googleAdapter)
    expect(getAdapter('mistral')).toBe(mistralAdapter)
    expect(getAdapter('groq')).toBe(groqAdapter)
  })

  it('throws for unknown provider', () => {
    expect(() => getAdapter('unknown' as never)).toThrow('Unknown provider')
  })
})
