import { createChatCompletionAdapter } from './openai-compat'

export const mistralAdapter = createChatCompletionAdapter(
  'https://api.mistral.ai/v1/chat/completions',
  'Mistral'
)
