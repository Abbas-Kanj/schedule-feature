import { type ScheduleTemp } from './schema'

export const initialScheduleTemps: ScheduleTemp[] = [
  {
    id: 'schedule-1',
    name: 'Regular Schedule',
    description: 'Default schedule used during normal working periods.',
    fromDate: new Date('2026-01-01T00:00:00'),
    toDate: new Date('2026-05-31T00:00:00'),
    fromTime: '08:00',
    toTime: '14:00',
    status: 'Published',
    priority: 'High',
  },
  {
    id: 'schedule-2',
    name: 'Summer Schedule',
    description: 'Temporary schedule for the summer period.',
    fromDate: new Date('2026-06-01T00:00:00'),
    toDate: new Date('2026-08-31T00:00:00'),
    fromTime: '08:00',
    toTime: '13:00',
    status: 'Upcoming',
    priority: 'Medium',
  },
  {
    id: 'schedule-3',
    name: 'Night Support',
    description: 'Tentative overnight support schedule.',
    fromDate: new Date('2026-09-01T00:00:00'),
    toDate: new Date('2026-12-31T00:00:00'),
    fromTime: '20:00',
    toTime: '08:00',
    status: 'Tentative',
    priority: 'Low',
  },
]

