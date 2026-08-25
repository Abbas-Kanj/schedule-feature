import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Clock3 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { schedulePriorities, scheduleStatuses, type ScheduleTemp } from '../data/schema'
import { formatTimeRange } from '../data/time-range'

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

const formSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required.'),
    description: z.string().trim().min(1, 'Description is required.'),
    fromDate: z.date({ error: 'From date is required.' }),
    toDate: z.date({ error: 'To date is required.' }),
    fromTime: z.string().regex(timePattern, 'From time is required.'),
    toTime: z.string().regex(timePattern, 'To time is required.'),
    status: z.enum(scheduleStatuses),
    priority: z.enum(schedulePriorities),
  })
  .refine((values) => values.toDate >= values.fromDate, {
    message: 'To date must be on or after From date.',
    path: ['toDate'],
  })

export type ScheduleTempForm = z.infer<typeof formSchema>

type Props = {
  open: boolean
  currentRow: ScheduleTemp | null
  onOpenChange: (open: boolean) => void
  onSave: (values: ScheduleTempForm) => void
}

export function ScheduleTempActionDialog({ open, currentRow, onOpenChange, onSave }: Props) {
  const isEdit = !!currentRow
  const form = useForm<ScheduleTempForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? {
          name: currentRow.name,
          description: currentRow.description,
          fromDate: currentRow.fromDate,
          toDate: currentRow.toDate,
          fromTime: currentRow.fromTime,
          toTime: currentRow.toTime,
          status: currentRow.status,
          priority: currentRow.priority,
        }
      : {
          name: '',
          description: '',
          fromDate: undefined!,
          toDate: undefined!,
          fromTime: '08:00',
          toTime: '13:00',
          status: 'Upcoming',
          priority: 'Medium',
        },
  })
  const fromTime = useWatch({ control: form.control, name: 'fromTime' })
  const toTime = useWatch({ control: form.control, name: 'toTime' })
  const timeRange = formatTimeRange(fromTime, toTime)

  const submit = (values: ScheduleTempForm) => {
    onSave(values)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Schedule Temp' : 'Add Schedule Temp'}</DialogTitle>
          <DialogDescription>Enter the schedule period, working time, status, and priority.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='schedule-temp-form' onSubmit={form.handleSubmit(submit)} className='max-h-[70vh] space-y-4 overflow-y-auto px-1 py-1'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField control={form.control} name='name' render={({ field }) => (
                <FormItem className='sm:col-span-2'><FormLabel>Name</FormLabel><FormControl><Input placeholder='Schedule name' {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name='description' render={({ field }) => (
                <FormItem className='sm:col-span-2'><FormLabel>Description</FormLabel><FormControl><Textarea placeholder='Schedule description' className='min-h-20 resize-y' {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              {(['fromDate', 'toDate'] as const).map((name) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>{name === 'fromDate' ? 'From Date' : 'To Date'}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild><FormControl><Button type='button' variant='outline' className={cn('justify-start text-start font-normal', !field.value && 'text-muted-foreground')}><CalendarIcon className='me-2 size-4' />{field.value ? format(field.value, 'dd MMM yyyy') : 'Select date'}</Button></FormControl></PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'><Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
              ))}
              {(['fromTime', 'toTime'] as const).map((name) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem><FormLabel>{name === 'fromTime' ? 'From Time' : 'To Time'}</FormLabel><FormControl><Input type='time' {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              ))}
              <div className='bg-muted/40 flex items-center gap-3 rounded-md border px-4 py-3 sm:col-span-2'>
                <Clock3 className='text-muted-foreground size-5' />
                <div><div className='text-muted-foreground text-xs'>Time Range</div><div className='font-medium'>{timeRange}</div></div>
              </div>
              <FormField control={form.control} name='status' render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{scheduleStatuses.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name='priority' render={({ field }) => (
                <FormItem><FormLabel>Priority</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{schedulePriorities.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type='submit' form='schedule-temp-form'>{isEdit ? 'Save Changes' : 'Add Schedule'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
