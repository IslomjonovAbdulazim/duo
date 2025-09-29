import { createFileRoute } from '@tanstack/react-router'
import { ChaptersPage } from '@/features/content-management/chapters'
import { z } from 'zod'

const chaptersSearchSchema = z.object({
  courseId: z.number().optional(),
})

export const Route = createFileRoute('/_authenticated/content/chapters')({
  component: ChaptersPage,
  validateSearch: chaptersSearchSchema,
})