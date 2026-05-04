import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MilestoneList } from '@/components/results/milestone-list'

const MILESTONES = {
  days30: 'Update your LinkedIn profile.',
  days60: 'Apply to three target roles.',
  days90: 'Complete one contract project.',
}

describe('MilestoneList', () => {
  it('renders the roadmap label', () => {
    render(<MilestoneList milestones={MILESTONES} />)
    expect(screen.getByText('Your roadmap')).toBeInTheDocument()
  })

  it('renders all three period labels', () => {
    render(<MilestoneList milestones={MILESTONES} />)
    expect(screen.getByText('30 days')).toBeInTheDocument()
    expect(screen.getByText('60 days')).toBeInTheDocument()
    expect(screen.getByText('90 days')).toBeInTheDocument()
  })

  it('renders all three milestone texts', () => {
    render(<MilestoneList milestones={MILESTONES} />)
    expect(screen.getByText('Update your LinkedIn profile.')).toBeInTheDocument()
    expect(screen.getByText('Apply to three target roles.')).toBeInTheDocument()
    expect(screen.getByText('Complete one contract project.')).toBeInTheDocument()
  })
})
