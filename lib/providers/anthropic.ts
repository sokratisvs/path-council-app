import type { LLMAdapter, LLMCallParams, LLMCallResult } from './types'

export const anthropicAdapter: LLMAdapter = {
  async call(params: LLMCallParams): Promise<LLMCallResult> {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': params.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: params.model,
          max_tokens: params.maxTokens ?? 1024,
          system: params.systemPrompt,
          messages: [{ role: 'user', content: params.userMessage }],
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        return { ok: false, error: `Anthropic ${res.status}: ${text}` }
      }

      const data = await res.json()
      const content: string = data?.content?.[0]?.text ?? ''
      if (!content) return { ok: false, error: 'Anthropic: empty response' }
      return { ok: true, content }
    } catch (err) {
      return { ok: false, error: `Anthropic: ${String(err)}` }
    }
  },
}
