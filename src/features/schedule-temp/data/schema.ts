import { z } from 'zod'

export const scheduleTempChildSchema = z.object({
  id: z.string(),
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
  description: z.string(),
})

export const scheduleTempSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  priority: z.number().int().min(1),
  children: z.array(scheduleTempChildSchema),
})

export type ScheduleTempChild = z.infer<typeof scheduleTempChildSchema>
export type ScheduleTemp = z.infer<typeof scheduleTempSchema>
