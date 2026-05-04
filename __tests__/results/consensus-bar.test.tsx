import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConsensusBar } from '@/components/results/consensus-bar'

describe('ConsensusBar', () => {
  it('renders descriptor and score', () => {
    render(<ConsensusBar score={82} descriptor="Strong consensus" />)
    expect(screen.getByText('Strong consensus')).toBeInTheDocument()
    expect(screen.getByText('82/100')).toBeInTheDocument()
  })

  it('applies bg-positive for score >= 80', () => {
    const { container } = render(<ConsensusBar score={80} descriptor="Strong consensus" />)
    const fill = container.querySelector('.bg-positive')
    expect(fill).toBeInTheDocument()
  })

  it('applies bg-warning for score 50–79', () => {
    const { container } = render(<ConsensusBar score={65} descriptor="Moderate consensus" />)
    const fill = container.querySelector('.bg-warning')
    expect(fill).toBeInTheDocument()
  })

  it('applies bg-danger for score < 50', () => {
    const { container } = render(<ConsensusBar score={30} descriptor="Speculative" />)
    const fill = container.querySelector('.bg-danger')
    expect(fill).toBeInTheDocument()
  })

  it('sets fill width to score percent', () => {
    const { container } = render(<ConsensusBar score={70} descriptor="Moderate consensus" />)
    const fill = container.querySelector('.bg-warning') as HTMLElement
    expect(fill.style.width).toBe('70%')
  })
})
