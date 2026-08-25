import type { ReactNode } from 'react'

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="grid gap-2 text-sm font-medium text-zinc-200">
      <span className="flex items-baseline justify-between gap-3">
        {label}
        {hint ? <span className="text-xs font-normal text-zinc-500">{hint}</span> : null}
      </span>
      {children}
    </label>
  )
}

export const fieldClassName =
  'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-300'
