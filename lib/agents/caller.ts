import type { SetupConfig } from '@/lib/providers/config'
import type { UserProfile } from '@/lib/questionnaire/types'
import type { AgentId } from './definitions'
import type { AgentCallResult, AgentOutput } from './types'
import { AGENT_DEFINITIONS_MAP } from './definitions'
import { PERSONA_DEFS } from './personas'
import { serialiseProfile } from './profile-serialiser'
import { getAdapter } from '@/lib/providers/index'
import { safeParseJSON } from '@/lib/providers/parse-json'

export async function callAgent(
  agentId: AgentId,
  config: SetupConfig,
  profile: UserProfile,
  personas: Record<AgentId, string | null>
): Promise<AgentCallResult> {
  const definition = AGENT_DEFINITIONS_MAP[agentId]
  const personaLabel = personas[agentId] ?? null

  const personaDefs = PERSONA_DEFS[agentId]
  const personaPrefix = personaLabel && personaDefs.length > 0
    ? (personaDefs.find((p) => p.label === personaLabel)?.promptPrefix ?? null)
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
      return { agentId, output: null, raw: '', error: result.error }
    }

    const output = safeParseJSON<AgentOutput>(result.content)
    return { agentId, output, raw: result.content }
  } catch (err) {
    return { agentId, output: null, raw: '', error: String(err) }
  }
}
