import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DailyChartProps {
  data: Array<{
    date: string
    day_of_week: string
    dau: number
    lessons_completed: number
    lessons_per_user: number
    lesson_breakdown: {
      word: number
      story: number
      test: number
    }
    performance_rating: string
  }>
}

export function DailyChart({ data }: DailyChartProps) {
  // Take last 14 days for better visibility
  const recentData = data.slice(-14).map(item => ({
    ...item,
    shortDate: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Activity Trend</CardTitle>
        <CardDescription>
          Lessons completed and daily active users over the last 14 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={recentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="shortDate" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="lessons"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="users"
              orientation="right"
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
                      <p className="font-medium">{data.day_of_week}, {label}</p>
                      <div className="space-y-1 mt-2">
                        <p className="text-sm">
                          <span className="text-blue-600">Lessons:</span> {data.lessons_completed}
                        </p>
                        <p className="text-sm">
                          <span className="text-green-600">DAU:</span> {data.dau}
                        </p>
                        <p className="text-sm">
                          <span className="text-purple-600">Efficiency:</span> {data.lessons_per_user.toFixed(1)} lessons/user
                        </p>
                        <p className="text-sm capitalize">
                          <span className="text-gray-600">Rating:</span> {data.performance_rating}
                        </p>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Line 
              yAxisId="lessons"
              type="monotone" 
              dataKey="lessons_completed" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Lessons"
              dot={{ r: 4 }}
            />
            <Line 
              yAxisId="users"
              type="monotone" 
              dataKey="dau" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Daily Active Users"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}