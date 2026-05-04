'use client'

import { Separator } from '@/components/ui/separator'

interface SummarySectionProps {
  summary: string
  strengths: string[]
  blindSpots: string[]
}

export function SummarySection({ summary, strengths, blindSpots }: SummarySectionProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-muted text-xs font-medium uppercase tracking-wide">
          Your situation in one read
        </p>
        <p className="text-primary text-base leading-relaxed">{summary}</p>
      </div>

      <Separator className="border-default" />

      <div className="space-y-2">
        <p className="text-muted text-xs font-medium uppercase tracking-wide">What you bring</p>
        <div className="flex flex-wrap gap-2">
          {strengths.map((s) => (
            <span
              key={s}
              className="rounded-xl bg-subtle px-3 py-1 text-secondary text-sm"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-muted text-xs font-medium uppercase tracking-wide">Watch out for</p>
        <div className="flex flex-wrap gap-2">
          {blindSpots.map((b) => (
            <span
              key={b}
              className="rounded-xl bg-danger-dim px-3 py-1 text-danger text-sm"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      <Separator className="border-default" />
    </div>
  )
}
