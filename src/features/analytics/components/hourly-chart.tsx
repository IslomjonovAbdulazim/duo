import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface HourlyChartProps {
  data: Array<{
    hour: number
    time: string
    lessons: number
    unique_users: number
    percentage_of_daily: number
    lessons_per_user: number
    weekend_lessons: number
    weekday_lessons: number
    activity_level: string
  }>
}

export function HourlyChart({ data }: HourlyChartProps) {
  const getBarColor = (activityLevel: string) => {
    switch (activityLevel) {
      case 'peak': return '#dc2626' // red-600
      case 'high': return '#ea580c' // orange-600
      case 'moderate': return '#d97706' // amber-600
      case 'low': return '#65a30d' // lime-600
      case 'minimal': return '#6b7280' // gray-500
      default: return '#3b82f6' // blue-600
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hourly Activity Pattern</CardTitle>
        <CardDescription>
          Learning activity distribution throughout the day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={1}
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-md">
                      <p className="font-medium">Hour: {label}</p>
                      <div className="space-y-1 mt-2">
                        <p className="text-sm">
                          <span className="text-blue-600">Lessons:</span> {data.lessons.toLocaleString()}
                        </p>
                        <p className="text-sm">
                          <span className="text-green-600">Users:</span> {data.unique_users}
                        </p>
                        <p className="text-sm">
                          <span className="text-purple-600">Efficiency:</span> {data.lessons_per_user.toFixed(1)} lessons/user
                        </p>
                        <p className="text-sm">
                          <span className="text-orange-600">% of Daily:</span> {data.percentage_of_daily.toFixed(1)}%
                        </p>
                        <p className="text-sm capitalize">
                          <span className="text-gray-600">Activity:</span> {data.activity_level}
                        </p>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="lessons" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.activity_level)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded" />
            <span>Peak</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-600 rounded" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-600 rounded" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-lime-600 rounded" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-500 rounded" />
            <span>Minimal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}