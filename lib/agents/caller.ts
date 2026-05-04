import type { SetupConfig } from '@/lib/providers/config'
import type { UserProfile } from '@/lib/questionnaire/types'
import type { AgentId } from './definitions'
import type { AgentCallResult } from './types'
import { AGENT_DEFINITIONS_MAP } from './definitions'
import { PERSONA_DEFS } from './personas'
import { serialiseProfile } from './profile-serialiser'
import { getAdapter } from '@/lib/providers/index'

export async function callAgent(
  agentId: AgentId,
  config: SetupConfig,
  profile: UserProfile,
  personas: Record<AgentId, string | null>
): Promise<AgentCallResult> {
  const definition = AGENT_DEFINITIONS_MAP[agentId]
  const personaLabel = personas[agentId] ?? null

  const personaPrefix = personaLabel
    ? (PERSONA_DEFS[agentId].find((p) => p.label === personaLabel)?.promptPrefix ?? null)
    : null

  const serialised = serialiseProfile(profile)
  const systemPrompt = definition.buildSystemPrompt(personaPrefix)

  try {
    const adapter = getAdapter(config.provider)
    const result = await adapter.call({
      apiKey: config.apiKey,
      model: config.model,
      systemPrompt,
      userMessage: serialised,
      maxTokens: 512,
    })

    if (!result.ok) {
      return { agentId, content: '', error: result.error }
    }

    return { agentId, content: result.content }
  } catch (err) {
    return { agentId, content: '', error: String(err) }
  }
}
