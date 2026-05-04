import type { AgentCallResult } from '@/lib/agents/types'

export const SCORER_SYSTEM_PROMPT = `You are a neutral analyst reading a set of specialist advisor opinions on a career situation. Your task is to identify which career paths each advisor mentioned and classify their stance toward each path.

For each (advisor, path) pair you find, produce one entry in a JSON array. Each entry must match this schema exactly:

{
  "agentId": "realist" | "optimist" | "critic" | "strategist" | "aicoach",
  "pathName": "string — exact path name as mentioned by the advisor",
  "stance": "support" | "neutral" | "oppose",
  "quote": "string — one sentence from the advisor output that best justifies the stance classification"
}

Rules:
- Only include (agentId, pathName) pairs where the advisor explicitly addresses that path.
- If an advisor mentions a path but neither endorses nor opposes it, use "neutral".
- Respond with a JSON array only — no markdown, no commentary, nothing outside the JSON.`

const AGENT_LABELS: Record<string, string> = {
  realist: 'THE REALIST',
  optimist: 'THE OPTIMIST',
  critic: 'THE CRITIC',
  strategist: 'THE STRATEGIST',
  aicoach: 'THE AI COACH',
}

export function buildScorerUserMessage(agentResults: AgentCallResult[]): string {
  return agentResults
    .filter((r) => !r.error && r.content)
    .map((r) => `${AGENT_LABELS[r.agentId] ?? r.agentId.toUpperCase()} said:\n${r.content}`)
    .join('\n\n')
}
