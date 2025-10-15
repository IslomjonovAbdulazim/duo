import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { CourseDetailView } from '@/features/duo-stats/components/course-detail-view'

export const Route = createFileRoute('/_authenticated/duo-stats/$courseId')({
  component: CourseDetail,
})

function CourseDetail() {
  const { courseId } = Route.useParams()

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
        <CourseDetailView courseId={parseInt(courseId)} />
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: '/duo-stats',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Course Details',
    href: '#',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Analytics',
    href: '/duo-stats/analytics',
    isActive: false,
    disabled: true,
  },
]