import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AgentVoices } from '@/components/results/agent-voices'
import type { AgentPathSentiment } from '@/lib/scoring/types'
import type { IndustryInsiderDef } from '@/lib/agents/types'

const VOICES = {
  financial: 'Financially this is solid.',
  psychologist: 'Great motivational fit.',
  strategist: 'Strong leverage here.',
  skills: 'Skill gap is manageable.',
  industry: 'Market is open right now.',
}

const SENTIMENTS: AgentPathSentiment[] = [
  { agentId: 'financial', pathName: 'Path A', stance: 'support', quote: '' },
  { agentId: 'psychologist', pathName: 'Path A', stance: 'support', quote: '' },
  { agentId: 'strategist', pathName: 'Path A', stance: 'oppose', quote: '' },
  { agentId: 'skills', pathName: 'Path A', stance: 'neutral', quote: '' },
  { agentId: 'industry', pathName: 'Path A', stance: 'support', quote: '' },
]

const INSIDER_DEF: IndustryInsiderDef = {
  title: 'Senior Fintech Product Manager',
  systemPrompt: 'You are a senior fintech PM...',
  graphNodeBias: ['industry', 'role'],
}

describe('AgentVoices', () => {
  it('renders agent perspectives label', () => {
    render(<AgentVoices agentVoices={VOICES} agentSentiments={SENTIMENTS} />)
    expect(screen.getByText('Expert perspectives')).toBeInTheDocument()
  })

  it('renders all agent display names', () => {
    render(<AgentVoices agentVoices={VOICES} agentSentiments={SENTIMENTS} />)
    expect(screen.getByText('Financial Expert')).toBeInTheDocument()
    expect(screen.getByText('Psychologist')).toBeInTheDocument()
    expect(screen.getByText('Career Strategist')).toBeInTheDocument()
    expect(screen.getByText('Skills Analyst')).toBeInTheDocument()
    expect(screen.getByText('Industry Insider')).toBeInTheDocument()
  })

  it('shows industryInsiderDef.title for industry agent when provided', () => {
    render(<AgentVoices agentVoices={VOICES} agentSentiments={SENTIMENTS} industryInsiderDef={INSIDER_DEF} />)
    expect(screen.getByText('Senior Fintech Product Manager')).toBeInTheDocument()
    expect(screen.queryByText('Industry Insider')).not.toBeInTheDocument()
  })

  it('renders all quotes', () => {
    render(<AgentVoices agentVoices={VOICES} agentSentiments={SENTIMENTS} />)
    expect(screen.getByText('Financially this is solid.')).toBeInTheDocument()
    expect(screen.getByText('Great motivational fit.')).toBeInTheDocument()
  })

  it('applies bg-positive dot for support stance', () => {
    const { container } = render(<AgentVoices agentVoices={VOICES} agentSentiments={SENTIMENTS} />)
    const dots = container.querySelectorAll('.bg-positive')
    expect(dots.length).toBeGreaterThan(0)
  })

  it('applies bg-danger dot for oppose stance', () => {
    const { container } = render(<AgentVoices agentVoices={VOICES} agentSentiments={SENTIMENTS} />)
    const dots = container.querySelectorAll('.bg-danger')
    expect(dots.length).toBeGreaterThan(0)
  })

  it('falls back to neutral dot for missing sentiment', () => {
    const { container } = render(<AgentVoices agentVoices={VOICES} agentSentiments={[]} />)
    const dots = container.querySelectorAll('.bg-muted')
    expect(dots.length).toBe(5)
  })
})
