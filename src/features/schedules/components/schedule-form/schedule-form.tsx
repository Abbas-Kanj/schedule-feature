import { useState } from 'react'
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
import { type StepperStep, Stepper } from '@/components/ui/stepper'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { MultiSelect } from '@/components/multi-select'
import { POLICY_TYPE_OPTIONS, SCHEDULE_TYPES } from '../../data/data'
import {
  type DailySchedule,
  type Schedule,
  type ScheduleType,
  scheduleSchema,
} from '../../data/schema'
import { generateId } from '../../utils'
import { EmployeeMultiSelect } from './employee-multi-select'
import { MonthlyFields } from './monthly-fields'
import { WeeklyFields } from './weekly-fields'
import { WeeklyOneFields } from './weekly-one-fields'

const STEPS: StepperStep[] = [
  { id: 'basics', label: 'Basics' },
  { id: 'type', label: 'Type' },
  { id: 'policy', label: 'Policy' },
]

const now = new Date()

function getTypeDefaults(type: ScheduleType) {
  switch (type) {
    case 'weekly':
      return {
        parent_type: 'daily' as const,
        type: 'weekly' as const,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        week: { start_date: '', end_date: '' },
        days: [],
        employees: [],
      }
    case 'weekly_one':
      return {
        parent_type: 'daily' as const,
        type: 'weekly_one' as const,
        days: [],
        employees: [],
      }
    case 'monthly':
      return {
        parent_type: 'daily' as const,
        type: 'monthly' as const,
        year: now.getFullYear(),
        months: [],
        employees: [],
      }
  }
}

function getRegularDefaults() {
  return {
    parent_type: 'regular' as const,
    shift_number: 1,
    split_number: 1,
  }
}

const PARENT_TYPES = [
  {
    value: 'daily',
    label: 'Daily',
  },
  {
    value: 'regular',
    label: 'Regular',
  },
]

type ScheduleFormProps = {
  defaultValues?: Schedule
  onSubmit: (values: Schedule) => void
  disabled?: boolean
  submitLabel?: string
}

// Field names to validate per step differ by parent/schedule type, so this
// is computed loosely rather than typed against RHF's union field paths.
function getStepFields(
  step: number,
  parentType: string,
  type?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (step === 0) {
    return parentType === 'regular'
      ? ['name', 'description', 'parent_type', 'shift_number', 'split_number']
      : ['name', 'description', 'parent_type', 'employees']
  }
  if (step === 1) {
    if (parentType === 'regular') return []
    if (type === 'weekly') return ['type', 'year', 'month', 'week', 'days']
    if (type === 'weekly_one') return ['type', 'days']
    if (type === 'monthly') return ['type', 'year', 'months']
    return ['type']
  }
  return []
}

export function ScheduleForm({
  defaultValues,
  onSubmit,
  disabled = false,
  submitLabel = 'Save schedule',
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
      } as Schedule),
  })

  const [step, setStep] = useState(0)
  const isLastStep = step === STEPS.length - 1

  // eslint-disable-next-line react-hooks/incompatible-library
  const type = form.watch('type')
  const parentType = form.watch('parent_type')
  // Branch fields differ per schedule type, so the shared field components
  // take a loosely-typed control rather than fighting RHF's union typing.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const looseControl = form.control as unknown as Control<any>

  const handleNext = async () => {
    const valid = await form.trigger(getStepFields(step, parentType, type))
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const handleBack = () => setStep((s) => Math.max(s - 1, 0))

  const handleParentTypeChange = (value: string) => {
    if (value === parentType) return
    const current = form.getValues()

    form.reset({
      id: current.id,
      name: current.name,
      description: current.description,
      policy_type: current.policy_type,
      ...(value === 'daily' ? getTypeDefaults('weekly') : getRegularDefaults()),
    } as Schedule)
  }

  const handleTypeChange = (value: string) => {
    if (value === type) return
    const current = form.getValues()
    form.reset({
      id: current.id,
      name: current.name,
      description: current.description,
      policy_type: current.policy_type,
      ...getTypeDefaults(value as ScheduleType),
      employees: (current as DailySchedule).employees ?? [],
    } as Schedule)
  }

  return (
    <Form {...form}>
      <form
        id={'schedule-form'}
        onSubmit={(e) => {
          if (!disabled && !isLastStep) {
            e.preventDefault()
            return
          }
          return form.handleSubmit(onSubmit)(e)
        }}
        className='space-y-6'
      >
        {!disabled && <Stepper steps={STEPS} currentStep={step} />}

        {(disabled || step === 0) && (
          <>
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
            <FormField
              control={form.control}
              name='parent_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={PARENT_TYPES}
                      value={
                        PARENT_TYPES.find((t) => t.value === field.value) ??
                        null
                      }
                      onChange={(opt: { value: string } | null) =>
                        handleParentTypeChange(opt?.value ?? '')
                      }
                      isDisabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {parentType === 'daily' && (
              <EmployeeMultiSelect control={looseControl} disabled={disabled} />
            )}

            {parentType === 'regular' && (
              <>
                <FormField
                  control={form.control}
                  name='shift_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter how many shifts'
                          type='number'
                          disabled={disabled}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                          min={1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='split_number'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Split number</FormLabel>
                      <FormControl>
                        <Input
                          min={1}
                          placeholder='Enter how many splits'
                          type='number'
                          disabled={disabled}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </>
        )}

        {(disabled || step === 1) && (
          <>
            {parentType === 'daily' && (
              <>
                <FormItem>
                  <FormLabel>Schedule type</FormLabel>
                  <Tabs value={type} onValueChange={handleTypeChange}>
                    <TabsList className='grid w-full grid-cols-3'>
                      {SCHEDULE_TYPES.map((t) => (
                        <TabsTrigger
                          key={t.value}
                          value={t.value}
                          disabled={disabled}
                        >
                          {t.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </FormItem>

                {type === 'weekly' && <WeeklyFields disabled={disabled} />}
                {type === 'weekly_one' && (
                  <WeeklyOneFields disabled={disabled} />
                )}
                {type === 'monthly' && <MonthlyFields disabled={disabled} />}
              </>
            )}

            {parentType === 'regular' && (
              <p className='text-muted-foreground text-sm'>
                Regular schedule type configuration coming soon.
              </p>
            )}
          </>
        )}

        {(disabled || step === 2) && (
          <FormField
            control={form.control}
            name='policy_type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy type</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={POLICY_TYPE_OPTIONS}
                    value={
                      POLICY_TYPE_OPTIONS.find(
                        (o) => o.value === field.value
                      ) ?? null
                    }
                    onChange={(opt: { value: string } | null) =>
                      field.onChange(opt?.value ?? '')
                    }
                    isDisabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!disabled && (
          <div className='flex items-center justify-between pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleBack}
              disabled={step === 0}
            >
              Back
            </Button>
            {isLastStep ? (
              <Button key='submit' type='submit'>
                {submitLabel}
              </Button>
            ) : (
              <Button key='next' type='button' onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  )
}
