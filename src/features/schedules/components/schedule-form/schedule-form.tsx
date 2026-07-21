import { type Control, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { SCHEDULE_TYPES } from '../../data/data'
import {
  type Schedule,
  type ScheduleType,
  scheduleSchema,
} from '../../data/schema'
import { generateId } from '../../utils'
import { EmployeeMultiSelect } from './employee-multi-select'
import { MonthlyFields } from './monthly-fields'
import { WeeklyFields } from './weekly-fields'
import { WeeklyOneFields } from './weekly-one-fields'

const now = new Date()

function getTypeDefaults(type: ScheduleType) {
  switch (type) {
    case 'weekly':
      return {
        type: 'weekly' as const,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        week: { start_date: '', end_date: '' },
        days: [],
      }
    case 'weekly_one':
      return {
        type: 'weekly_one' as const,
        days: [],
      }
    case 'monthly':
      return {
        type: 'monthly' as const,
        year: now.getFullYear(),
        months: [],
      }
  }
}

type ScheduleFormProps = {
  defaultValues?: Schedule
  onSubmit: (values: Schedule) => void
  disabled?: boolean
}

export function ScheduleForm({
  defaultValues,
  onSubmit,
  disabled = false,
}: ScheduleFormProps) {
  const form = useForm<Schedule>({
    resolver: zodResolver(scheduleSchema),
    mode: 'onChange',
    defaultValues:
      defaultValues ??
      ({
        id: generateId(),
        name: '',
        description: '',
        employees: [],
        ...getTypeDefaults('weekly'),
      } as Schedule),
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const type = form.watch('type')
  // Branch fields differ per schedule type, so the shared field components
  // take a loosely-typed control rather than fighting RHF's union typing.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const looseControl = form.control as unknown as Control<any>

  const handleTypeChange = (value: string) => {
    if (value === type) return
    const current = form.getValues()
    form.reset({
      id: current.id,
      name: current.name,
      description: current.description,
      employees: current.employees,
      ...getTypeDefaults(value as ScheduleType),
    } as Schedule)
  }

  return (
    <Form {...form}>
      <form
        id={'schedule-form'}
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-6'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder='e.g. Front Desk Coverage'
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Optional description'
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <EmployeeMultiSelect control={looseControl} disabled={disabled} />

        <FormItem>
          <FormLabel>Schedule type</FormLabel>
          <Tabs value={type} onValueChange={handleTypeChange}>
            <TabsList className='grid w-full grid-cols-3'>
              {SCHEDULE_TYPES.map((t) => (
                <TabsTrigger key={t.value} value={t.value} disabled={disabled}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </FormItem>

        {type === 'weekly' && <WeeklyFields disabled={disabled} />}
        {type === 'weekly_one' && <WeeklyOneFields disabled={disabled} />}
        {type === 'monthly' && <MonthlyFields disabled={disabled} />}
      </form>
    </Form>
  )
}
