'use client'

import type { UserProfile } from '@/lib/questionnaire/types'
import { TagSelector } from '@/components/shared/tag-selector'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/shared/form-field'

const CONSTRAINT_OPTIONS = [
  { label: 'Limited time', value: 'limited time available for change' },
  { label: 'Financial pressure', value: 'under financial pressure or constraints' },
  { label: 'Geographic limits', value: 'constrained by geography or location' },
  { label: 'Health considerations', value: 'health considerations affecting my options' },
  { label: 'No major constraints', value: 'no major constraints holding me back' },
]

interface Props {
  answers: Partial<UserProfile>
  onChange: (patch: Partial<UserProfile>) => void
}

export function StepStrengths({ answers, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <FormField label="What are your key strengths?" htmlFor="step-strengths">
        <Textarea
          id="step-strengths"
          value={answers.strengths ?? ''}
          onChange={(e) => onChange({ strengths: e.target.value })}
          placeholder="e.g. Communication, systems thinking, visual design, empathy, writing…"
          rows={3}
          className="bg-elevated border-default rounded-2xl text-primary placeholder:text-faint focus-visible:ring-2 focus-visible:ring-brand/40 resize-none"
        />
      </FormField>

      <FormField label="What skill gaps are holding you back?" htmlFor="step-gaps">
        <Textarea
          id="step-gaps"
          value={answers.gaps ?? ''}
          onChange={(e) => onChange({ gaps: e.target.value })}
          placeholder="e.g. Technical skills, business sense, networking, public speaking, confidence…"
          rows={3}
          className="bg-elevated border-default rounded-2xl text-primary placeholder:text-faint focus-visible:ring-2 focus-visible:ring-brand/40 resize-none"
        />
      </FormField>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-secondary">What constraints apply to you?</p>
        <TagSelector
          options={CONSTRAINT_OPTIONS}
          selected={answers.constraints ?? []}
          mode="multi"
          onChange={(v) => onChange({ constraints: v as string[] })}
        />
      </div>
    </div>
  )
}
