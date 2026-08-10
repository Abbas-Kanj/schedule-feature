import { useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { EmployeeScheduleAddDialog, type EmployeeScheduleForm } from './components/employee-schedule-add-dialog'
import { EmployeeScheduleTable } from './components/employee-schedule-table'
import { initialEmployeeSchedules } from './data/employee-schedules'

export function EmployeeSchedulePage() {
  const [schedules, setSchedules] = useState(initialEmployeeSchedules)
  const [addOpen, setAddOpen] = useState(false)

  const addSchedule = (values: EmployeeScheduleForm) => {
    setSchedules((current) => [...current, { id: crypto.randomUUID(), ...values }])
  }

  return (
    <>
      <Header fixed><Search className='me-auto' /><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Employee Schedule</h2>
          <p className='text-muted-foreground'>Assign schedule shifts and effective start dates to employees.</p>
        </div>
        <EmployeeScheduleTable data={schedules} onAdd={() => setAddOpen(true)} />
      </Main>
      <EmployeeScheduleAddDialog open={addOpen} onOpenChange={setAddOpen} onSave={addSchedule} />
    </>
  )
}

