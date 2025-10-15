import { createFileRoute } from '@tanstack/react-router'
import { DuoStats } from '@/features/duo-stats'

export const Route = createFileRoute('/_authenticated/duo-stats')({
  component: () => <DuoStats />,
})