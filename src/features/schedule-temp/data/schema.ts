import { z } from 'zod'

export const scheduleTempSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
  timeFrom: z.string(),
  timeTo: z.string(),
  status: z.enum(['upcoming', 'tentative', 'published']),
  priority: z.enum(['high', 'medium', 'low']),
})

export type ScheduleTemp = z.infer<typeof scheduleTempSchema>

