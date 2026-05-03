import { Lock, Cpu, Server } from 'lucide-react'

const FEATURES = [
  { icon: Lock, label: 'Encrypted · Private · Your data stays yours' },
  { icon: Cpu, label: '5 specialist AI agents debate your path' },
  { icon: Server, label: 'Self-host on any VPS for full ownership' },
]

export function AuthLeftPanel() {
  return (
    <div className="hidden md:flex md:w-[420px] flex-col justify-between h-full bg-surface border-r border-default p-10">
      <div>
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="text-primary font-medium text-sm">PathCouncil</span>
        </div>

        <h2 className="text-primary text-2xl font-semibold leading-snug mb-3">
          Your next chapter,<br />debated honestly.
        </h2>
        <p className="text-secondary text-sm leading-relaxed">
          A council of AI specialists analyses your profile, disagrees where they should,
          and surfaces three grounded paths — with the confidence score to match.
        </p>
      </div>

      <div className="space-y-3">
        {FEATURES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 bg-subtle rounded-xl px-3 py-2"
          >
            <Icon className="h-4 w-4 text-muted shrink-0" />
            <span className="text-muted text-xs">{label}</span>
          </div>
        ))}

        <p className="text-faint text-xs flex items-center gap-1.5 pt-1">
          <Lock className="h-3 w-3" />
          Your API key is encrypted in your browser. We never read your data.
        </p>
      </div>
    </div>
  )
}
