import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentCouncilConfig } from '@/components/setup/agent-council-config'
import { AGENT_IDS, AGENT_META } from '@/lib/agents/personas'
import type { AgentId } from '@/lib/agents/personas'

function buildPersonas(): Record<AgentId, string | null> {
  return Object.fromEntries(AGENT_IDS.map((id) => [id, null])) as Record<AgentId, string | null>
}

describe('AgentCouncilConfig', () => {
  const allActive = [...AGENT_IDS]
  const defaultProps = {
    activeAgents: allActive,
    agentPersonas: buildPersonas(),
    onToggleAgent: vi.fn(),
    onPersonaChange: vi.fn(),
  }

  it('renders all 5 agent rows', () => {
    render(<AgentCouncilConfig {...defaultProps} />)
    for (const id of AGENT_IDS) {
      expect(screen.getByText(AGENT_META[id].name)).toBeInTheDocument()
    }
  })

  it('renders section heading', () => {
    render(<AgentCouncilConfig {...defaultProps} />)
    expect(screen.getByText('Configure your agent council')).toBeInTheDocument()
  })

  it('all toggles are enabled when 5 agents are active', () => {
    render(<AgentCouncilConfig {...defaultProps} />)
    const switches = screen.getAllByRole('switch')
    expect(switches).toHaveLength(5)
    for (const sw of switches) {
      expect(sw).not.toBeDisabled()
    }
  })

  it('toggles are disabled when exactly 2 agents are active', () => {
    render(
      <AgentCouncilConfig
        {...defaultProps}
        activeAgents={['realist', 'optimist']}
      />
    )
    // the 2 active agents should be disabled (can't deactivate below 2)
    const switches = screen.getAllByRole('switch')
    const activeSwitch = switches.filter((sw) => (sw as HTMLButtonElement).dataset.state === 'checked')
    for (const sw of activeSwitch) {
      expect(sw).toBeDisabled()
    }
  })

  it('calls onToggleAgent with the correct id', async () => {
    const onToggleAgent = vi.fn()
    render(<AgentCouncilConfig {...defaultProps} onToggleAgent={onToggleAgent} />)
    const switches = screen.getAllByRole('switch')
    await userEvent.click(switches[0])
    expect(onToggleAgent).toHaveBeenCalledOnce()
    expect(onToggleAgent).toHaveBeenCalledWith(AGENT_IDS[0])
  })
})
