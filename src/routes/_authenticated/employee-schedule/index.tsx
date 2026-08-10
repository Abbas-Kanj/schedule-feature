import { createFileRoute } from '@tanstack/react-router'
import { EmployeeSchedulePage } from '@/features/employee-schedule'

export const Route = createFileRoute('/_authenticated/employee-schedule/')({
  component: EmployeeSchedulePage,
})

