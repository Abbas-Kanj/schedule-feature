import { PublicHolidayActionDialog } from './public-holiday-action-dialog'
import { PublicHolidayDeleteDialog } from './public-holiday-delete-dialog'
import { usePublicHoliday } from './public-holiday-provider'

export function PublicHolidayDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePublicHoliday()
  return (
    <>
      <PublicHolidayActionDialog
        key='public-holiday-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />
      {currentRow && (
        <>
          <PublicHolidayActionDialog
            key={`public-holiday-edit-${currentRow.id}`}
            open={open === 'edit'}
            currentRow={currentRow}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
          />
          <PublicHolidayDeleteDialog
            key={`public-holiday-delete-${currentRow.id}`}
            open={open === 'delete'}
            currentRow={currentRow}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => setCurrentRow(null), 500)
            }}
          />
        </>
      )}
    </>
  )
}
