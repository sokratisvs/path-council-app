'use client'

import type { UserProfile } from '@/lib/questionnaire/types'
import { TagSelector } from '@/components/shared/tag-selector'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/shared/form-field'

const ENERGISED_OPTIONS = [
  { label: 'Creating things', value: 'creating things and building from scratch' },
  { label: 'Solving problems', value: 'solving complex problems and puzzles' },
  { label: 'Helping people', value: 'directly helping and supporting people' },
  { label: 'Leading teams', value: 'leading and developing high-performing teams' },
  { label: 'Financial security', value: 'building financial security and wealth' },
  { label: 'Creative expression', value: 'creative expression and artistic work' },
  { label: 'Social impact', value: 'making a positive social impact at scale' },
  { label: 'Learning & growth', value: 'continuous learning and personal growth' },
  { label: 'Independence', value: 'independence and autonomy in my work' },
  { label: 'Recognition', value: 'recognition and being known for my expertise' },
]

interface Props {
  answers: Partial<UserProfile>
  onChange: (patch: Partial<UserProfile>) => void
}

export function StepDrives({ answers, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-secondary">What energises you most? <span className="text-muted font-normal">(pick up to 3)</span></p>
        <TagSelector
          options={ENERGISED_OPTIONS}
          selected={answers.energisedBy ?? []}
          mode="multi"
          maxSelections={3}
          onChange={(v) => onChange({ energisedBy: v as string[] })}
        />
      </div>

      <FormField label="What's your biggest frustration right now?" htmlFor="step-frustration">
        <Textarea
          id="step-frustration"
          value={answers.frustration ?? ''}
          onChange={(e) => onChange({ frustration: e.target.value })}
          placeholder="e.g. I feel stuck, no visibility, lack confidence, unclear next step…"
          rows={3}
          className="bg-elevated border-default rounded-2xl text-primary placeholder:text-faint focus-visible:ring-2 focus-visible:ring-brand/40 resize-none"
        />
      </FormField>

      <FormField label="What does your 3–5 year vision look like?" htmlFor="step-vision">
        <Textarea
          id="step-vision"
          value={answers.vision ?? ''}
          onChange={(e) => onChange({ vision: e.target.value })}
          placeholder="e.g. Running my own studio, leading a team, remote work, financial independence…"
          rows={3}
          className="bg-elevated border-default rounded-2xl text-primary placeholder:text-faint focus-visible:ring-2 focus-visible:ring-brand/40 resize-none"
        />
      </FormField>
    </div>
  )
}
