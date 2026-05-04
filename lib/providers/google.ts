import type { LLMAdapter, LLMCallParams, LLMCallResult } from './types'

export const googleAdapter: LLMAdapter = {
  async call(params: LLMCallParams): Promise<LLMCallResult> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(params.model)}:generateContent`

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': params.apiKey },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: params.systemPrompt }],
          },
          contents: [
            { role: 'user', parts: [{ text: params.userMessage }] },
          ],
          generationConfig: {
            maxOutputTokens: params.maxTokens ?? 1024,
          },
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        return { ok: false, error: `Google ${res.status}: ${text}` }
      }

      const data = await res.json()
      const content: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (!content) return { ok: false, error: 'Google: empty response' }
      return { ok: true, content }
    } catch (err) {
      return { ok: false, error: `Google: ${String(err)}` }
    }
  },
}
