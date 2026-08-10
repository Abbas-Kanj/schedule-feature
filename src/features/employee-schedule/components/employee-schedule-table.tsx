import { useState } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTableColumnHeader, DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { employees, scheduleShifts } from '../data/employee-schedules'
import { type EmployeeSchedule } from '../data/schema'

const employeeName = (id: string) => employees.find((item) => item.value === id)?.label ?? id
const shiftName = (id: string) => scheduleShifts.find((item) => item.value === id)?.label ?? id

type Props = { data: EmployeeSchedule[]; onAdd: () => void }

export function EmployeeScheduleTable({ data, onAdd }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const columns: ColumnDef<EmployeeSchedule>[] = [
    {
      id: 'employee',
      accessorFn: (row) => employeeName(row.employeeId),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Employee' />,
      cell: ({ row }) => <span className='font-medium'>{employeeName(row.original.employeeId)}</span>,
    },
    {
      id: 'scheduleShift',
      accessorFn: (row) => shiftName(row.scheduleShiftId),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Schedule Shift' />,
      cell: ({ row }) => shiftName(row.original.scheduleShiftId),
    },
    {
      accessorKey: 'startDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Start Date' />,
      cell: ({ row }) => format(row.original.startDate, 'dd MMM yyyy'),
    },
  ]

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

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='min-w-64 flex-1'><DataTableToolbar table={table} searchPlaceholder='Filter employees...' searchKey='employee' /></div>
        <Button onClick={onAdd}><Plus /> Add Employee Schedule</Button>
      </div>
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>{table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>{group.headers.map((header) => (
              <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
            ))}</TableRow>
          ))}</TableHeader>
          <TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
          )) : <TableRow><TableCell colSpan={columns.length} className='h-24 text-center'>No results.</TableCell></TableRow>}</TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}

