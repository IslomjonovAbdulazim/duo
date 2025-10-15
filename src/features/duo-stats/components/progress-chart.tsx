import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type StudentProgress } from '@/lib/stats-api'

interface ProgressChartProps {
  students: StudentProgress[]
}

export function ProgressChart({ students }: ProgressChartProps) {

  // Prepare data for progress distribution chart
  const progressData = students.reduce((acc, student) => {
    const lessons = student.lessons_completed
    let range: string
    
    if (lessons === 0) {
      range = '0 lessons'
    } else if (lessons <= 10) {
      range = '1-10 lessons'
    } else if (lessons <= 25) {
      range = '11-25 lessons'
    } else if (lessons <= 50) {
      range = '26-50 lessons'
    } else {
      range = '50+ lessons'
    }

    const existing = acc.find(item => item.range === range)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({ range, count: 1 })
    }
    
    return acc
  }, [] as { range: string; count: number }[])

  // Prepare data for top performers
  const topPerformers = students
    .slice(0, 10)
    .map(student => ({
      name: student.full_name.split(' ')[0], // First name only
      lessons: student.lessons_completed,
    }))

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (students.length === 0) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Progress Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-center h-64 text-muted-foreground'>
              No data available
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-center h-64 text-muted-foreground'>
              No data available
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* Progress Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={progressData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ range, count, percent }) => 
                  `${range}: ${count} (${((percent || 0) * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill='#8884d8'
                dataKey='count'
              >
                {progressData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Students']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performers Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={topPerformers} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis 
                dataKey='name' 
                angle={-45}
                textAnchor='end'
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Lessons Completed']} />
              <Bar dataKey='lessons' fill='#8884d8' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}