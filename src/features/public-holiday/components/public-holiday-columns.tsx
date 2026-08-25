import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type PublicHoliday } from '../data/schema'
import { DataTableRowActions } from './public-holiday-row-actions'

export const publicHolidaysColumns: ColumnDef<PublicHoliday>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
    cell: ({ row }) => <LongText className='max-w-56'>{row.getValue('name')}</LongText>,
    enableHiding: false,
  },
  {
    id: 'numberOfDays',
    accessorFn: (row) => row.holidayDates.length,
    header: ({ column }) => <DataTableColumnHeader column={column} title='Number of Days' />,
    cell: ({ row }) => <div className='text-center'>{row.original.holidayDates.length}</div>,
  },
  {
    id: 'dayNames',
    accessorFn: (row) => row.holidayDates.map((date) => format(date, 'EEEE')).join(', '),
    header: ({ column }) => <DataTableColumnHeader column={column} title='Days' />,
    cell: ({ row }) => (
      <div className='flex flex-wrap gap-1'>
        {row.original.holidayDates.map((date) => (
          <Badge key={date.toISOString()} variant='outline'>
            {format(date, 'EEEE')}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'holidayDates',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Dates' />,
    cell: ({ row }) => (
      <div className='flex max-w-96 flex-wrap gap-1'>
        {row.original.holidayDates.map((date) => (
          <Badge key={date.toISOString()} variant='secondary'>
            {format(date, 'dd MMM yyyy')}
          </Badge>
        ))}
      </div>
    ),
    sortingFn: (rowA, rowB) =>
      rowA.original.holidayDates[0].getTime() -
      rowB.original.holidayDates[0].getTime(),
  },
  {
    id: 'fixed',
    accessorFn: (row) => (row.fixed ? 'yes' : 'no'),
    header: ({ column }) => <DataTableColumnHeader column={column} title='Fixed' />,
    cell: ({ row }) => {
      const fixed = row.original.fixed
      return (
        <Badge
          variant='outline'
          className={cn(
            fixed
              ? 'border-teal-200 bg-teal-100/30 text-teal-900 dark:text-teal-200'
              : 'border-slate-200 bg-slate-100/40 text-slate-900 dark:text-slate-200'
          )}
        >
          {fixed ? 'Yes' : 'No'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
    enableHiding: false,
  },
  { id: 'actions', cell: DataTableRowActions, enableHiding: false },
]
