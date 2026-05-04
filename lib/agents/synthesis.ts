import type { SetupConfig } from '@/lib/providers/config'
import type { UserProfile } from '@/lib/questionnaire/types'
import type { AgentCallResult, PathConsensus, SynthesisOutput } from './types'
import { getAdapter } from '@/lib/providers/index'
import { safeParseJSON } from '@/lib/providers/parse-json'
import { serialiseProfile } from './profile-serialiser'
import { SYNTHESIS_SYSTEM_PROMPT, buildSynthesisUserMessage } from './synthesis-prompt'

export async function runSynthesis(
  agentResults: AgentCallResult[],
  consensusScores: PathConsensus[],
  config: SetupConfig,
  profile: UserProfile
): Promise<SynthesisOutput> {
  const userMessage = buildSynthesisUserMessage(
    agentResults,
    consensusScores,
    serialiseProfile(profile)
  )

  const adapter = getAdapter(config.provider)
  const result = await adapter.call({
    apiKey: config.apiKey,
    model: config.model,
    systemPrompt: SYNTHESIS_SYSTEM_PROMPT,
    userMessage,
    maxTokens: 2048,
  })

  if (!result.ok) {
    throw new Error(`Synthesis failed: ${result.error}`)
  }

  const parsed = safeParseJSON<SynthesisOutput>(result.content)
  if (!parsed) {
    throw new Error('Synthesis: could not parse JSON response')
  }

  return parsed
}
