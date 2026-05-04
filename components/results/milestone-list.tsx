'use client'

interface MilestoneListProps {
  milestones: { days30: string; days60: string; days90: string }
}

const PERIODS = [
  { label: '30 days', key: 'days30' as const },
  { label: '60 days', key: 'days60' as const },
  { label: '90 days', key: 'days90' as const },
]

export function MilestoneList({ milestones }: MilestoneListProps) {
  return (
    <div className="space-y-2">
      <p className="text-muted text-xs font-medium uppercase tracking-wide">Your roadmap</p>
      <div className="space-y-2">
        {PERIODS.map(({ label, key }) => (
          <div key={key} className="flex items-start gap-3">
            <span className="text-muted text-xs w-14 shrink-0 pt-0.5">{label}</span>
            <span className="text-secondary text-sm">{milestones[key]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
