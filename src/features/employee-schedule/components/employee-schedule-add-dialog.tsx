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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { employees, scheduleShifts } from '../data/employee-schedules'

const formSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required.'),
  scheduleShiftId: z.string().min(1, 'Schedule shift is required.'),
  startDate: z.date({ error: 'Start date is required.' }),
})

export type EmployeeScheduleForm = z.infer<typeof formSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (values: EmployeeScheduleForm) => void
}

export function EmployeeScheduleAddDialog({ open, onOpenChange, onSave }: Props) {
  const form = useForm<EmployeeScheduleForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { employeeId: '', scheduleShiftId: '', startDate: undefined },
  })

  const submit = (values: EmployeeScheduleForm) => {
    onSave(values)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Add Employee Schedule</DialogTitle>
          <DialogDescription>Assign a predefined schedule shift to an employee.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='employee-schedule-form' className='space-y-4' onSubmit={form.handleSubmit(submit)}>
            <FormField control={form.control} name='employeeId' render={({ field }) => (
              <FormItem>
                <FormLabel>Employee</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder='Select employee' /></SelectTrigger></FormControl>
                  <SelectContent>{employees.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name='scheduleShiftId' render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule Shift</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder='Select schedule shift' /></SelectTrigger></FormControl>
                  <SelectContent>{scheduleShifts.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name='startDate' render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button type='button' variant='outline' className={cn('justify-start text-start font-normal', !field.value && 'text-muted-foreground')}>
                        <CalendarIcon className='me-2 size-4' />
                        {field.value ? format(field.value, 'dd MMM yyyy') : 'Select start date'}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
          </form>
        </Form>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type='submit' form='employee-schedule-form'>Add Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

