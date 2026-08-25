import { useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Plus } from 'lucide-react'
import {
  type ColumnDef, type ColumnFiltersState, type PaginationState, type SortingState,
  flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTableColumnHeader, DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { formatDuration } from '../data/duration'
import { priorityOptions, statusOptions } from '../data/schedule-temps'
import { type ScheduleTemp } from '../data/schema'
import { ScheduleTempActionDialog, type ScheduleTempForm } from './schedule-temp-action-dialog'

type Props = { data: ScheduleTemp[]; onChange: (data: ScheduleTemp[]) => void }

const statusColors: Record<ScheduleTemp['status'], string> = {
  upcoming: 'border-blue-200 bg-blue-100/60 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  tentative: 'border-amber-200 bg-amber-100/60 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  published: 'border-emerald-200 bg-emerald-100/60 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
}

const priorityColors: Record<ScheduleTemp['priority'], string> = {
  high: 'border-red-200 bg-red-100/60 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300',
  medium: 'border-orange-200 bg-orange-100/60 text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300',
  low: 'border-slate-200 bg-slate-100/60 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300',
}

export function ScheduleTempTable({ data, onChange }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<ScheduleTemp | null>(null)

  const openAdd = () => { setCurrentRow(null); setDialogOpen(true) }
  const openEdit = (row: ScheduleTemp) => { setCurrentRow(row); setDialogOpen(true) }
  const save = (values: ScheduleTempForm) => {
    onChange(currentRow
      ? data.map((item) => item.id === currentRow.id ? { ...currentRow, ...values } : item)
      : [...data, { id: crypto.randomUUID(), ...values }])
  }

  const columns: ColumnDef<ScheduleTemp>[] = [
    { accessorKey: 'name', header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />, cell: ({ row }) => <span className='font-medium'>{row.original.name}</span> },
    { accessorKey: 'description', header: ({ column }) => <DataTableColumnHeader column={column} title='Description' /> },
    { accessorKey: 'fromDate', header: ({ column }) => <DataTableColumnHeader column={column} title='From' />, cell: ({ row }) => <div><div>{format(row.original.fromDate, 'dd MMM yyyy')}</div><div className='text-muted-foreground text-xs'>{row.original.timeFrom}</div></div> },
    { accessorKey: 'toDate', header: ({ column }) => <DataTableColumnHeader column={column} title='To' />, cell: ({ row }) => <div><div>{format(row.original.toDate, 'dd MMM yyyy')}</div><div className='text-muted-foreground text-xs'>{row.original.timeTo}</div></div> },
    { id: 'duration', header: 'Duration', cell: ({ row }) => formatDuration(row.original.timeFrom, row.original.timeTo), enableSorting: false },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
      cell: ({ row }) => <Badge variant='outline' className={cn('capitalize', statusColors[row.original.status])}>{row.original.status}</Badge>,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Priority' />,
      cell: ({ row }) => <Badge variant='outline' className={cn('capitalize', priorityColors[row.original.priority])}>{row.original.priority}</Badge>,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    { id: 'actions', header: '', cell: ({ row }) => <Button variant='ghost' size='icon' aria-label='Edit schedule' onClick={() => openEdit(row.original)}><Pencil /></Button>, enableSorting: false, enableHiding: false },
  ]

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data, columns, state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting, onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination, getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='min-w-64 flex-1'>
          <DataTableToolbar
            table={table}
            searchPlaceholder='Filter temporary schedules...'
            searchKey='name'
            filters={[
              { columnId: 'status', title: 'Status', options: statusOptions.map((option) => ({ ...option })) },
              { columnId: 'priority', title: 'Priority', options: priorityOptions.map((option) => ({ ...option })) },
            ]}
          />
        </div>
        <Button onClick={openAdd}><Plus /> Add Schedule Temp</Button>
      </div>
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>{table.getHeaderGroups().map((group) => <TableRow key={group.id}>{group.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}</TableRow>)}</TableHeader>
          <TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length} className='h-24 text-center'>No results.</TableCell></TableRow>}</TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <ScheduleTempActionDialog key={currentRow?.id ?? 'new'} open={dialogOpen} currentRow={currentRow} onOpenChange={setDialogOpen} onSave={save} />
    </div>
  )
}
