import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PathCard } from '@/components/results/path-card'
import type { RecommendedPath, IndustryInsiderDef } from '@/lib/agents/types'
import type { PathConsensus } from '@/lib/scoring/types'

const PATH: RecommendedPath = {
  name: 'Freelance Product Designer',
  horizon: '6–12 months',
  description: 'Build a freelance practice targeting SaaS startups.',
  consensusScore: 78,
  agentVoices: {
    financial: 'Runway is 9 months before break-even.',
    psychologist: 'Strong identity alignment with creative autonomy.',
    strategist: 'First client in 30 days is the key unlock.',
    skills: 'Portfolio gap is the main blocker to address first.',
    industry: 'Demand for senior product designers is high in B2B SaaS.',
  },
  aiAdvantage: 'AI tools can 3× output on UX research and spec writing.',
  milestones: {
    days30: 'Land first paid project via existing network.',
    days60: 'Publish two case studies to portfolio site.',
    days90: 'Have two active retainer conversations.',
  },
  tradeoff: 'Income volatility for the first six months.',
}

const CONSENSUS: PathConsensus = {
  pathName: 'Freelance Product Designer',
  score: 78,
  descriptor: 'Moderate consensus',
  supportingAgents: ['financial', 'psychologist', 'strategist'],
  opposingAgents: [],
  neutralAgents: ['skills', 'industry'],
  agentSentiments: [
    { agentId: 'financial', pathName: 'Freelance Product Designer', stance: 'support', quote: 'Viable.' },
    { agentId: 'psychologist', pathName: 'Freelance Product Designer', stance: 'support', quote: 'Great fit.' },
    { agentId: 'strategist', pathName: 'Freelance Product Designer', stance: 'support', quote: 'Good leverage.' },
    { agentId: 'skills', pathName: 'Freelance Product Designer', stance: 'neutral', quote: 'Manageable gap.' },
    { agentId: 'industry', pathName: 'Freelance Product Designer', stance: 'neutral', quote: 'Market is open.' },
  ],
}

const INSIDER_DEF: IndustryInsiderDef = {
  title: 'Head of Design at a Series B SaaS',
  systemPrompt: 'You are a head of design...',
  graphNodeBias: ['industry', 'role'],
}

describe('PathCard', () => {
  it('renders path name and horizon', () => {
    render(<PathCard path={PATH} rank={1} consensus={CONSENSUS} />)
    expect(screen.getByText('Freelance Product Designer')).toBeInTheDocument()
    expect(screen.getByText('6–12 months')).toBeInTheDocument()
  })

  it('renders rank label for rank 1', () => {
    render(<PathCard path={PATH} rank={1} consensus={CONSENSUS} />)
    expect(screen.getByText('1st choice')).toBeInTheDocument()
  })

  it('renders rank label for rank 2', () => {
    render(<PathCard path={PATH} rank={2} consensus={CONSENSUS} />)
    expect(screen.getByText('2nd choice')).toBeInTheDocument()
  })

  it('renders rank label for rank 3', () => {
    render(<PathCard path={PATH} rank={3} consensus={CONSENSUS} />)
    expect(screen.getByText('3rd choice')).toBeInTheDocument()
  })

  it('renders path description', () => {
    render(<PathCard path={PATH} rank={1} consensus={CONSENSUS} />)
    expect(screen.getByText(PATH.description)).toBeInTheDocument()
  })

  it('renders AI advantage section', () => {
    render(<PathCard path={PATH} rank={1} consensus={CONSENSUS} />)
    expect(screen.getByText('AI advantage')).toBeInTheDocument()
    expect(screen.getByText(PATH.aiAdvantage)).toBeInTheDocument()
  })

  it('renders trade-off', () => {
    render(<PathCard path={PATH} rank={1} consensus={CONSENSUS} />)
    expect(screen.getByText(/Trade-off:/)).toBeInTheDocument()
    expect(screen.getByText(/Income volatility/)).toBeInTheDocument()
  })

  it('uses border-brand for rank 1', () => {
    const { container } = render(<PathCard path={PATH} rank={1} consensus={CONSENSUS} />)
    expect(container.firstChild).toHaveClass('border-brand')
  })

  it('uses border-default for rank 2', () => {
    const { container } = render(<PathCard path={PATH} rank={2} consensus={CONSENSUS} />)
    expect(container.firstChild).toHaveClass('border-default')
    expect(container.firstChild).not.toHaveClass('border-brand')
  })

  it('renders action buttons', () => {
    render(<PathCard path={PATH} rank={1} consensus={CONSENSUS} />)
    expect(screen.getByText('Get mentor prompts')).toBeInTheDocument()
    expect(screen.getByText('Challenge this path')).toBeInTheDocument()
  })

  it('passes industryInsiderDef title to agent voices', () => {
    render(<PathCard path={PATH} rank={1} consensus={CONSENSUS} industryInsiderDef={INSIDER_DEF} />)
    expect(screen.getByText('Head of Design at a Series B SaaS')).toBeInTheDocument()
  })

  it('renders without consensus when undefined', () => {
    render(<PathCard path={PATH} rank={1} consensus={undefined} />)
    expect(screen.getByText('Freelance Product Designer')).toBeInTheDocument()
  })
})
