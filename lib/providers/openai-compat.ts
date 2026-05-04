import type { LLMAdapter, LLMCallParams, LLMCallResult } from './types'

export function createChatCompletionAdapter(url: string, name: string): LLMAdapter {
  return {
    async call(params: LLMCallParams): Promise<LLMCallResult> {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${params.apiKey}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: params.model,
            max_tokens: params.maxTokens ?? 1024,
            messages: [
              { role: 'system', content: params.systemPrompt },
              { role: 'user', content: params.userMessage },
            ],
          }),
        })

        if (!res.ok) {
          const text = await res.text()
          return { ok: false, error: `${name} ${res.status}: ${text}` }
        }

        const data = await res.json()
        const content: string = data?.choices?.[0]?.message?.content ?? ''
        if (!content) return { ok: false, error: `${name}: empty response` }
        return { ok: true, content }
      } catch (err) {
        return { ok: false, error: `${name}: ${String(err)}` }
      }
    },
  }
}
