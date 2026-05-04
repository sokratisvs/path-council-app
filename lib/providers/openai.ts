import { createChatCompletionAdapter } from './openai-compat'

export const openaiAdapter = createChatCompletionAdapter(
  'https://api.openai.com/v1/chat/completions',
  'OpenAI'
)
