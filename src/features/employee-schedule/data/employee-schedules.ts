import { type EmployeeSchedule } from './schema'

export const employees = [
  { value: 'emp-001', label: 'Ahmad Wehbi' },
  { value: 'emp-002', label: 'Paula Haddad' },
  { value: 'emp-003', label: 'Ali Ayoub' },
  { value: 'emp-004', label: 'Nesrine Ibrahim' },
] as const

export const scheduleShifts = [
  { value: 'shift-morning', label: 'Morning Shift (08:00 - 14:00)' },
  { value: 'shift-evening', label: 'Evening Shift (14:00 - 20:00)' },
  { value: 'shift-night', label: 'Night Shift (20:00 - 08:00)' },
  { value: 'shift-office', label: 'Office Hours (08:00 - 16:00)' },
] as const

export const initialEmployeeSchedules: EmployeeSchedule[] = [
  {
    id: 'employee-schedule-1',
    employeeId: 'emp-001',
    scheduleShiftId: 'shift-morning',
    startDate: new Date(2026, 7, 1),
  },
  {
    id: 'employee-schedule-2',
    employeeId: 'emp-002',
    scheduleShiftId: 'shift-office',
    startDate: new Date(2026, 7, 5),
  },
]

