import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatDuration } from '../data/duration'
import { priorityOptions, statusOptions } from '../data/schedule-temps'
import { type ScheduleTemp } from '../data/schema'

const formSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required.'),
    description: z.string().trim().min(1, 'Description is required.'),
    fromDate: z.date({ error: 'From date is required.' }),
    toDate: z.date({ error: 'To date is required.' }),
    timeFrom: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time From is required.'),
    timeTo: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time To is required.'),
    status: z.enum(['upcoming', 'tentative', 'published']),
    priority: z.enum(['high', 'medium', 'low']),
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
    values: currentRow
      ? {
          name: currentRow.name,
          description: currentRow.description,
          fromDate: currentRow.fromDate,
          toDate: currentRow.toDate,
          timeFrom: currentRow.timeFrom,
          timeTo: currentRow.timeTo,
          status: currentRow.status,
          priority: currentRow.priority,
        }
      : {
          name: '', description: '', fromDate: undefined!, toDate: undefined!,
          timeFrom: '08:00', timeTo: '16:00', status: 'upcoming', priority: 'medium',
        },
  })
  const timeFrom = useWatch({ control: form.control, name: 'timeFrom' })
  const timeTo = useWatch({ control: form.control, name: 'timeTo' })
  const duration = timeFrom && timeTo ? formatDuration(timeFrom, timeTo) : '—'

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
          <DialogDescription>Enter the temporary schedule period and working time.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='schedule-temp-form' onSubmit={form.handleSubmit(submit)} className='max-h-[70vh] space-y-4 overflow-y-auto px-1 py-1'>
            <FormField control={form.control} name='name' render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder='Schedule name' {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name='description' render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className='min-h-20 resize-y' placeholder='Temporary schedule description' {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className='grid gap-4 sm:grid-cols-2'>
              {(['fromDate', 'toDate'] as const).map((name) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>{name === 'fromDate' ? 'Date From' : 'Date To'}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild><FormControl>
                        <Button type='button' variant='outline' className={cn('justify-start text-start font-normal', !field.value && 'text-muted-foreground')}>
                          <CalendarIcon className='me-2 size-4' />{field.value ? format(field.value, 'dd MMM yyyy') : 'Select date'}
                        </Button>
                      </FormControl></PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'><Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
              ))}
            </div>
            <div className='grid gap-4 sm:grid-cols-3'>
              <FormField control={form.control} name='timeFrom' render={({ field }) => (
                <FormItem><FormLabel>Time From</FormLabel><FormControl><Input type='time' {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name='timeTo' render={({ field }) => (
                <FormItem><FormLabel>Time To</FormLabel><FormControl><Input type='time' {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <div className='bg-muted/50 flex h-9 items-center rounded-md border px-3 text-sm font-medium'>{duration}</div>
              </FormItem>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField control={form.control} name='status' render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{statusOptions.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name='priority' render={({ field }) => (
                <FormItem><FormLabel>Priority</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{priorityOptions.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type='submit' form='schedule-temp-form'>{isEdit ? 'Save changes' : 'Add Schedule'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
