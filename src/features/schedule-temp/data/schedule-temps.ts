import { type ScheduleTemp } from './schema'

export const statusOptions = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Tentative', value: 'tentative' },
  { label: 'Published', value: 'published' },
] as const

export const priorityOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
] as const

export const initialScheduleTemps: ScheduleTemp[] = [
  {
    id: 'schedule-temp-1',
    name: 'Summer Schedule',
    description: 'Temporary summer working schedule.',
    fromDate: new Date(2026, 5, 1),
    toDate: new Date(2026, 8, 30),
    timeFrom: '08:00',
    timeTo: '16:00',
    status: 'published',
    priority: 'high',
  },
  {
    id: 'schedule-temp-2',
    name: 'Maintenance Schedule',
    description: 'Temporary schedule during maintenance work.',
    fromDate: new Date(2026, 9, 1),
    toDate: new Date(2026, 9, 15),
    timeFrom: '20:00',
    timeTo: '04:00',
    status: 'tentative',
    priority: 'medium',
  },
]

