import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { type ScheduleTempChild } from '../data/schema'

const formSchema = z
  .object({
    fromDate: z.date({ error: 'From date is required.' }),
    toDate: z.date({ error: 'To date is required.' }),
    description: z.string().trim().min(1, 'Description is required.'),
  })
  .refine((values) => values.toDate >= values.fromDate, {
    message: 'To date must be on or after From date.',
    path: ['toDate'],
  })

type ChildForm = z.infer<typeof formSchema>

type Props = {
  open: boolean
  currentChild: ScheduleTempChild | null
  onOpenChange: (open: boolean) => void
  onSave: (values: ChildForm) => void
}

export function ScheduleTempChildDialog({
  open,
  currentChild,
  onOpenChange,
  onSave,
}: Props) {
  const isEdit = !!currentChild
  const form = useForm<ChildForm>({
    resolver: zodResolver(formSchema),
    values: currentChild
      ? {
          fromDate: currentChild.fromDate,
          toDate: currentChild.toDate,
          description: currentChild.description,
        }
      : { fromDate: undefined!, toDate: undefined!, description: '' },
  })

  const submit = (values: ChildForm) => {
    onSave(values)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit child period' : 'Add child period'}</DialogTitle>
          <DialogDescription>
            Select the date range and enter a description.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='schedule-temp-child-form' onSubmit={form.handleSubmit(submit)} className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              {(['fromDate', 'toDate'] as const).map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>{name === 'fromDate' ? 'From date' : 'To date'}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type='button'
                              variant='outline'
                              className={cn('justify-start text-start font-normal', !field.value && 'text-muted-foreground')}
                            >
                              <CalendarIcon className='me-2 size-4' />
                              {field.value ? format(field.value, 'dd MMM yyyy') : 'Select date'}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Describe this schedule period' className='min-h-24 resize-y' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type='submit' form='schedule-temp-child-form'>
            {isEdit ? 'Save changes' : 'Add child'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
