import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScheduleForm } from './schedule-form/schedule-form'
import { type Schedule } from '../data/schema'
import { useSchedulesStore } from '../stores/schedules-store'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Schedule
}

const FORM_ID = 'schedule-edit-form'

const SchedulesEditDialog = ({ open, onOpenChange, currentRow }: Props) => {
  const updateSchedule = useSchedulesStore((s) => s.updateSchedule)

  const handleSubmit = (values: Schedule) => {
    updateSchedule(values.id, values)
    toast.success(`Schedule "${values.name}" has been updated.`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Edit schedule</DialogTitle>
          <DialogDescription>
            Update the schedule details, then save your changes.
          </DialogDescription>
        </DialogHeader>
        <ScheduleForm
          defaultValues={currentRow}
          onSubmit={handleSubmit}
          formId={FORM_ID}
        />
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button form={FORM_ID} type='submit'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SchedulesEditDialog
