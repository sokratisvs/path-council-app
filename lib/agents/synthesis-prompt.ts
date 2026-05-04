import type { AgentCallResult, PathConsensus } from './types'

export const SYNTHESIS_SYSTEM_PROMPT = `You are an impartial senior advisor who has just read the outputs of five specialist agents and their disagreement scores. Your task is to synthesise their perspectives into exactly three ranked recommended paths for the user.

You must respond with valid JSON only — no markdown, no commentary, no explanation outside the JSON. The JSON must match this schema exactly:

{
  "paths": [
    {
      "name": "string — short name for this path",
      "horizon": "string — e.g. '6–12 months' or '1–2 years'",
      "description": "string — 2–3 sentence description of the path",
      "consensusScore": number between 0 and 100,
      "agentVoices": {
        "financial": "string — one sentence capturing the Financial Expert's view",
        "psychologist": "string — one sentence capturing the Psychologist's view",
        "strategist": "string — one sentence capturing the Career Strategist's view",
        "skills": "string — one sentence capturing the Skills Analyst's view",
        "industry": "string — one sentence capturing the Industry Insider's view"
      },
      "aiAdvantage": "string — 1–2 sentences on where AI gives the most leverage on this path",
      "milestones": {
        "days30": "string — concrete action in the first 30 days",
        "days60": "string — concrete action in days 31–60",
        "days90": "string — concrete action in days 61–90"
      },
      "tradeoff": "string — one honest sentence on what this path costs"
    }
  ],
  "summary": "string — 2–3 sentences summarising the user's situation and the key tension they face",
  "strengths": ["string — one clear strength the user brings", "..."],
  "blindSpots": ["string — one blind spot or risk the user should watch", "..."],
  "overallConsensus": "string — 1–2 sentences on where agents agreed and where they diverged"
}

Rank paths by realism combined with consensus. Do not invent facts not present in the agent outputs or user profile.`

export function buildSynthesisUserMessage(
  agentResults: AgentCallResult[],
  consensusScores: PathConsensus[],
  serialisedProfile: string
): string {
  const agentSection = agentResults
    .map((r) => {
      const label = r.agentId.toUpperCase()
      if (r.error) return `[${label}]: (unavailable — ${r.error})`
      if (!r.output) return `[${label}]: (no structured output — raw: ${r.raw.slice(0, 200)})`
      return [
        `[${label}]:`,
        `  verdict: ${r.output.verdict}`,
        `  stance: ${r.output.stance}`,
        `  top paths: ${r.output.topPaths.join(' | ')}`,
        `  primary risk: ${r.output.primaryRisk}`,
        `  primary opportunity: ${r.output.primaryOpportunity}`,
        `  reasoning: ${r.output.reasoning}`,
      ].join('\n')
    })
    .join('\n\n')

  const scoreSection = consensusScores
    .map((c) => {
      const supporting = c.supportingAgents.join(', ') || 'none'
      const opposing = c.opposingAgents.join(', ') || 'none'
      return `${c.pathName}: ${c.score}/100 — ${c.descriptor} (${supporting} agreed, ${opposing} pushed back)`
    })
    .join('\n')

  return [
    '## User Profile',
    serialisedProfile,
    '',
    '## Agent Perspectives',
    agentSection,
    '',
    '## Consensus Scores',
    scoreSection || '(no scores available)',
  ].join('\n')
}
