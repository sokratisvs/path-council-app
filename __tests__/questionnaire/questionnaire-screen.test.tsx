import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionnaireScreen } from '@/components/questionnaire/questionnaire-screen'

describe('QuestionnaireScreen', () => {
  const onComplete = vi.fn()

  beforeEach(() => {
    onComplete.mockClear()
  })

  it('renders step 1 label and title on initial render', () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument()
    expect(screen.getByText('Tell us about yourself')).toBeInTheDocument()
  })

  it('back button is disabled on step 1', () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled()
  })

  it('next button advances to step 2', async () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument()
    expect(screen.getByText('What matters most to you?')).toBeInTheDocument()
  })

  it('back button returns from step 2 to step 1', async () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByText(/step 1 of 4/i)).toBeInTheDocument()
  })

  it('navigates through all four steps', async () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/step 3 of 4/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText(/step 4 of 4/i)).toBeInTheDocument()
  })

  it('shows "Review answers" button text on last step', async () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    for (let i = 0; i < 3; i++) {
      await userEvent.click(screen.getByRole('button', { name: /next/i }))
    }
    expect(screen.getByRole('button', { name: /review answers/i })).toBeInTheDocument()
  })

  it('calls onComplete when submitting from last step', async () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    for (let i = 0; i < 3; i++) {
      await userEvent.click(screen.getByRole('button', { name: /next/i }))
    }
    await userEvent.click(screen.getByRole('button', { name: /review answers/i }))
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('onComplete receives a UserProfile with correct shape', async () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    for (let i = 0; i < 3; i++) {
      await userEvent.click(screen.getByRole('button', { name: /next/i }))
    }
    await userEvent.click(screen.getByRole('button', { name: /review answers/i }))
    const profile = onComplete.mock.calls[0][0]
    expect(profile).toMatchObject({
      situation: expect.any(String),
      field: expect.any(String),
      aiUsage: expect.any(String),
      energisedBy: expect.any(Array),
      frustration: expect.any(String),
      vision: expect.any(String),
      strengths: expect.any(String),
      gaps: expect.any(String),
      constraints: expect.any(Array),
      target: expect.any(String),
      extra: expect.any(String),
    })
  })

  it('preserves step 1 field answer after navigating forward and back', async () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    const fieldInput = screen.getByPlaceholderText(/e\.g\. healthcare/i)
    await userEvent.type(fieldInput, 'software')
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByPlaceholderText(/e\.g\. healthcare/i)).toHaveValue('software')
  })

  it('renders four progress dots', () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    const dots = document.querySelectorAll('.rounded-full')
    expect(dots.length).toBe(4)
  })

  it('step 1 renders the field input', () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    expect(screen.getByPlaceholderText(/e\.g\. healthcare/i)).toBeInTheDocument()
  })

  it('step 2 renders energised-by tags', async () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByRole('button', { name: /creating things/i })).toBeInTheDocument()
  })

  it('step 3 renders constraints tags', async () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByRole('button', { name: /limited time/i })).toBeInTheDocument()
  })

  it('step 4 renders target direction tags', async () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    for (let i = 0; i < 3; i++) {
      await userEvent.click(screen.getByRole('button', { name: /next/i }))
    }
    expect(screen.getByRole('button', { name: /leadership/i })).toBeInTheDocument()
  })

  it('profile includes typed field value on submit', async () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    const fieldInput = screen.getByPlaceholderText(/e\.g\. healthcare/i)
    await userEvent.type(fieldInput, 'design')
    for (let i = 0; i < 3; i++) {
      await userEvent.click(screen.getByRole('button', { name: /next/i }))
    }
    await userEvent.click(screen.getByRole('button', { name: /review answers/i }))
    expect(onComplete.mock.calls[0][0].field).toBe('design')
  })

  it('profile includes selected energisedBy values on submit', async () => {
    render(<QuestionnaireScreen onComplete={onComplete} />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await userEvent.click(screen.getByRole('button', { name: /creating things/i }))
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    await userEvent.click(screen.getByRole('button', { name: /review answers/i }))
    expect(onComplete.mock.calls[0][0].energisedBy).toContain('creating things and building from scratch')
  })
})
