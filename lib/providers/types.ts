export interface LLMCallParams {
  apiKey: string
  model: string
  systemPrompt: string
  userMessage: string
  maxTokens?: number
}

export type LLMCallResult =
  | { ok: true; content: string }
  | { ok: false; error: string }

export interface LLMAdapter {
  call(params: LLMCallParams): Promise<LLMCallResult>
}
