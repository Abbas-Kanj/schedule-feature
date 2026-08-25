import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { PublicHoliday } from '@/features/public-holiday'

const publicHolidaysSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  name: z.string().optional().catch(''),
  fixed: z.array(z.enum(['yes', 'no'])).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/public-holiday/')({
  validateSearch: publicHolidaysSearchSchema,
  component: PublicHoliday,
})
