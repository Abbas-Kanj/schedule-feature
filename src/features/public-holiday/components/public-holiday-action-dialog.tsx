import { useState } from 'react'
import { format } from 'date-fns'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, X } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import { type PublicHoliday } from '../data/schema'
import { usePublicHoliday } from './public-holiday-provider'

const formSchema = z.object({
  id: z.string().trim().min(1, 'ID is required.'),
  name: z.string().trim().min(1, 'Name is required.'),
  holidayDates: z
    .array(z.object({ value: z.string().min(1, 'Date is required.') }))
    .min(1, 'At least one holiday date is required.')
    .refine(
      (dates) => new Set(dates.map((date) => date.value)).size === dates.length,
      'Holiday dates must be unique.'
    ),
})

type HolidayForm = z.infer<typeof formSchema>

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type Props = {
  currentRow?: PublicHoliday
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PublicHolidayActionDialog({
  currentRow,
  open,
  onOpenChange,
}: Props) {
  const isEdit = !!currentRow
  const { selectedYear, saveHoliday } = usePublicHoliday()
  const holidayYear = currentRow?.year ?? selectedYear
  const [calendarOpen, setCalendarOpen] = useState(false)
  const form = useForm<HolidayForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          id: currentRow.id,
          name: currentRow.name,
          holidayDates: currentRow.holidayDates.map((date) => ({
            value: toDateInputValue(date),
          })),
        }
      : { id: '', name: '', holidayDates: [] },
  })
  const holidayDates =
    useWatch({ control: form.control, name: 'holidayDates' }) ?? []

  const updateSelectedDates = (dates: Date[] | undefined) => {
    const uniqueDates = [...new Set((dates ?? []).map(toDateInputValue))]
      .sort()
      .map((value) => ({ value }))

    form.setValue('holidayDates', uniqueDates, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const removeDate = (dateToRemove: string) => {
    form.setValue(
      'holidayDates',
      holidayDates.filter(({ value }) => value !== dateToRemove),
      { shouldDirty: true, shouldValidate: true }
    )
  }

  const onSubmit = (values: HolidayForm) => {
    const holiday: PublicHoliday = {
      id: values.id,
      name: values.name,
      year: currentRow?.year ?? selectedYear,
      holidayDates: values.holidayDates.map(
        ({ value }) => new Date(`${value}T00:00:00`)
      ),
      fixed: currentRow?.fixed ?? false,
    }
    saveHoliday(holiday)
    showSubmittedData(
      holiday,
      isEdit ? 'Public holiday updated:' : 'Public holiday created:'
    )
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        setCalendarOpen(false)
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Public Holiday' : 'Add Public Holiday'}</DialogTitle>
          <DialogDescription>
            Enter the holiday details and click save when you are done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='public-holiday-form' onSubmit={form.handleSubmit(onSubmit)} className='max-h-[65vh] space-y-4 overflow-y-auto px-1 py-1'>
            <FormField control={form.control} name='id' render={({ field }) => (
              <FormItem>
                <FormLabel>ID</FormLabel>
                <FormControl><Input placeholder='HOL-013' disabled={isEdit} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name='name' render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input placeholder='Public holiday name' {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className='space-y-2'>
              <FormLabel>
                Dates ({holidayDates.filter(({ value }) => value).length}{' '}
                day{holidayDates.filter(({ value }) => value).length === 1 ? '' : 's'})
              </FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full justify-start font-normal'
                  >
                    <CalendarDays />
                    Select one or more dates
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='multiple'
                    selected={holidayDates
                      .filter(({ value }) => value)
                      .map(({ value }) => new Date(`${value}T00:00:00`))}
                    onSelect={updateSelectedDates}
                    defaultMonth={new Date(holidayYear, 0)}
                    startMonth={new Date(holidayYear, 0)}
                    endMonth={new Date(holidayYear, 11)}
                    disabled={(date) => date.getFullYear() !== holidayYear}
                  />
                </PopoverContent>
              </Popover>
              <FormField
                control={form.control}
                name='holidayDates'
                render={() => (
                  <FormItem>
                    <div className='flex flex-wrap gap-2'>
                      {holidayDates
                        .filter(({ value }) => value)
                        .map(({ value }) => (
                          <Badge
                            key={value}
                            variant='secondary'
                            className='gap-1 py-1'
                          >
                            {format(new Date(`${value}T00:00:00`), 'dd MMM yyyy')}
                            <button
                              type='button'
                              onClick={() => removeDate(value)}
                              className='rounded-full hover:text-destructive'
                              aria-label={`Remove ${value}`}
                            >
                              <X className='size-3' />
                            </button>
                          </Badge>
                        ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='public-holiday-form'>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
