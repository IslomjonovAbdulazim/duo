import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface UserSegmentationProps {
  segmentation: Array<{
    segment: string
    lesson_range: string
    user_count: number
    percentage: number
    avg_lessons: number
    behavior: string
  }>
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function UserSegmentation({ segmentation }: UserSegmentationProps) {
  const chartData = segmentation.map(item => ({
    name: item.segment,
    value: item.percentage,
    count: item.user_count,
    range: item.lesson_range,
    avg: item.avg_lessons,
    behavior: item.behavior
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Segmentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }: any) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as any
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-md">
                            <p className="font-medium capitalize">{data.name} Users</p>
                            <div className="space-y-1 mt-2">
                              <p className="text-sm">
                                <span className="text-blue-600">Count:</span> {data.count.toLocaleString()}
                              </p>
                              <p className="text-sm">
                                <span className="text-green-600">Percentage:</span> {data.value.toFixed(1)}%
                              </p>
                              <p className="text-sm">
                                <span className="text-purple-600">Range:</span> {data.range} lessons
                              </p>
                              <p className="text-sm">
                                <span className="text-orange-600">Average:</span> {data.avg.toFixed(1)} lessons
                              </p>
                              <p className="text-sm capitalize">
                                <span className="text-gray-600">Behavior:</span> {data.behavior.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Table */}
            <div className="space-y-4">
              {segmentation.map((segment, index) => (
                <div key={segment.segment} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <h3 className="font-medium capitalize">{segment.segment} Users</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">User Count</p>
                      <p className="font-medium">{segment.user_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Percentage</p>
                      <p className="font-medium">{segment.percentage.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lesson Range</p>
                      <p className="font-medium">{segment.lesson_range}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Average Lessons</p>
                      <p className="font-medium">{segment.avg_lessons.toFixed(1)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-muted-foreground text-sm">Behavior</p>
                    <p className="font-medium text-sm capitalize">
                      {segment.behavior.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}