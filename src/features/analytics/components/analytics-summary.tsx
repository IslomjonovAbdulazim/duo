import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, BookOpen, Calendar, Target, Activity } from 'lucide-react'

interface AnalyticsSummaryProps {
  summary: {
    total_lessons_completed: number
    average_daily_lessons: number
    peak_daily_activity: number
    peak_date: string
    active_learning_days: number
    total_users: number
    daily_active_users_avg: number
  }
}

export function AnalyticsSummary({ summary }: AnalyticsSummaryProps) {
  const formatNumber = (num: number) => num.toLocaleString()
  const formatDecimal = (num: number) => num.toFixed(1)

  const stats = [
    {
      title: 'Total Lessons',
      value: formatNumber(summary.total_lessons_completed),
      icon: BookOpen,
      description: 'Completed lessons',
    },
    {
      title: 'Daily Average',
      value: formatDecimal(summary.average_daily_lessons),
      icon: TrendingUp,
      description: 'Lessons per day',
    },
    {
      title: 'Peak Activity',
      value: formatNumber(summary.peak_daily_activity),
      icon: Target,
      description: `On ${new Date(summary.peak_date).toLocaleDateString()}`,
    },
    {
      title: 'Total Users',
      value: formatNumber(summary.total_users),
      icon: Users,
      description: 'Registered users',
    },
    {
      title: 'Daily Active Users',
      value: formatDecimal(summary.daily_active_users_avg),
      icon: Activity,
      description: 'Average per day',
    },
    {
      title: 'Active Days',
      value: summary.active_learning_days.toString(),
      icon: Calendar,
      description: 'Days with activity',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}