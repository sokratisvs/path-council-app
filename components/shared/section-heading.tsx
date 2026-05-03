interface Props {
  title: string
  description?: string
}

export function SectionHeading({ title, description }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-sm font-medium text-primary">{title}</h2>
      {description && <p className="text-xs text-muted">{description}</p>}
    </div>
  )
}
