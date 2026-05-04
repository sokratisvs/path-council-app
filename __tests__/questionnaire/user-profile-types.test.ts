import { describe, it, expect } from 'vitest'
import type { UserProfile } from '@/lib/questionnaire/types'

describe('UserProfile type contract', () => {
  it('accepts a fully populated profile object', () => {
    const profile: UserProfile = {
      situation: 'mid-career and looking for the next level',
      field: 'software engineering',
      aiUsage: 'a regular user of AI tools in my workflow',
      energisedBy: ['creating things and building from scratch', 'solving complex problems and puzzles'],
      frustration: 'no clear growth path',
      vision: 'leading a product team at a scale-up',
      strengths: 'systems thinking, communication',
      gaps: 'people management, business strategy',
      constraints: ['limited time available for change'],
      target: 'moving into leadership and management',
      extra: 'two kids, 10 hrs/week available',
    }
    expect(profile.situation).toBe('mid-career and looking for the next level')
    expect(profile.energisedBy).toHaveLength(2)
    expect(profile.constraints).toHaveLength(1)
  })

  it('accepts a profile with empty optional fields', () => {
    const profile: UserProfile = {
      situation: '',
      field: '',
      aiUsage: '',
      energisedBy: [],
      frustration: '',
      vision: '',
      strengths: '',
      gaps: '',
      constraints: [],
      target: '',
      extra: '',
    }
    expect(profile.energisedBy).toHaveLength(0)
    expect(profile.constraints).toHaveLength(0)
  })
})
