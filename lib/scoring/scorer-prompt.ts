import type { AgentCallResult } from '@/lib/agents/types'
import { AGENT_DEFINITIONS_MAP } from '@/lib/agents/definitions'

export const SCORER_SYSTEM_PROMPT = `You are a neutral analyst reading a set of specialist advisor opinions on a career situation. Your task is to identify which career paths each advisor mentioned and classify their stance toward each path.

For each (advisor, path) pair you find, produce one entry in a JSON array. Each entry must match this schema exactly:

{
  "agentId": "financial" | "psychologist" | "strategist" | "skills" | "industry",
  "pathName": "string — exact path name as mentioned by the advisor",
  "stance": "support" | "neutral" | "oppose",
  "quote": "string — one sentence from the advisor output that best justifies the stance classification"
}

Rules:
- Only include (agentId, pathName) pairs where the advisor explicitly addresses that path.
- If an advisor mentions a path but neither endorses nor opposes it, use "neutral".
- Respond with a JSON array only — no markdown, no commentary, nothing outside the JSON.`

function agentLabel(agentId: string): string {
  const name = AGENT_DEFINITIONS_MAP[agentId as keyof typeof AGENT_DEFINITIONS_MAP]?.name
  return `THE ${(name ?? agentId).toUpperCase()}`
}

export function buildScorerUserMessage(agentResults: AgentCallResult[]): string {
  return agentResults
    .filter((r) => !r.error && r.raw)
    .map((r) => `${agentLabel(r.agentId)} said:\n${r.raw}`)
    .join('\n\n')
}
