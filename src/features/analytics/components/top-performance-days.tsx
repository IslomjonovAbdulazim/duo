import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award } from 'lucide-react'

interface TopPerformanceDaysProps {
  days: Array<{
    rank: number
    date: string
    day: string
    dau: number
    lessons: number
    efficiency: number
    achievement: string
  }>
}

export function TopPerformanceDays({ days }: TopPerformanceDaysProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return Trophy
      case 2: return Medal
      case 3: return Award
      default: return null
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600'
      case 2: return 'text-gray-500'
      case 3: return 'text-amber-700'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performance Days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {days.map((day) => {
            const RankIcon = getRankIcon(day.rank)
            return (
              <div key={day.rank} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {RankIcon && (
                      <RankIcon className={`h-5 w-5 ${getRankColor(day.rank)}`} />
                    )}
                    <span className="font-bold text-lg">#{day.rank}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-medium">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {day.achievement.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">DAU</p>
                      <p className="font-medium">{day.dau}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lessons</p>
                      <p className="font-medium">{day.lessons.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Efficiency</p>
                      <p className="font-medium">{day.efficiency.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}