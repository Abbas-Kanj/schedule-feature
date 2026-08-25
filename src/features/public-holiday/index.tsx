import { useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PublicHolidayDialogs } from './components/public-holiday-dialogs'
import { PublicHolidayPrimaryButtons } from './components/public-holiday-primary-buttons'
import {
  PublicHolidayProvider,
  usePublicHoliday,
} from './components/public-holiday-provider'
import { PublicHolidayTable } from './components/public-holiday-table'

const route = getRouteApi('/_authenticated/public-holiday/')

export function PublicHoliday() {
  return (
    <PublicHolidayProvider>
      <PublicHolidayContent />
    </PublicHolidayProvider>
  )
}

function PublicHolidayContent() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const {
    holidays,
    years,
    selectedYear,
    setSelectedYear,
    openYear,
  } = usePublicHoliday()
  const selectedYearInfo = years.find((item) => item.year === selectedYear)
  const selectedHolidays = useMemo(
    () => holidays.filter((holiday) => holiday.year === selectedYear),
    [holidays, selectedYear]
  )

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Public Holiday</h2>
            <p className='text-muted-foreground'>
              Manage public holiday dates and fixed settings by year.
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Select
              value={String(selectedYear)}
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger className='w-32' aria-label='Select year'>
                <SelectValue placeholder='Year' />
              </SelectTrigger>
              <SelectContent>
                {years.map((item) => (
                  <SelectItem key={item.year} value={String(item.year)}>
                    {item.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedYearInfo?.isOpen && (
              <Button variant='outline' onClick={openYear}>
                Open year
              </Button>
            )}
            {selectedYearInfo?.isOpen && <PublicHolidayPrimaryButtons />}
          </div>
        </div>
        <PublicHolidayTable
          key={selectedYear}
          data={selectedHolidays}
          search={search}
          navigate={navigate}
        />
      </Main>
      <PublicHolidayDialogs />
    </>
  )
}
