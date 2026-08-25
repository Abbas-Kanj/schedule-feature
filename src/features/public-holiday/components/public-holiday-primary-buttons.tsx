import { CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePublicHoliday } from './public-holiday-provider'

export function PublicHolidayPrimaryButtons() {
  const { setOpen } = usePublicHoliday()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>Add Public Holiday</span>
      <CalendarPlus size={18} />
    </Button>
  )
}
