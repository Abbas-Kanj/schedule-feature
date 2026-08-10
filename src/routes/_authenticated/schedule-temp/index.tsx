import { createFileRoute } from '@tanstack/react-router'
import { ScheduleTempPage } from '@/features/schedule-temp'

export const Route = createFileRoute('/_authenticated/schedule-temp/')({
  component: ScheduleTempPage,
})
