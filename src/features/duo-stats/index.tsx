import { useQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { statsApi } from '@/lib/stats-api'
import { CoursesStatsTable } from './components/courses-stats-table'
import { useTranslation } from '@/i18n'

export function DuoStats() {
  const { t } = useTranslation()

  const {
    data: courses = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['stats', 'courses'],
    queryFn: () => statsApi.getCourses(),
  })

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
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
        />
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: '/duo-stats',
    isActive: true,
    disabled: false,
  },
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