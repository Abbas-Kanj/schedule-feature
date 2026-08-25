import { z } from 'zod'

export const publicHolidaySchema = z.object({
  id: z.string(),
  name: z.string(),
  year: z.number().int(),
  holidayDates: z.array(z.coerce.date()).min(1),
  fixed: z.boolean(),
})

export type PublicHoliday = z.infer<typeof publicHolidaySchema>

export type HolidayYear = {
  year: number
  isOpen: boolean
}
