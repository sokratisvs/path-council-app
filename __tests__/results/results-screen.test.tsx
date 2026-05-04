import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultsScreen } from '@/components/results/results-screen'
import type { AgentCallResult, SynthesisOutput, IndustryInsiderDef } from '@/lib/agents/types'
import type { PathConsensus } from '@/lib/scoring/types'
import type { SetupConfig } from '@/lib/providers/config'
import type { UserProfile } from '@/lib/questionnaire/types'

const AGENT_OUTPUT = {
  verdict: 'Strong path.',
  topPaths: ['Path A', 'Path B', 'Path C'],
  primaryRisk: 'Tight runway.',
  primaryOpportunity: 'Open market.',
  stance: 'bullish' as const,
  reasoning: 'Solid fundamentals.',
}

const AGENT_RESULTS: Record<string, AgentCallResult> = {
  financial: { agentId: 'financial', output: AGENT_OUTPUT, raw: '{}' },
  psychologist: { agentId: 'psychologist', output: AGENT_OUTPUT, raw: '{}' },
  strategist: { agentId: 'strategist', output: AGENT_OUTPUT, raw: '{}' },
  skills: { agentId: 'skills', output: AGENT_OUTPUT, raw: '{}' },
  industry: { agentId: 'industry', output: AGENT_OUTPUT, raw: '{}' },
}

const CONSENSUS_SCORES: PathConsensus[] = [
  {
    pathName: 'Path Alpha',
    score: 85,
    descriptor: 'Strong consensus',
    supportingAgents: ['financial', 'psychologist', 'strategist'],
    opposingAgents: [],
    neutralAgents: ['skills', 'industry'],
    agentSentiments: [],
  },
]

const SYNTHESIS: SynthesisOutput = {
  paths: [
    {
      name: 'Path Alpha',
      horizon: '6–12 months',
      description: 'Build a freelance practice.',
      consensusScore: 85,
      agentVoices: {
        financial: 'Financially sound.',
        psychologist: 'Identity fit is strong.',
        strategist: 'Good leverage point.',
        skills: 'Skill gap is bridgeable.',
        industry: 'Market demand is healthy.',
      },
      aiAdvantage: 'AI accelerates research and spec writing.',
      milestones: {
        days30: 'Land first project.',
        days60: 'Publish two case studies.',
        days90: 'Establish two retainer conversations.',
      },
      tradeoff: 'Six months of income volatility.',
    },
  ],
  summary: 'You are at a crossroads between stability and creative ownership.',
  strengths: ['Systems thinking', 'Strong delivery track record'],
  blindSpots: ['Undervaluing financial risk', 'Avoiding direct sales'],
  overallConsensus: 'Agents agreed on the freelance path but diverged on timeline.',
}

const INSIDER_DEF: IndustryInsiderDef = {
  title: 'Head of Design at a Series B SaaS',
  systemPrompt: 'You are a head of design...',
  graphNodeBias: ['industry', 'role'],
}

const CONFIG: SetupConfig = {
  provider: 'openai',
  apiKey: 'sk-test',
  model: 'gpt-4o',
  activeAgents: ['financial', 'psychologist', 'strategist', 'skills', 'industry'],
  agentPersonas: { financial: null, psychologist: null, strategist: null, skills: null, industry: null },
}

const PROFILE: UserProfile = {
  situation: 'Mid-career product designer',
  field: 'product design',
  aiUsage: 'daily',
  energisedBy: ['creating', 'building'],
  frustration: 'invisible despite strong delivery',
  vision: 'own studio',
  strengths: 'systems thinking, design execution',
  gaps: 'biz dev, pricing',
  constraints: ['time', 'financial'],
  target: 'freelance or entrepreneurship',
  extra: '',
}

describe('ResultsScreen', () => {
  it('renders summary section', () => {
    render(
      <ResultsScreen
        agentResults={AGENT_RESULTS}
        consensusScores={CONSENSUS_SCORES}
        synthesis={SYNTHESIS}
        industryInsiderDef={INSIDER_DEF}
        config={CONFIG}
        profile={PROFILE}
        onRestart={vi.fn()}
      />
    )
    expect(screen.getByText(SYNTHESIS.summary)).toBeInTheDocument()
  })

  it('renders strength pills', () => {
    render(
      <ResultsScreen
        agentResults={AGENT_RESULTS}
        consensusScores={CONSENSUS_SCORES}
        synthesis={SYNTHESIS}
        industryInsiderDef={INSIDER_DEF}
        config={CONFIG}
        profile={PROFILE}
        onRestart={vi.fn()}
      />
    )
    expect(screen.getByText('Systems thinking')).toBeInTheDocument()
    expect(screen.getByText('Strong delivery track record')).toBeInTheDocument()
  })

  it('renders path cards', () => {
    render(
      <ResultsScreen
        agentResults={AGENT_RESULTS}
        consensusScores={CONSENSUS_SCORES}
        synthesis={SYNTHESIS}
        industryInsiderDef={INSIDER_DEF}
        config={CONFIG}
        profile={PROFILE}
        onRestart={vi.fn()}
      />
    )
    expect(screen.getByText('Path Alpha')).toBeInTheDocument()
    expect(screen.getByText('1st choice')).toBeInTheDocument()
  })

  it('renders Industry Insider display name from def', () => {
    render(
      <ResultsScreen
        agentResults={AGENT_RESULTS}
        consensusScores={CONSENSUS_SCORES}
        synthesis={SYNTHESIS}
        industryInsiderDef={INSIDER_DEF}
        config={CONFIG}
        profile={PROFILE}
        onRestart={vi.fn()}
      />
    )
    expect(screen.getAllByText('Head of Design at a Series B SaaS').length).toBeGreaterThan(0)
  })

  it('calls onRestart when start over is clicked', async () => {
    const onRestart = vi.fn()
    render(
      <ResultsScreen
        agentResults={AGENT_RESULTS}
        consensusScores={CONSENSUS_SCORES}
        synthesis={SYNTHESIS}
        industryInsiderDef={INSIDER_DEF}
        config={CONFIG}
        profile={PROFILE}
        onRestart={onRestart}
      />
    )
    await userEvent.click(screen.getByText('Start over'))
    expect(onRestart).toHaveBeenCalledOnce()
  })

  it('renders debate log toggle', () => {
    render(
      <ResultsScreen
        agentResults={AGENT_RESULTS}
        consensusScores={CONSENSUS_SCORES}
        synthesis={SYNTHESIS}
        industryInsiderDef={INSIDER_DEF}
        config={CONFIG}
        profile={PROFILE}
        onRestart={vi.fn()}
      />
    )
    expect(screen.getByText('Show full agent debate')).toBeInTheDocument()
  })
})
