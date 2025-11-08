import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Users, BookOpen, Target, Zap } from 'lucide-react'

interface KPIsDisplayProps {
  kpis: {
    user_retention_rate: number
    power_users_percentage: number
    avg_lessons_per_active_user: number
    course_completion_balance: number
    peak_hour_concentration: number
  }
}

export function KPIsDisplay({ kpis }: KPIsDisplayProps) {
  const kpiData = [
    {
      title: 'User Retention Rate',
      value: kpis.user_retention_rate,
      unit: '%',
      description: 'Users with 5+ lessons',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      target: 70, // Example target for progress bar
    },
    {
      title: 'Power Users',
      value: kpis.power_users_percentage,
      unit: '%',
      description: 'Users with 50+ lessons',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      target: 5,
    },
    {
      title: 'Avg Lessons per User',
      value: kpis.avg_lessons_per_active_user,
      unit: '',
      description: 'Among active users',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      target: 20,
    },
    {
      title: 'Course Balance',
      value: kpis.course_completion_balance * 100, // Convert to percentage
      unit: '%',
      description: 'Course completion balance',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      target: 100,
    },
    {
      title: 'Peak Hour Focus',
      value: kpis.peak_hour_concentration,
      unit: '%',
      description: 'Activity in peak hour',
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      target: 15,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Performance Indicators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {kpiData.map((kpi) => {
            const Icon = kpi.icon
            const progressValue = (kpi.value / kpi.target) * 100
            
            return (
              <div key={kpi.title} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                      <Icon className={`h-4 w-4 ${kpi.color}`} />
                    </div>
                    <div>
                      <h3 className="font-medium">{kpi.title}</h3>
                      <p className="text-sm text-muted-foreground">{kpi.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {kpi.value.toFixed(1)}{kpi.unit}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress toward target ({kpi.target}{kpi.unit})</span>
                    <span>{Math.min(progressValue, 100).toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(progressValue, 100)} 
                    className="h-2"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}