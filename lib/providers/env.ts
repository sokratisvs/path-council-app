export const PROVIDERS = ['anthropic', 'openai', 'google', 'mistral', 'groq'] as const
export type ProviderId = (typeof PROVIDERS)[number]

const ENV_KEYS: Record<ProviderId, { apiKey: string; baseUrl: string }> = {
  anthropic: { apiKey: 'ANTHROPIC_API_KEY', baseUrl: 'ANTHROPIC_BASE_URL' },
  openai:    { apiKey: 'OPENAI_API_KEY',    baseUrl: 'OPENAI_BASE_URL' },
  google:    { apiKey: 'GOOGLE_GENERATIVE_AI_API_KEY', baseUrl: 'GOOGLE_BASE_URL' },
  mistral:   { apiKey: 'MISTRAL_API_KEY',   baseUrl: 'MISTRAL_BASE_URL' },
  groq:      { apiKey: 'GROQ_API_KEY',      baseUrl: 'GROQ_BASE_URL' },
}

export function getProviderEnv(provider: ProviderId) {
  const { apiKey, baseUrl } = ENV_KEYS[provider]
  return {
    apiKey: process.env[apiKey],
    baseUrl: process.env[baseUrl],
  }
}

export function validateProviderEnv() {
  const errors: string[] = []

  for (const provider of PROVIDERS) {
    const { apiKey: keyName, baseUrl: urlName } = ENV_KEYS[provider]
    const hasKey = !!process.env[keyName]
    const hasUrl = !!process.env[urlName]

    if (hasKey && !hasUrl)
      errors.push(`${keyName} is set but ${urlName} is missing`)
    if (hasUrl && !hasKey)
      errors.push(`${urlName} is set but ${keyName} is missing`)
  }

  if (errors.length > 0) {
    throw new Error(
      `Provider configuration error — fix these in your .env:\n` +
      errors.map(e => `  • ${e}`).join('\n')
    )
  }
}
