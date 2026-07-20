import { createFileRoute } from '@tanstack/react-router'
import { ScheduleViewPage } from '@/features/schedules/components/schedule-view-page'

export const Route = createFileRoute('/_authenticated/schedules/$scheduleId/')({
  component: ScheduleViewPage,
})
