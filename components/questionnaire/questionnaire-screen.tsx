'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { UserProfile } from '@/lib/questionnaire/types'
import { StepWho } from './step-who'
import { StepDrives } from './step-drives'
import { StepStrengths } from './step-strengths'
import { StepNorthStar } from './step-north-star'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    label: 'Step 1 of 4 — who you are',
    title: 'Tell us about yourself',
    description: 'No field is mandatory. The more you share, the sharper the analysis.',
  },
  {
    label: 'Step 2 of 4 — what drives you',
    title: 'What matters most to you?',
    description: 'Pick what genuinely resonates — not what sounds impressive.',
  },
  {
    label: 'Step 3 of 4 — strengths & gaps',
    title: 'What do you bring, and what\'s missing?',
    description: 'Honest answers lead to practical paths, not flattery.',
  },
  {
    label: 'Step 4 of 4 — your north star',
    title: 'What kind of future are you aiming for?',
    description: 'Pick the direction that feels most like you — not the right answer.',
  },
]

const EMPTY_PROFILE: UserProfile = {
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

function buildProfile(answers: Partial<UserProfile>): UserProfile {
  return { ...EMPTY_PROFILE, ...answers }
}

interface Props {
  onComplete: (profile: UserProfile) => void
}

export function QuestionnaireScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<UserProfile>>(() => ({ ...EMPTY_PROFILE }))

  function handleChange(patch: Partial<UserProfile>) {
    setAnswers((prev) => ({ ...prev, ...patch }))
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1)
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      onComplete(buildProfile(answers))
    }
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-md flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">{current.label}</p>
          <h2 className="text-xl font-semibold text-primary">{current.title}</h2>
          <p className="text-sm text-secondary">{current.description}</p>
        </div>

        {/* Step content */}
        {step === 0 && <StepWho answers={answers} onChange={handleChange} />}
        {step === 1 && <StepDrives answers={answers} onChange={handleChange} />}
        {step === 2 && <StepStrengths answers={answers} onChange={handleChange} />}
        {step === 3 && <StepNorthStar answers={answers} onChange={handleChange} />}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-1 text-secondary hover:text-primary disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={[
                  'rounded-full transition-all duration-150',
                  i < step
                    ? 'w-2 h-2 bg-brand'
                    : i === step
                    ? 'w-2.5 h-2.5 bg-brand'
                    : 'w-2 h-2 bg-subtle border border-default',
                ].join(' ')}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="bg-brand text-white rounded-2xl hover:opacity-90 transition-opacity"
          >
            {isLast ? 'Review answers →' : 'Next →'}
          </Button>
        </div>

      </div>
    </div>
  )
}
