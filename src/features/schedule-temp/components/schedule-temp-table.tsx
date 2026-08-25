import { useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Plus } from 'lucide-react'
import {
  type ColumnDef, type ColumnFiltersState, type PaginationState, type SortingState,
  flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTableColumnHeader, DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { formatDuration } from '../data/duration'
import { type ScheduleTemp } from '../data/schema'
import { ScheduleTempActionDialog, type ScheduleTempForm } from './schedule-temp-action-dialog'

type Props = { data: ScheduleTemp[]; onChange: (data: ScheduleTemp[]) => void }

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
    { accessorKey: 'status', header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />, cell: ({ row }) => <Badge variant='outline' className='capitalize'>{row.original.status}</Badge> },
    { accessorKey: 'priority', header: ({ column }) => <DataTableColumnHeader column={column} title='Priority' />, cell: ({ row }) => <Badge variant='secondary' className='capitalize'>{row.original.priority}</Badge> },
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
        <div className='min-w-64 flex-1'><DataTableToolbar table={table} searchPlaceholder='Filter temporary schedules...' searchKey='name' /></div>
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
