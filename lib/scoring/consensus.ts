import type { SetupConfig } from '@/lib/providers/config'
import type { AgentId } from '@/lib/agents/definitions'
import type { AgentCallResult } from '@/lib/agents/types'
import type { AgentPathSentiment, PathConsensus } from './types'
import { getAdapter } from '@/lib/providers/index'
import { safeParseJSON } from '@/lib/providers/parse-json'
import { SCORER_SYSTEM_PROMPT, buildScorerUserMessage } from './scorer-prompt'
import { calculateConsensus } from './calculate'

export async function scoreConsensus(
  agentResults: AgentCallResult[],
  config: SetupConfig,
  activeAgents: AgentId[]
): Promise<PathConsensus[]> {
  const successful = agentResults.filter((r) => !r.error && r.raw)
  if (successful.length < 2) return []

  const userMessage = buildScorerUserMessage(successful)

  try {
    const adapter = getAdapter(config.provider)
    const result = await adapter.call({
      apiKey: config.apiKey,
      model: config.model,
      systemPrompt: SCORER_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 1024,
    })

    if (!result.ok) return []

    const sentiments = safeParseJSON<AgentPathSentiment[]>(result.content)
    if (!sentiments) return []

    return calculateConsensus(sentiments, activeAgents)
  } catch {
    return []
  }
}
