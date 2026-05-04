'use client'

import type { UserProfile } from '@/lib/questionnaire/types'
import { TagSelector } from '@/components/shared/tag-selector'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/form-field'

const SITUATION_OPTIONS = [
  { label: 'Student', value: 'a student figuring out what to do next' },
  { label: 'Early career', value: 'early in my career and building foundations' },
  { label: 'Mid-career', value: 'mid-career and looking for the next level' },
  { label: 'Senior professional', value: 'a senior professional with deep expertise' },
  { label: 'In transition', value: 'in transition between roles or industries' },
  { label: 'Returning to work', value: 'returning to work after a break' },
  { label: 'Self-employed', value: 'self-employed or freelancing' },
  { label: 'Retired / semi-retired', value: 'retired or semi-retired and exploring options' },
]

const AI_USAGE_OPTIONS = [
  { label: 'Barely use them', value: 'barely using AI tools' },
  { label: 'Experimenting', value: 'experimenting with AI tools occasionally' },
  { label: 'Regular user', value: 'a regular user of AI tools in my workflow' },
  { label: 'Power user', value: 'a power user integrating AI tools deeply into my work' },
]

interface Props {
  answers: Partial<UserProfile>
  onChange: (patch: Partial<UserProfile>) => void
}

export function StepWho({ answers, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-secondary">Where are you right now?</p>
        <TagSelector
          options={SITUATION_OPTIONS}
          selected={answers.situation ?? ''}
          mode="single"
          onChange={(v) => onChange({ situation: v })}
        />
      </div>

      <FormField label="What field or industry are you in?" htmlFor="step-field">
        <Input
          id="step-field"
          value={answers.field ?? ''}
          onChange={(e) => onChange({ field: e.target.value })}
          placeholder="e.g. healthcare, design, software, education, finance, arts…"
          className="bg-elevated border-default rounded-2xl text-primary placeholder:text-faint focus-visible:ring-2 focus-visible:ring-brand/40"
        />
      </FormField>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-secondary">How do you currently use AI tools?</p>
        <TagSelector
          options={AI_USAGE_OPTIONS}
          selected={answers.aiUsage ?? ''}
          mode="single"
          onChange={(v) => onChange({ aiUsage: v })}
        />
      </div>
    </div>
  )
}
