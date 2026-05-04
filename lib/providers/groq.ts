import { createChatCompletionAdapter } from './openai-compat'

export const groqAdapter = createChatCompletionAdapter(
  'https://api.groq.com/openai/v1/chat/completions',
  'Groq'
)
