import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns'

export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  return format(new Date(date), formatStr)
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatEventDate(startTime: string | Date, endTime?: string | Date | null): string {
  const start = new Date(startTime)
  const dateStr = format(start, 'PPP')
  const timeStr = format(start, 'p')
  
  if (endTime) {
    const end = new Date(endTime)
    const endTimeStr = format(end, 'p')
    return `${dateStr} • ${timeStr} - ${endTimeStr}`
  }
  
  return `${dateStr} • ${timeStr}`
}

export function isEventPast(date: string | Date): boolean {
  return isPast(new Date(date))
}

export function isEventUpcoming(date: string | Date): boolean {
  return isFuture(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`
  return `${count} ${plural || singular + 's'}`
}

