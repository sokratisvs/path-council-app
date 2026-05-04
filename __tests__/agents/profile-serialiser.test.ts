import { describe, it, expect } from 'vitest'
import { serialiseProfile } from '@/lib/agents/profile-serialiser'
import type { UserProfile } from '@/lib/questionnaire/types'

const FULL_PROFILE: UserProfile = {
  situation: 'mid-career and looking to grow or pivot',
  field: 'product design',
  aiUsage: 'I experiment occasionally but not consistently',
  energisedBy: ['creating things people use and love', 'building my own thing'],
  frustration: 'I feel invisible at my current company',
  vision: 'Running a small product studio',
  strengths: 'Systems thinking, visual design',
  gaps: 'Business development, pricing',
  constraints: ['limited time due to family', 'financial pressure'],
  target: 'starting or growing my own business',
  extra: 'Based in a mid-size European city',
}

describe('serialiseProfile', () => {
  it('includes all required fields', () => {
    const output = serialiseProfile(FULL_PROFILE)
    expect(output).toContain('Situation: mid-career and looking to grow or pivot')
    expect(output).toContain('Field: product design')
    expect(output).toContain('AI usage: I experiment occasionally but not consistently')
    expect(output).toContain('Energised by: creating things people use and love, building my own thing')
    expect(output).toContain('Frustration: I feel invisible at my current company')
    expect(output).toContain('Vision: Running a small product studio')
    expect(output).toContain('Strengths: Systems thinking, visual design')
    expect(output).toContain('Skill gaps: Business development, pricing')
    expect(output).toContain('Constraints: limited time due to family, financial pressure')
    expect(output).toContain('Target direction: starting or growing my own business')
    expect(output).toContain('Additional context: Based in a mid-size European city')
  })

  it('omits Additional context when extra is empty', () => {
    const output = serialiseProfile({ ...FULL_PROFILE, extra: '' })
    expect(output).not.toContain('Additional context')
  })

  it('omits Additional context when extra is whitespace only', () => {
    const output = serialiseProfile({ ...FULL_PROFILE, extra: '   ' })
    expect(output).not.toContain('Additional context')
  })

  it('joins arrays with comma-space separator', () => {
    const output = serialiseProfile({
      ...FULL_PROFILE,
      energisedBy: ['a', 'b', 'c'],
      constraints: ['x', 'y'],
    })
    expect(output).toContain('Energised by: a, b, c')
    expect(output).toContain('Constraints: x, y')
  })

  it('returns a non-empty string', () => {
    const output = serialiseProfile(FULL_PROFILE)
    expect(output.trim().length).toBeGreaterThan(0)
  })
})
