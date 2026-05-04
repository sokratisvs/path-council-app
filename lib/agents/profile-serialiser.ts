import type { UserProfile } from '@/lib/questionnaire/types'

export function serialiseProfile(profile: UserProfile): string {
  const lines: string[] = [
    `Situation: ${profile.situation}`,
    `Field: ${profile.field}`,
    `AI usage: ${profile.aiUsage}`,
    `Energised by: ${profile.energisedBy.join(', ')}`,
    `Frustration: ${profile.frustration}`,
    `Vision: ${profile.vision}`,
    `Strengths: ${profile.strengths}`,
    `Skill gaps: ${profile.gaps}`,
    `Constraints: ${profile.constraints.join(', ')}`,
    `Target direction: ${profile.target}`,
  ]

  if (profile.extra.trim()) {
    lines.push(`Additional context: ${profile.extra}`)
  }

  return lines.join('\n')
}
