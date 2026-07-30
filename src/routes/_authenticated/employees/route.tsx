import EmployeesPage from '@/features/employees'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/employees')({
  component: EmployeesPage,
})