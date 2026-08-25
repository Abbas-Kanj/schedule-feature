import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type PublicHoliday } from '../data/schema'
import { usePublicHoliday } from './public-holiday-provider'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: PublicHoliday
}

export function PublicHolidayDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  const [value, setValue] = useState('')
  const { deleteHoliday } = usePublicHoliday()
  const handleDelete = () => {
    if (value.trim() !== currentRow.name) return
    deleteHoliday(currentRow.id)
    onOpenChange(false)
    showSubmittedData(currentRow, 'The following public holiday has been deleted:')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='public-holiday-delete-form'
      disabled={value.trim() !== currentRow.name}
      title={
        <span className='text-destructive'>
          <AlertTriangle className='me-1 inline-block' size={18} /> Delete Public Holiday
        </span>
      }
      desc={
        <form
          id='public-holiday-delete-form'
          onSubmit={(event) => {
            event.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p>
            Are you sure you want to delete <strong>{currentRow.name}</strong>?
            This action cannot be undone.
          </p>
          <Label className='flex flex-col items-start gap-1.5'>
            Confirm by typing the holiday name:
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={currentRow.name}
              autoFocus
            />
          </Label>
          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>This operation cannot be rolled back.</AlertDescription>
          </Alert>
        </form>
      }
      confirmText='Delete'
      destructive
    />
  )
}
