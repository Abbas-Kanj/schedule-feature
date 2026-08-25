import { useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ScheduleTempTable } from './components/schedule-temp-table'
import { initialScheduleTemps } from './data/schedule-temps'

export function ScheduleTempPage() {
  const [scheduleTemps, setScheduleTemps] = useState(initialScheduleTemps)

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Schedule Temp</h2>
          <p className='text-muted-foreground'>
            Manage schedule template periods, working times, status, and priority.
          </p>
        </div>
        <ScheduleTempTable data={scheduleTemps} onChange={setScheduleTemps} />
      </Main>
    </>
  )
}
