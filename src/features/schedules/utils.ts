import {
  addDays,
  differenceInMinutes,
  format,
  getDaysInMonth,
  parse,
  startOfMonth,
} from 'date-fns'
import { type DayOfWeek, type Schedule, type TimeRange } from './data/schema'

export function generateId() {
  return crypto.randomUUID()
}

export function calculateHours(times: TimeRange[]): number {
  const totalMinutes = times.reduce((sum, t) => {
    if (!t.from_time || !t.to_time) return sum
    const from = parse(t.from_time, 'HH:mm', new Date())
    const to = parse(t.to_time, 'HH:mm', new Date())
    return sum + Math.max(differenceInMinutes(to, from), 0)
  }, 0)

  return Math.round((totalMinutes / 60) * 100) / 100
}

export type MonthDay = {
  date: Date
  date_str: string
  weekday: DayOfWeek
}

export function getDaysOfMonth(year: number, month: number): MonthDay[] {
  const monthStart = startOfMonth(new Date(year, month - 1))
  const count = getDaysInMonth(monthStart)

  return Array.from({ length: count }, (_, i) => {
    const date = addDays(monthStart, i)
    return {
      date,
      date_str: format(date, 'yyyy-MM-dd'),
      weekday: format(date, 'EEEE').toLowerCase() as DayOfWeek,
    }
  })
}

export function getDaysInMonthArray(year: number, month: number) {
  const count = getDaysInMonth(new Date(year, month - 1))
  return Array.from({ length: count }, (_, i) => i + 1)
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function getScheduleTotalHours(schedule: Schedule): number {
  if (schedule.type === 'daily') {
    return calculateHours(schedule.times)
  }

  if (schedule.type === 'weekly') {
    return schedule.days.reduce(
      (sum, d) => sum + calculateHours(d.times),
      0
    )
  }

  return schedule.months.reduce(
    (sum, m) =>
      sum + m.days.reduce((daySum, d) => daySum + calculateHours(d.times), 0),
    0
  )
}

export function getScheduleSummary(schedule: Schedule): string {
  if (schedule.type === 'daily') {
    const hours = calculateHours(schedule.times)
    const rangeCount = schedule.times.length
    return `${capitalize(schedule.day)} · ${rangeCount} range${rangeCount > 1 ? 's' : ''} · ${hours}h`
  }

  if (schedule.type === 'weekly') {
    const dayCount = schedule.days.length
    return `Week of ${schedule.week.start_date} to ${schedule.week.end_date} · ${dayCount} day${dayCount > 1 ? 's' : ''}`
  }

  const monthCount = schedule.months.length
  const dayCount = schedule.months.reduce((sum, m) => sum + m.days.length, 0)
  return `${monthCount} month${monthCount > 1 ? 's' : ''} · ${dayCount} day${dayCount > 1 ? 's' : ''}`
}
