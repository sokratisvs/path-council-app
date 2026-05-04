'use client'

import type { UserProfile } from '@/lib/questionnaire/types'
import { TagSelector } from '@/components/shared/tag-selector'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/shared/form-field'

const TARGET_OPTIONS = [
  { label: 'Leadership', value: 'moving into leadership and management' },
  { label: 'Deep specialist', value: 'becoming a recognised deep specialist in my field' },
  { label: 'Entrepreneurship', value: 'starting or building my own venture' },
  { label: 'Career pivot', value: 'pivoting into a new field or role entirely' },
  { label: 'Portfolio career', value: 'building a portfolio of diverse projects and roles' },
  { label: 'Financial independence', value: 'achieving financial independence' },
  { label: 'Impact work', value: 'doing meaningful impact-driven work' },
  { label: 'Balance & flexibility', value: 'prioritising balance, flexibility, and quality of life' },
]

interface Props {
  answers: Partial<UserProfile>
  onChange: (patch: Partial<UserProfile>) => void
}

export function StepNorthStar({ answers, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-secondary">What direction are you aiming for?</p>
        <TagSelector
          options={TARGET_OPTIONS}
          selected={answers.target ?? ''}
          mode="single"
          onChange={(v) => onChange({ target: v })}
        />
      </div>

      <FormField label="Anything else the agents should know?" htmlFor="step-extra">
        <Textarea
          id="step-extra"
          value={answers.extra ?? ''}
          onChange={(e) => onChange({ extra: e.target.value })}
          placeholder="e.g. Based in a small city, 10 hrs/week to invest, risk-averse, have a family…"
          rows={4}
          className="bg-elevated border-default rounded-2xl text-primary placeholder:text-faint focus-visible:ring-2 focus-visible:ring-brand/40 resize-none"
        />
      </FormField>
    </div>
  )
}
