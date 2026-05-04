'use client'

interface TagOption {
  label: string
  value: string
}

interface SingleProps {
  options: TagOption[]
  selected: string
  mode: 'single'
  maxSelections?: never
  onChange: (value: string) => void
}

interface MultiProps {
  options: TagOption[]
  selected: string[]
  mode: 'multi'
  maxSelections?: number
  onChange: (value: string[]) => void
}

type TagSelectorProps = SingleProps | MultiProps

export function TagSelector(props: TagSelectorProps) {
  const { options, mode } = props

  function handleClick(value: string) {
    if (mode === 'single') {
      props.onChange(props.selected === value ? '' : value)
    } else {
      const current = Array.isArray(props.selected) ? props.selected : []
      if (current.includes(value)) {
        props.onChange(current.filter((v) => v !== value))
      } else {
        if (props.maxSelections !== undefined && current.length >= props.maxSelections) return
        props.onChange([...current, value])
      }
    }
  }

  function isSelected(value: string): boolean {
    if (mode === 'single') return props.selected === value
    return (props.selected as string[]).includes(value)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = isSelected(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleClick(opt.value)}
            className={[
              'rounded-xl px-3 py-1.5 text-sm border transition-colors duration-150',
              selected
                ? 'bg-brand-dim border-brand text-brand'
                : 'bg-elevated border-default text-secondary hover:border-subtle hover:text-primary',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
