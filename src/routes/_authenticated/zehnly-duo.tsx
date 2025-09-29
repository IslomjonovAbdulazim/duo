import { createFileRoute } from '@tanstack/react-router'
import { ZehnlyDuoPage } from '@/features/zehnly-duo'

type ZehnlyDuoSearch = {
  courseId?: number
  chapterId?: number
  lessonId?: number
  tab?: 'courses' | 'chapters' | 'lessons' | 'words' | 'story'
}

export const Route = createFileRoute('/_authenticated/zehnly-duo')({
  component: ZehnlyDuoPage,
  validateSearch: (search: Record<string, unknown>): ZehnlyDuoSearch => {
    return {
      courseId: typeof search.courseId === 'number' ? search.courseId : undefined,
      chapterId: typeof search.chapterId === 'number' ? search.chapterId : undefined,
      lessonId: typeof search.lessonId === 'number' ? search.lessonId : undefined,
      tab: typeof search.tab === 'string' && ['courses', 'chapters', 'lessons', 'words', 'story'].includes(search.tab) ? search.tab as ZehnlyDuoSearch['tab'] : undefined,
    }
  },
})