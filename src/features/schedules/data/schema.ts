import { z } from 'zod'

export const DAYS_OF_WEEK = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

const daySchema = z.enum(DAYS_OF_WEEK)

export const POLICY_TYPES = ['standard', 'flexible', 'strict'] as const

const policyTypeSchema = z.enum(POLICY_TYPES)

const timeRangeSchema = z
  .object({
    from_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Required'),
    to_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Required'),
  })
  .refine((val) => val.to_time > val.from_time, {
    message: 'End time must be after start time',
    path: ['to_time'],
  })

const dayScheduleSchema = z.object({
  day: daySchema,
  times: z.array(timeRangeSchema).min(1, 'Add at least one time range'),
})

const employeesSchema = z
  .array(
    z.object({
      value: z.string(),
      label: z.string(),
    })
  )
  .min(1, 'Select at least one employee')

const weeklyScheduleSchema = z.object({
  parent_type: z.literal('daily'),
  type: z.literal('weekly'),
  year: z.number(),
  month: z.number().min(1).max(12),
  week: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
  days: z
    .array(dayScheduleSchema)
    .min(1, 'Select at least one day')
    .max(7)
    .refine((days) => new Set(days.map((d) => d.day)).size === days.length, {
      message: 'Each day can only be selected once',
    }),
  employees: employeesSchema,
})

const weeklyOneScheduleSchema = z.object({
  parent_type: z.literal('daily'),
  type: z.literal('weekly_one'),
  days: z
    .array(dayScheduleSchema)
    .min(1, 'Select at least one day')
    .max(7)
    .refine((days) => new Set(days.map((d) => d.day)).size === days.length, {
      message: 'Each day can only be selected once',
    }),
  employees: employeesSchema,
})

const monthlyScheduleSchema = z.object({
  parent_type: z.literal('daily'),
  type: z.literal('monthly'),
  year: z.number(),
  months: z
    .array(
      z.object({
        month: z.number().min(1).max(12),
        days: z
          .array(
            z.object({
              day: z.number().min(1).max(31),
              times: z
                .array(timeRangeSchema)
                .min(1, 'Add at least one time range'),
            })
          )
          .min(1, 'Select at least one day'),
      })
    )
    .min(1, 'Select at least one month')
    .refine(
      (months) => new Set(months.map((m) => m.month)).size === months.length,
      { message: 'Each month can only be selected once' }
    ),
  employees: employeesSchema,
})

const dailyScheduleSchema = z.discriminatedUnion('type', [
  weeklyScheduleSchema,
  weeklyOneScheduleSchema,
  monthlyScheduleSchema,
])

const regularScheduleSchema = z.object({
  parent_type: z.literal('regular'),
  shift_number: z.number(),
  split_number: z.number(),
})

const commonScheduleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  policy_type: policyTypeSchema,
})

export const scheduleSchema = z
  .union([dailyScheduleSchema, regularScheduleSchema])
  .and(commonScheduleSchema)

export type Schedule = z.infer<typeof scheduleSchema>
export type ParentScheduleType = Schedule['parent_type']
export type DailySchedule = Extract<Schedule, { parent_type: 'daily' }>
export type RegularSchedule = Extract<Schedule, { parent_type: 'regular' }>
export type ScheduleType = DailySchedule['type']
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]
export type TimeRange = z.infer<typeof timeRangeSchema>
export type DaySchedule = z.infer<typeof dayScheduleSchema>
export type PolicyType = z.infer<typeof policyTypeSchema>
