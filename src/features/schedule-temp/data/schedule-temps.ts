import { type ScheduleTemp } from './schema'

export const initialScheduleTemps: ScheduleTemp[] = [
  {
    id: 'schedule-1',
    name: 'Regular Schedule',
    description: 'Default schedule used during normal working periods.',
    priority: 1,
    children: [
      {
        id: 'period-1',
        fromDate: new Date('2026-01-01T00:00:00'),
        toDate: new Date('2026-05-31T00:00:00'),
        description: 'First working period',
      },
      {
        id: 'period-2',
        fromDate: new Date('2026-09-01T00:00:00'),
        toDate: new Date('2026-12-31T00:00:00'),
        description: 'Second working period',
      },
    ],
  },
  {
    id: 'schedule-2',
    name: 'Summer Schedule',
    description: 'Temporary schedule for the summer period.',
    priority: 2,
    children: [
      {
        id: 'period-3',
        fromDate: new Date('2026-06-01T00:00:00'),
        toDate: new Date('2026-08-31T00:00:00'),
        description: 'Summer working period',
      },
    ],
  },
]
