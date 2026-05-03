import { Lock } from 'lucide-react'

export function AppNavbar({ title }: { title?: string }) {
  return (
    <header className="flex items-center justify-between h-12 px-5 bg-surface border-b border-default shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center">
          <span className="text-white text-xs font-bold">P</span>
        </div>
        <span className="text-primary text-sm font-medium hidden sm:block">PathCouncil</span>
      </div>

      {title && (
        <span className="text-muted text-xs absolute left-1/2 -translate-x-1/2 hidden sm:block">
          {title}
        </span>
      )}

      <div className="flex items-center gap-1.5">
        <Lock className="h-3 w-3 text-secure" />
        <span className="text-secure text-xs hidden sm:block">Encrypted locally</span>
      </div>
    </header>
  )
}
