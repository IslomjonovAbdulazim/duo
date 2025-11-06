import {
  Command,
  Zap,
  BarChart3,
} from 'lucide-react'
import { type SidebarData } from '../types'
import { type Translations } from '@/i18n/translations'

export const getSidebarData = (t: Translations): SidebarData => ({
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: t.nav.teamName,
      logo: Command,
      plan: t.nav.planName,
    },
  ],
  navGroups: [
    {
      title: t.nav.general,
      items: [
        {
          title: t.nav.zehnlyDuo,
          url: '/zehnly-duo',
          icon: Zap,
        },
        {
          title: t.nav.duoStats,
          url: '/duo-stats',
          icon: BarChart3,
        },
      ],
    },
  ],
})

// Keep the old export for backward compatibility, but it will use English by default
export const sidebarData: SidebarData = getSidebarData({
  nav: {
    teamName: 'Edu Tizim Admin',
    planName: 'Super Admin',
    general: 'General',
    learningCenters: 'Learning Centers',
    contentManagement: 'Content Management',
    courses: 'Courses',
    chapters: 'Chapters',
    lessons: 'Lessons',
    words: 'Words',
    userManagement: 'User Management',
    zehnlyDuo: 'Zehnly Duo',
    duoStats: 'Duo Stats',
  },
} as any)
