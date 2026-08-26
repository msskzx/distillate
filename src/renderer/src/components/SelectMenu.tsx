import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export type SelectMenuOption = {
  label: string
  value: string
}

export function SelectMenu({
  ariaLabel,
  icon,
  value,
  options,
  onChange,
}: {
  ariaLabel: string
  icon?: ReactNode
  value: string
  options: SelectMenuOption[]
  onChange(value: string): void
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const selected = options[selectedIndex]

  useEffect(() => {
    if (!open) return
    setActiveIndex(selectedIndex)
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [open, selectedIndex])

  const choose = (index: number) => {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    setOpen(false)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((index) => (index + direction + options.length) % options.length)
      return
    }
    if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault()
      choose(activeIndex)
    }
  }

  return (
    <div ref={root} className="relative min-w-0 flex-1" onKeyDown={onKeyDown}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-10 w-full items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300"
      >
        <span className="shrink-0 text-zinc-500">{icon}</span>
        <span className="min-w-0 flex-1 truncate text-left">{selected?.label}</span>
        <ChevronDown size={14} className={`shrink-0 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label={ariaLabel}
          aria-activedescendant={`${ariaLabel.replace(/\s+/g, '-').toLowerCase()}-${activeIndex}`}
          className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-1.5 shadow-2xl shadow-black/50"
        >
          {options.map((option, index) => (
            <button
              id={`${ariaLabel.replace(/\s+/g, '-').toLowerCase()}-${index}`}
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(index)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                activeIndex === index ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-300'
              }`}
            >
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {option.value === value ? <Check size={14} className="shrink-0 text-amber-300" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
