'use client'

interface ConsensusBarProps {
  score: number
  descriptor: string
}

function fillColor(score: number): string {
  if (score >= 80) return 'bg-positive'
  if (score >= 50) return 'bg-warning'
  return 'bg-danger'
}

export function ConsensusBar({ score, descriptor }: ConsensusBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-muted text-xs">{descriptor}</span>
        <span className="text-muted text-xs font-medium">{score}/100</span>
      </div>
      <div className="h-1.5 w-full rounded-xl bg-subtle overflow-hidden">
        <div
          className={`h-full rounded-xl ${fillColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
