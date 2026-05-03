import type { ReactNode } from 'react'

interface Props {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, hint, error, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-secondary">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
}
