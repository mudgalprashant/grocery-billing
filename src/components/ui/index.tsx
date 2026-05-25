import type { ReactNode, InputHTMLAttributes } from 'react'

// ─── Card ─────────────────────────────────────────────────────────────────

interface CardProps { children: ReactNode; className?: string; onClick?: () => void }

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-card border border-surface-border p-4 ${onClick ? 'cursor-pointer hover:shadow-lifted transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────

type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'gray'

const badgeColors: Record<BadgeVariant, string> = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-600',
}

export function Badge({ children, variant = 'gray' }: { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColors[variant]}`}>
      {children}
    </span>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-ink">{label}</label>}
      <input
        className={`
          w-full px-3 py-2.5 rounded-xl border text-sm text-ink
          bg-surface placeholder:text-ink-faint
          border-surface-border focus:border-primary-600
          focus:outline-none focus:ring-2 focus:ring-primary-600/20
          transition-colors
          ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg className={`animate-spin text-primary-600 ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="text-ink-faint">{icon}</div>
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="text-sm text-ink-muted max-w-xs">{description}</p>}
    </div>
  )
}
