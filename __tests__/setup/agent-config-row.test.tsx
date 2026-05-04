import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentConfigRow } from '@/components/setup/agent-config-row'
import { AGENT_META, PERSONAS } from '@/lib/agents/personas'

describe('AgentConfigRow', () => {
  const defaultProps = {
    agentId: 'realist' as const,
    active: true,
    persona: null,
    canDeactivate: true,
    onToggle: vi.fn(),
    onPersonaChange: vi.fn(),
  }

  it('renders agent name and role', () => {
    render(<AgentConfigRow {...defaultProps} />)
    expect(screen.getByText(AGENT_META.realist.name)).toBeInTheDocument()
    expect(screen.getByText(AGENT_META.realist.role)).toBeInTheDocument()
  })

  it('calls onToggle when active and canDeactivate is true', async () => {
    const onToggle = vi.fn()
    render(<AgentConfigRow {...defaultProps} onToggle={onToggle} canDeactivate={true} />)
    const toggle = screen.getByRole('switch')
    await userEvent.click(toggle)
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('disables toggle switch when active and canDeactivate is false', () => {
    render(<AgentConfigRow {...defaultProps} canDeactivate={false} />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('does not disable toggle when agent is inactive', () => {
    render(<AgentConfigRow {...defaultProps} active={false} canDeactivate={false} />)
    expect(screen.getByRole('switch')).not.toBeDisabled()
  })

  it('shows persona selector', () => {
    render(<AgentConfigRow {...defaultProps} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('persona selector is disabled when agent is inactive', () => {
    render(<AgentConfigRow {...defaultProps} active={false} />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('renders for all agent ids', () => {
    const agents = ['realist', 'optimist', 'critic', 'strategist', 'aicoach'] as const
    for (const id of agents) {
      const { unmount } = render(
        <AgentConfigRow
          agentId={id}
          active={true}
          persona={null}
          canDeactivate={true}
          onToggle={vi.fn()}
          onPersonaChange={vi.fn()}
        />
      )
      expect(screen.getByText(AGENT_META[id].name)).toBeInTheDocument()
      unmount()
    }
  })
})
