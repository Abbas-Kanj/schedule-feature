import { Fragment, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ChevronDown, ChevronRight, Pencil, Plus, Save, X } from 'lucide-react'
import {
  type ColumnFiltersState,
  type ColumnDef,
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableColumnHeader, DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type ScheduleTemp, type ScheduleTempChild } from '../data/schema'
import { ScheduleTempChildDialog } from './schedule-temp-child-dialog'

type HeaderDraft = Pick<ScheduleTemp, 'name' | 'description' | 'priority'>
const emptyDraft: HeaderDraft = { name: '', description: '', priority: 1 }

type Props = {
  data: ScheduleTemp[]
  onChange: (data: ScheduleTemp[]) => void
}

export function ScheduleTempTable({ data, onChange }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<HeaderDraft>(emptyDraft)
  const [dialogParentId, setDialogParentId] = useState<string | null>(null)
  const [currentChild, setCurrentChild] = useState<ScheduleTempChild | null>(null)

  const beginAdd = () => {
    setEditingId(null)
    setDraft(emptyDraft)
    setAdding(true)
  }

  const beginEdit = (row: ScheduleTemp) => {
    setAdding(false)
    setEditingId(row.id)
    setDraft({ name: row.name, description: row.description, priority: row.priority })
  }

  const cancelInline = () => {
    setAdding(false)
    setEditingId(null)
    setDraft(emptyDraft)
  }

  const saveInline = () => {
    if (!draft.name.trim() || !draft.description.trim() || draft.priority < 1) return
    if (adding) {
      onChange([...data, { id: crypto.randomUUID(), ...draft, name: draft.name.trim(), description: draft.description.trim(), children: [] }])
    } else if (editingId) {
      onChange(data.map((item) => item.id === editingId ? { ...item, ...draft, name: draft.name.trim(), description: draft.description.trim() } : item))
    }
    cancelInline()
  }

  const openChildDialog = (parentId: string, child: ScheduleTempChild | null = null) => {
    setDialogParentId(parentId)
    setCurrentChild(child)
  }

  const saveChild = (values: Omit<ScheduleTempChild, 'id'>) => {
    if (!dialogParentId) return
    onChange(data.map((parent) => {
      if (parent.id !== dialogParentId) return parent
      const children = currentChild
        ? parent.children.map((child) => child.id === currentChild.id ? { ...currentChild, ...values } : child)
        : [...parent.children, { id: crypto.randomUUID(), ...values }]
      return { ...parent, children }
    }))
    setExpanded((value) => new Set(value).add(dialogParentId))
  }

  const columns: ColumnDef<ScheduleTemp>[] = [
    {
      id: 'expand',
      header: '',
      cell: ({ row }) => (
        <Button variant='ghost' size='icon' aria-label={expanded.has(row.original.id) ? 'Collapse children' : 'Expand children'} onClick={() => setExpanded((value) => {
          const next = new Set(value)
          if (next.has(row.original.id)) next.delete(row.original.id)
          else next.add(row.original.id)
          return next
        })}>
          {expanded.has(row.original.id) ? <ChevronDown /> : <ChevronRight />}
        </Button>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
      cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
      cell: ({ row }) => <span className='text-muted-foreground'>{row.original.description}</span>,
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Priority' />,
      cell: ({ row }) => row.original.priority,
    },
    {
      id: 'children',
      header: 'Children',
      cell: ({ row }) => row.original.children.length,
      enableSorting: false,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className='flex justify-end gap-1'>
          <Button variant='outline' size='sm' onClick={() => openChildDialog(row.original.id)}><Plus /> Add child</Button>
          <Button variant='ghost' size='icon' aria-label='Edit schedule template' onClick={() => beginEdit(row.original)}><Pencil /></Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
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

  useEffect(() => {
    const lastPage = Math.max(0, table.getPageCount() - 1)
    if (pagination.pageIndex > lastPage) setPagination((value) => ({ ...value, pageIndex: lastPage }))
  }, [data.length, pagination.pageIndex, table])

  const InlineCells = () => (
    <>
      <TableCell />
      <TableCell><Input autoFocus value={draft.name} placeholder='Schedule name' onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></TableCell>
      <TableCell><Input value={draft.description} placeholder='Description' onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></TableCell>
      <TableCell><Input type='number' min={1} value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: Number(event.target.value) })} /></TableCell>
      <TableCell>—</TableCell>
      <TableCell><div className='flex justify-end gap-1'><Button size='icon' aria-label='Save' onClick={saveInline}><Save /></Button><Button size='icon' variant='ghost' aria-label='Cancel' onClick={cancelInline}><X /></Button></div></TableCell>
    </>
  )

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='min-w-64 flex-1'>
          <DataTableToolbar table={table} searchPlaceholder='Filter schedule templates...' searchKey='name' />
        </div>
        <Button onClick={beginAdd} disabled={adding}><Plus /> Add Schedule Temp</Button>
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
            {adding && <TableRow className='bg-muted/40'><InlineCells /></TableRow>}
            {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow className='group/row'>
                  {editingId === row.original.id ? <InlineCells /> : row.getVisibleCells().map((cell) => <TableCell key={cell.id} className={cn('bg-background group-hover/row:bg-muted', cell.column.columnDef.meta?.className)}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                </TableRow>
                {expanded.has(row.original.id) && (
                  <TableRow className='bg-muted/30 hover:bg-muted/30'>
                    <TableCell colSpan={columns.length} className='p-0'>
                      <div className='ms-12 border-s px-5 py-3'>
                        {row.original.children.length ? (
                          <div className='space-y-2'>
                            {row.original.children.map((child) => (
                              <div key={child.id} className='grid items-center gap-3 rounded-md border bg-background p-3 sm:grid-cols-[150px_150px_1fr_auto]'>
                                <div><span className='text-muted-foreground text-xs'>From</span><div className='text-sm'>{format(child.fromDate, 'dd MMM yyyy')}</div></div>
                                <div><span className='text-muted-foreground text-xs'>To</span><div className='text-sm'>{format(child.toDate, 'dd MMM yyyy')}</div></div>
                                <div><span className='text-muted-foreground text-xs'>Description</span><div className='text-sm'>{child.description}</div></div>
                                <Button variant='ghost' size='icon' aria-label='Edit child' onClick={() => openChildDialog(row.original.id, child)}><Pencil /></Button>
                              </div>
                            ))}
                          </div>
                        ) : <p className='text-muted-foreground py-2 text-sm'>No child periods yet.</p>}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )) : !adding && <TableRow><TableCell colSpan={columns.length} className='h-24 text-center'>No results.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <ScheduleTempChildDialog
        key={`${dialogParentId}-${currentChild?.id ?? 'new'}`}
        open={!!dialogParentId}
        currentChild={currentChild}
        onOpenChange={(open) => { if (!open) { setDialogParentId(null); setCurrentChild(null) } }}
        onSave={saveChild}
      />
    </div>
  )
}
