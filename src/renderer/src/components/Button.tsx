import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-amber-300 text-zinc-950 hover:bg-amber-200 disabled:bg-amber-300/40',
  secondary: 'border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:text-zinc-500',
  ghost: 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:text-zinc-600',
  danger: 'border border-red-900/80 bg-red-950/50 text-red-300 hover:bg-red-950 disabled:text-red-900',
}

export function Button({
  children,
  variant = 'secondary',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; children: ReactNode }) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
