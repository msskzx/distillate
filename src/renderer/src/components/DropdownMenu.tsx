import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from './Button'

export type DropdownMenuItem = {
  label: string
  icon?: ReactNode
  onSelect(): void
  disabled?: boolean
  danger?: boolean
}

export function DropdownMenu({ label, items }: { label: string; items: DropdownMenuItem[] }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <Button aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {label} <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>
      {open ? (
        <div role="menu" className="absolute right-0 top-full z-20 mt-2 min-w-48 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 p-1.5 shadow-2xl shadow-black/50">
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              type="button"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                item.danger ? 'text-red-300 hover:bg-red-950/60' : 'text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
