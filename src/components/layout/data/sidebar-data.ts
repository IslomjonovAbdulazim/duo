import {
  Command,
  Building2,
  BookOpen,
  GraduationCap,
  Type,
  Users,
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
          title: t.nav.learningCenters,
          url: '/learning-centers',
          icon: Building2,
        },
        {
          title: t.nav.contentManagement,
          icon: BookOpen,
          items: [
            {
              title: t.nav.courses,
              url: '/content/courses',
              icon: GraduationCap,
            },
            {
              title: t.nav.lessons,
              url: '/content/lessons',
              icon: BookOpen,
            },
            {
              title: t.nav.words,
              url: '/content/words',
              icon: Type,
            },
          ],
        },
        {
          title: t.nav.userManagement,
          url: '/user-management',
          icon: Users,
        },
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
