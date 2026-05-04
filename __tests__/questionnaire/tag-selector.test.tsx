import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagSelector } from '@/components/shared/tag-selector'

const OPTIONS = [
  { label: 'Option A', value: 'value-a' },
  { label: 'Option B', value: 'value-b' },
  { label: 'Option C', value: 'value-c' },
]

describe('TagSelector — single mode', () => {
  it('renders all options', () => {
    render(<TagSelector options={OPTIONS} selected="" mode="single" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Option A' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Option B' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Option C' })).toBeInTheDocument()
  })

  it('calls onChange with clicked value', async () => {
    const onChange = vi.fn()
    render(<TagSelector options={OPTIONS} selected="" mode="single" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Option A' }))
    expect(onChange).toHaveBeenCalledWith('value-a')
  })

  it('deselects already-selected value on click', async () => {
    const onChange = vi.fn()
    render(<TagSelector options={OPTIONS} selected="value-b" mode="single" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Option B' }))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('switches selection from one option to another', async () => {
    const onChange = vi.fn()
    render(<TagSelector options={OPTIONS} selected="value-a" mode="single" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Option C' }))
    expect(onChange).toHaveBeenCalledWith('value-c')
  })
})

describe('TagSelector — multi mode', () => {
  it('calls onChange with new value added to selection', async () => {
    const onChange = vi.fn()
    render(
      <TagSelector options={OPTIONS} selected={['value-a']} mode="multi" onChange={onChange} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Option B' }))
    expect(onChange).toHaveBeenCalledWith(['value-a', 'value-b'])
  })

  it('removes value from selection on second click', async () => {
    const onChange = vi.fn()
    render(
      <TagSelector options={OPTIONS} selected={['value-a', 'value-b']} mode="multi" onChange={onChange} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Option A' }))
    expect(onChange).toHaveBeenCalledWith(['value-b'])
  })

  it('respects maxSelections — ignores click when limit reached', async () => {
    const onChange = vi.fn()
    render(
      <TagSelector
        options={OPTIONS}
        selected={['value-a', 'value-b']}
        mode="multi"
        maxSelections={2}
        onChange={onChange}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Option C' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('allows deselecting when at max selections', async () => {
    const onChange = vi.fn()
    render(
      <TagSelector
        options={OPTIONS}
        selected={['value-a', 'value-b']}
        mode="multi"
        maxSelections={2}
        onChange={onChange}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Option A' }))
    expect(onChange).toHaveBeenCalledWith(['value-b'])
  })
})
