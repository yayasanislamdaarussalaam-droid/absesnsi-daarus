import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { fromZonedTime, toZonedTime, formatInTimeZone } from 'date-fns-tz'

export const TIMEZONE = 'Asia/Jakarta'

export function toJakartaTime(date: Date | string): Date {
  return toZonedTime(new Date(date), TIMEZONE)
}

export function fromJakartaTime(date: Date | string): Date {
  return fromZonedTime(new Date(date), TIMEZONE)
}

export function formatJakarta(date: Date | string, fmt: string = 'yyyy-MM-dd HH:mm:ss'): string {
  return formatInTimeZone(new Date(date), TIMEZONE, fmt)
}

export function formatJakartaDate(date: Date | string): string {
  return formatInTimeZone(new Date(date), TIMEZONE, 'yyyy-MM-dd')
}

export function formatJakartaTime(date: Date | string): string {
  return formatInTimeZone(new Date(date), TIMEZONE, 'HH:mm')
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: id })
}

export function getJakartaNow(): Date {
  return toZonedTime(new Date(), TIMEZONE)
}

export function getMinutesLate(clockInTime: Date | string, standardTime: string): number {
  const clockIn = toJakartaTime(clockInTime)
  const [hours, minutes] = standardTime.split(':').map(Number)
  const standard = toJakartaTime(new Date(clockIn.getFullYear(), clockIn.getMonth(), clockIn.getDate(), hours, minutes))
  if (isAfter(clockIn, standard)) {
    return Math.floor((clockIn.getTime() - standard.getTime()) / 60000)
  }
  return 0
}

export function canClockOut(clockInTime: Date | string, workDurationMinutes: number = 480): boolean {
  const clockIn = new Date(clockInTime)
  const now = new Date()
  return isAfter(now, new Date(clockIn.getTime() + workDurationMinutes * 60000))
}

export function getClockOutAvailableIn(clockInTime: Date | string, workDurationMinutes: number = 480): { hours: number, minutes: number } {
  const clockIn = new Date(clockInTime)
  const availableAt = new Date(clockIn.getTime() + workDurationMinutes * 60000)
  const now = new Date()
  const diff = availableAt.getTime() - now.getTime()
  if (diff <= 0) return { hours: 0, minutes: 0 }
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000)
  }
}
