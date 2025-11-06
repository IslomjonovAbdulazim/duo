import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { statsApi } from '@/lib/stats-api'
import { CoursesStatsTable } from './components/courses-stats-table'
import { CourseDetailView } from './components/course-detail-view'
import { useTranslation } from '@/i18n'

export function DuoStats() {
  const { t } = useTranslation()

  // Get URL search parameters
  const getSearchParams = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return {
      courseId: urlParams.get('courseId') ? Number(urlParams.get('courseId')) : undefined,
    }
  }

  const [courseId, setCourseId] = useState<number | undefined>(getSearchParams().courseId)

  // Update courseId when URL changes
  useEffect(() => {
    const handlePopState = () => {
      setCourseId(getSearchParams().courseId)
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Function to handle course navigation
  const handleCourseClick = (selectedCourseId: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('courseId', selectedCourseId.toString())
    window.history.pushState({}, '', url.toString())
    setCourseId(selectedCourseId)
  }

  // Function to handle back navigation
  const handleBackToCourses = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('courseId')
    window.history.pushState({}, '', url.toString())
    setCourseId(undefined)
  }

  const {
    data: courses = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['stats', 'courses'],
    queryFn: () => statsApi.getCourses(),
  })

  // Dynamic top navigation based on current view
  const getTopNav = () => [
    {
      title: 'Overview',
      href: '/duo-stats',
      isActive: !courseId,
      disabled: false,
    },
    ...(courseId ? [{
      title: 'Course Details',
      href: '#',
      isActive: true,
      disabled: false,
    }] : []),
    {
      title: 'Analytics',
      href: '/duo-stats/analytics',
      isActive: false,
      disabled: true,
    },
    {
      title: 'Reports',
      href: '/duo-stats/reports',
      isActive: false,
      disabled: true,
    },
  ]

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={getTopNav()} />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        {courseId ? (
          <CourseDetailView courseId={courseId} onBack={handleBackToCourses} />
        ) : (
          <>
            <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <div className='space-y-1'>
                <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
                  {t.duoStats.title}
                </h1>
                <p className='text-muted-foreground text-lg'>
                  {t.duoStats.description}
                </p>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                  <BarChart3 className='h-4 w-4' />
                  <span>{courses.length} courses</span>
                </div>
              </div>
            </div>

            {/* Courses Stats Table */}
            <CoursesStatsTable
              data={courses}
              isLoading={isLoading}
              onRefresh={refetch}
              onCourseClick={handleCourseClick}
            />
          </>
        )}
      </Main>
    </>
  )
}