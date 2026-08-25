import { z } from 'zod'

export const scheduleStatuses = ['Upcoming', 'Tentative', 'Published'] as const
export const schedulePriorities = ['High', 'Medium', 'Low'] as const

export const scheduleTempSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
  fromTime: z.string(),
  toTime: z.string(),
  status: z.enum(scheduleStatuses),
  priority: z.enum(schedulePriorities),
})

export type ScheduleTemp = z.infer<typeof scheduleTempSchema>

