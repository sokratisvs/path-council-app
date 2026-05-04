import type { ProviderId } from './env'
import type { LLMAdapter } from './types'
import { anthropicAdapter } from './anthropic'
import { openaiAdapter } from './openai'
import { googleAdapter } from './google'
import { mistralAdapter } from './mistral'
import { groqAdapter } from './groq'

const ADAPTERS: Record<ProviderId, LLMAdapter> = {
  anthropic: anthropicAdapter,
  openai: openaiAdapter,
  google: googleAdapter,
  mistral: mistralAdapter,
  groq: groqAdapter,
}

export function getAdapter(providerId: ProviderId): LLMAdapter {
  const adapter = ADAPTERS[providerId]
  if (!adapter) throw new Error(`Unknown provider: ${providerId}`)
  return adapter
}

export type { LLMAdapter, LLMCallParams, LLMCallResult } from './types'
