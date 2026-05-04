import { describe, it, expect } from 'vitest'
import { PROVIDER_CONFIGS } from '@/lib/providers/config'

const PROVIDER_IDS = ['anthropic', 'openai', 'google', 'mistral', 'groq'] as const

describe('PROVIDER_CONFIGS', () => {
  it('defines all five providers', () => {
    expect(Object.keys(PROVIDER_CONFIGS)).toEqual(expect.arrayContaining([...PROVIDER_IDS]))
    expect(Object.keys(PROVIDER_CONFIGS)).toHaveLength(5)
  })

  it.each(PROVIDER_IDS)('%s has required fields', (id) => {
    const cfg = PROVIDER_CONFIGS[id]
    expect(cfg.id).toBe(id)
    expect(cfg.name).toBeTruthy()
    expect(cfg.subline).toBeTruthy()
    expect(cfg.keyLabel).toBeTruthy()
    expect(cfg.keyNote).toBeTruthy()
  })

  it.each(PROVIDER_IDS)('%s defaultModel is in its models list', (id) => {
    const cfg = PROVIDER_CONFIGS[id]
    const modelIds = cfg.models.map((m) => m.id)
    expect(modelIds).toContain(cfg.defaultModel)
  })

  it.each(PROVIDER_IDS)('%s has at least one model', (id) => {
    expect(PROVIDER_CONFIGS[id].models.length).toBeGreaterThanOrEqual(1)
  })

  it('anthropic has correct models', () => {
    const ids = PROVIDER_CONFIGS.anthropic.models.map((m) => m.id)
    expect(ids).toContain('claude-opus-4-5')
    expect(ids).toContain('claude-sonnet-4-5')
    expect(ids).toContain('claude-haiku-4-5')
    expect(PROVIDER_CONFIGS.anthropic.defaultModel).toBe('claude-sonnet-4-5')
  })

  it('openai has correct models', () => {
    const ids = PROVIDER_CONFIGS.openai.models.map((m) => m.id)
    expect(ids).toContain('gpt-4o')
    expect(ids).toContain('gpt-4o-mini')
    expect(ids).toContain('gpt-4-turbo')
    expect(PROVIDER_CONFIGS.openai.defaultModel).toBe('gpt-4o')
  })

  it('google has correct models', () => {
    const ids = PROVIDER_CONFIGS.google.models.map((m) => m.id)
    expect(ids).toContain('gemini-2.0-flash')
    expect(ids).toContain('gemini-1.5-pro')
    expect(ids).toContain('gemini-1.5-flash')
    expect(PROVIDER_CONFIGS.google.defaultModel).toBe('gemini-2.0-flash')
  })

  it('mistral has correct models', () => {
    const ids = PROVIDER_CONFIGS.mistral.models.map((m) => m.id)
    expect(ids).toContain('mistral-large-latest')
    expect(ids).toContain('open-mixtral-8x22b')
    expect(PROVIDER_CONFIGS.mistral.defaultModel).toBe('mistral-large-latest')
  })

  it('groq has correct models', () => {
    const ids = PROVIDER_CONFIGS.groq.models.map((m) => m.id)
    expect(ids).toContain('llama-3.3-70b-versatile')
    expect(ids).toContain('mixtral-8x7b-32768')
    expect(PROVIDER_CONFIGS.groq.defaultModel).toBe('llama-3.3-70b-versatile')
  })
})
