import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProviderCard } from '@/components/setup/provider-card'
import { PROVIDER_CONFIGS } from '@/lib/providers/config'

const anthropicConfig = PROVIDER_CONFIGS.anthropic

describe('ProviderCard', () => {
  it('renders provider name and subline', () => {
    render(<ProviderCard config={anthropicConfig} selected={false} onSelect={vi.fn()} />)
    expect(screen.getByText('Anthropic')).toBeInTheDocument()
    expect(screen.getByText('Claude')).toBeInTheDocument()
  })

  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn()
    render(<ProviderCard config={anthropicConfig} selected={false} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('applies selected styles when selected', () => {
    render(<ProviderCard config={anthropicConfig} selected={true} onSelect={vi.fn()} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('border-brand')
    expect(button.className).toContain('bg-brand-dim')
  })

  it('applies unselected styles when not selected', () => {
    render(<ProviderCard config={anthropicConfig} selected={false} onSelect={vi.fn()} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-surface')
    expect(button.className).not.toContain('border-brand')
  })

  it('renders all providers correctly', () => {
    const providers = Object.values(PROVIDER_CONFIGS)
    for (const config of providers) {
      const { unmount } = render(
        <ProviderCard config={config} selected={false} onSelect={vi.fn()} />
      )
      expect(screen.getAllByText(config.name).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(config.subline).length).toBeGreaterThanOrEqual(1)
      unmount()
    }
  })
})
