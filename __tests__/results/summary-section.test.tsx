import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SummarySection } from '@/components/results/summary-section'

describe('SummarySection', () => {
  const PROPS = {
    summary: 'You are at a crossroads between stability and growth.',
    strengths: ['Systems thinking', 'Strong network'],
    blindSpots: ['Avoiding financial risk', 'Undervaluing your experience'],
  }

  it('renders the summary text', () => {
    render(<SummarySection {...PROPS} />)
    expect(screen.getByText(PROPS.summary)).toBeInTheDocument()
  })

  it('renders each strength pill', () => {
    render(<SummarySection {...PROPS} />)
    expect(screen.getByText('Systems thinking')).toBeInTheDocument()
    expect(screen.getByText('Strong network')).toBeInTheDocument()
  })

  it('renders each blind spot pill', () => {
    render(<SummarySection {...PROPS} />)
    expect(screen.getByText('Avoiding financial risk')).toBeInTheDocument()
    expect(screen.getByText('Undervaluing your experience')).toBeInTheDocument()
  })

  it('renders section labels', () => {
    render(<SummarySection {...PROPS} />)
    expect(screen.getByText('Your situation in one read')).toBeInTheDocument()
    expect(screen.getByText('What you bring')).toBeInTheDocument()
    expect(screen.getByText('Watch out for')).toBeInTheDocument()
  })

  it('applies danger pill classes to blind spots', () => {
    const { container } = render(<SummarySection {...PROPS} />)
    const dangerPills = container.querySelectorAll('.text-danger')
    expect(dangerPills.length).toBe(2)
  })
})
