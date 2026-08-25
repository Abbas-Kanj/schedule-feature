import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Plus } from 'lucide-react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTableColumnHeader, DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { schedulePriorities, scheduleStatuses, type ScheduleTemp } from '../data/schema'
import { formatTimeRange } from '../data/time-range'
import { ScheduleTempActionDialog, type ScheduleTempForm } from './schedule-temp-action-dialog'

const statusClasses: Record<ScheduleTemp['status'], string> = {
  Upcoming: 'border-blue-200 bg-blue-100/50 text-blue-900 dark:text-blue-200',
  Tentative: 'border-amber-200 bg-amber-100/50 text-amber-900 dark:text-amber-200',
  Published: 'border-teal-200 bg-teal-100/50 text-teal-900 dark:text-teal-200',
}

const priorityClasses: Record<ScheduleTemp['priority'], string> = {
  High: 'border-red-200 bg-red-100/50 text-red-900 dark:text-red-200',
  Medium: 'border-amber-200 bg-amber-100/50 text-amber-900 dark:text-amber-200',
  Low: 'border-slate-200 bg-slate-100/50 text-slate-900 dark:text-slate-200',
}

type Props = {
  data: ScheduleTemp[]
  onChange: (data: ScheduleTemp[]) => void
}

export function ScheduleTempTable({ data, onChange }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<ScheduleTemp | null>(null)

  const openAdd = () => {
    setCurrentRow(null)
    setDialogOpen(true)
  }

  const saveSchedule = (values: ScheduleTempForm) => {
    if (currentRow) {
      onChange(data.map((item) => item.id === currentRow.id ? { ...item, ...values } : item))
    } else {
      onChange([...data, { id: crypto.randomUUID(), ...values }])
    }
  }

  const columns = useMemo<ColumnDef<ScheduleTemp>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
      cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
      cell: ({ row }) => <span className='text-muted-foreground block min-w-52 max-w-72 whitespace-normal'>{row.original.description}</span>,
    },
    {
      accessorKey: 'fromDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title='From' />,
      cell: ({ row }) => (
        <div className='min-w-28'>
          <div>{format(row.original.fromDate, 'dd MMM yyyy')}</div>
          <div className='text-muted-foreground text-xs'>{row.original.fromTime}</div>
        </div>
      ),
    },
    {
      accessorKey: 'toDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title='To' />,
      cell: ({ row }) => (
        <div className='min-w-28'>
          <div>{format(row.original.toDate, 'dd MMM yyyy')}</div>
          <div className='text-muted-foreground text-xs'>{row.original.toTime}</div>
        </div>
      ),
    },
    {
      id: 'timeRange',
      accessorFn: (row) => formatTimeRange(row.fromTime, row.toTime),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Time Range' />,
      cell: ({ row }) => <span className='font-medium'>{formatTimeRange(row.original.fromTime, row.original.toTime)}</span>,
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ row }) => <Badge variant='outline' className={statusClasses[row.original.status]}>{row.original.status}</Badge>,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Priority' />,
      cell: ({ row }) => <Badge variant='outline' className={priorityClasses[row.original.priority]}>{row.original.priority}</Badge>,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <Button variant='ghost' size='icon' aria-label='Edit schedule template' onClick={() => { setCurrentRow(row.original); setDialogOpen(true) }}><Pencil /></Button>,
      enableSorting: false,
      enableHiding: false,
    },
  ], [])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  useEffect(() => {
    const lastPage = Math.max(0, table.getPageCount() - 1)
    if (pagination.pageIndex > lastPage) setPagination((value) => ({ ...value, pageIndex: lastPage }))
  }, [data.length, pagination.pageIndex, table])

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='min-w-64 flex-1'>
          <DataTableToolbar
            table={table}
            searchPlaceholder='Filter schedule templates...'
            searchKey='name'
            filters={[
              { columnId: 'status', title: 'Status', options: scheduleStatuses.map((value) => ({ label: value, value })) },
              { columnId: 'priority', title: 'Priority', options: schedulePriorities.map((value) => ({ label: value, value })) },
            ]}
          />
        </div>
        <Button onClick={openAdd}><Plus /> Add Schedule Temp</Button>
      </div>
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className='group/row'>
                {group.headers.map((header) => <TableHead key={header.id} className='bg-background group-hover/row:bg-muted'>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className='group/row'>
                {row.getVisibleCells().map((cell) => <TableCell key={cell.id} className={cn('bg-background group-hover/row:bg-muted', cell.column.columnDef.meta?.className)}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
              </TableRow>
            )) : <TableRow><TableCell colSpan={columns.length} className='h-24 text-center'>No results.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <ScheduleTempActionDialog
        key={currentRow?.id ?? 'new'}
        open={dialogOpen}
        currentRow={currentRow}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setCurrentRow(null)
        }}
        onSave={saveSchedule}
      />
    </div>
  )
}
