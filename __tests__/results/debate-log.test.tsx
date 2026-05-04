import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DebateLog } from '@/components/results/debate-log'
import type { AgentCallResult, IndustryInsiderDef } from '@/lib/agents/types'

const AGENT_OUTPUT = {
  verdict: 'This path is financially viable.',
  topPaths: ['Path A', 'Path B', 'Path C'],
  primaryRisk: 'Runway is 6 months.',
  primaryOpportunity: 'Market is underserved.',
  stance: 'bullish' as const,
  reasoning: 'The user has the fundamentals to make this work within their constraints.',
}

const AGENT_RESULTS: Record<string, AgentCallResult> = {
  financial: { agentId: 'financial', output: AGENT_OUTPUT, raw: JSON.stringify(AGENT_OUTPUT) },
  psychologist: {
    agentId: 'psychologist',
    output: { ...AGENT_OUTPUT, verdict: 'Strong identity alignment.' },
    raw: '{}',
  },
  strategist: { agentId: 'strategist', output: null, raw: '', error: 'timeout' },
}

const INSIDER_DEF: IndustryInsiderDef = {
  title: 'Senior Games Producer',
  systemPrompt: 'You are a games producer...',
  graphNodeBias: ['industry', 'role'],
}

describe('DebateLog', () => {
  it('renders the toggle button collapsed by default', () => {
    render(<DebateLog agentResults={AGENT_RESULTS} />)
    expect(screen.getByText('Show full agent debate')).toBeInTheDocument()
    expect(screen.queryByText('This path is financially viable.')).not.toBeInTheDocument()
  })

  it('expands and shows verdict + reasoning on toggle click', async () => {
    render(<DebateLog agentResults={AGENT_RESULTS} />)
    await userEvent.click(screen.getByText('Show full agent debate'))
    expect(screen.getByText('This path is financially viable.')).toBeInTheDocument()
    expect(screen.getByText('Strong identity alignment.')).toBeInTheDocument()
  })

  it('toggles label to hide on expand', async () => {
    render(<DebateLog agentResults={AGENT_RESULTS} />)
    await userEvent.click(screen.getByText('Show full agent debate'))
    expect(screen.getByText('Hide agent debate')).toBeInTheDocument()
  })

  it('collapses again on second click', async () => {
    render(<DebateLog agentResults={AGENT_RESULTS} />)
    await userEvent.click(screen.getByText('Show full agent debate'))
    await userEvent.click(screen.getByText('Hide agent debate'))
    expect(screen.queryByText('This path is financially viable.')).not.toBeInTheDocument()
  })

  it('does not render errored agent entries', async () => {
    render(<DebateLog agentResults={AGENT_RESULTS} />)
    await userEvent.click(screen.getByText('Show full agent debate'))
    expect(screen.queryByText('Career Strategist')).not.toBeInTheDocument()
  })

  it('shows agent names and roles when expanded', async () => {
    render(<DebateLog agentResults={AGENT_RESULTS} />)
    await userEvent.click(screen.getByText('Show full agent debate'))
    expect(screen.getByText('Financial Expert')).toBeInTheDocument()
    expect(screen.getByText('Monetary feasibility & risk')).toBeInTheDocument()
  })

  it('shows industryInsiderDef.title for industry agent when provided', async () => {
    const resultsWithIndustry: Record<string, AgentCallResult> = {
      industry: { agentId: 'industry', output: AGENT_OUTPUT, raw: JSON.stringify(AGENT_OUTPUT) },
    }
    render(<DebateLog agentResults={resultsWithIndustry} industryInsiderDef={INSIDER_DEF} />)
    await userEvent.click(screen.getByText('Show full agent debate'))
    expect(screen.getByText('Senior Games Producer')).toBeInTheDocument()
  })

  it('shows raw response toggle when raw is available', async () => {
    render(<DebateLog agentResults={AGENT_RESULTS} />)
    await userEvent.click(screen.getByText('Show full agent debate'))
    expect(screen.getAllByText('Show raw response').length).toBeGreaterThan(0)
  })
})
