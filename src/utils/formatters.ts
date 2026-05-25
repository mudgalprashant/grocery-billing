import { format, parseISO } from 'date-fns'

/** Format a number as Indian Rupees */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

/** Format an ISO date string for display */
export function formatDate(iso: string, pattern = 'dd MMM yyyy'): string {
  return format(parseISO(iso), pattern)
}

/** Format an ISO date string with time */
export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'dd MMM yyyy, hh:mm a')
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** Get initials from a display name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
