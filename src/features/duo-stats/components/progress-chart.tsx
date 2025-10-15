import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type StudentProgress } from '@/lib/stats-api'

interface ProgressChartProps {
  students: StudentProgress[]
}

export function ProgressChart({ students }: ProgressChartProps) {

  // Prepare data for lesson completion distribution in 5-lesson intervals
  const lessonRanges = [
    { range: '0', min: 0, max: 0, label: '0 lessons' },
    { range: '1-5', min: 1, max: 5, label: '1-5 lessons' },
    { range: '6-10', min: 6, max: 10, label: '6-10 lessons' },
    { range: '11-15', min: 11, max: 15, label: '11-15 lessons' },
    { range: '16-20', min: 16, max: 20, label: '16-20 lessons' },
    { range: '21-25', min: 21, max: 25, label: '21-25 lessons' },
    { range: '26-30', min: 26, max: 30, label: '26-30 lessons' },
    { range: '31-35', min: 31, max: 35, label: '31-35 lessons' },
    { range: '36-40', min: 36, max: 40, label: '36-40 lessons' },
    { range: '41-45', min: 41, max: 45, label: '41-45 lessons' },
    { range: '46-50', min: 46, max: 50, label: '46-50 lessons' },
    { range: '51+', min: 51, max: Infinity, label: '51+ lessons' },
  ]

  const chartData = lessonRanges.map(rangeInfo => {
    const count = students.filter(student => {
      const lessons = student.lessons_completed
      return lessons >= rangeInfo.min && lessons <= rangeInfo.max
    }).length
    
    return {
      range: rangeInfo.range,
      students: count,
      label: rangeInfo.label,
    }
  }).filter(item => item.students > 0) // Only show ranges that have students

  // Custom colors for better visualization
  const getBarColor = (range: string) => {
    const colorMap: Record<string, string> = {
      '0': '#ef4444',           // Red for no progress
      '1-5': '#f97316',         // Orange for minimal progress
      '6-10': '#eab308',        // Yellow for low progress
      '11-15': '#84cc16',       // Light green for moderate progress
      '16-20': '#22c55e',       // Green for good progress
      '21-25': '#10b981',       // Emerald for high progress
      '26-30': '#06b6d4',       // Cyan for very high progress
      '31-35': '#3b82f6',       // Blue for excellent progress
      '36-40': '#6366f1',       // Indigo for outstanding progress
      '41-45': '#8b5cf6',       // Violet for exceptional progress
      '46-50': '#a855f7',       // Purple for amazing progress
      '51+': '#d946ef',         // Magenta for incredible progress
    }
    return colorMap[range] || '#6b7280'
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lesson Completion Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-96 text-muted-foreground'>
            <div className='text-center'>
              <div className='text-lg font-medium'>No data available</div>
              <div className='text-sm'>No students found for this course</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-xl'>
          📊 Lesson Completion Distribution
        </CardTitle>
        <div className='text-sm text-muted-foreground'>
          Distribution of students by number of lessons completed (grouped in 5-lesson intervals)
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={400}>
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray='3 3' opacity={0.3} />
            <XAxis 
              dataKey='range'
              angle={-45}
              textAnchor='end'
              height={80}
              fontSize={12}
              interval={0}
            />
            <YAxis 
              label={{ value: 'Number of Students', angle: -90, position: 'insideLeft' }}
              fontSize={12}
            />
            <Tooltip 
              formatter={(value, _, props) => [
                `${value} students`,
                props.payload?.label || 'Students'
              ]}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.range === label)
                return item?.label || label
              }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <Bar 
              dataKey='students' 
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Summary Statistics */}
        <div className='mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
          <div className='text-center p-3 bg-muted/50 rounded-lg'>
            <div className='font-semibold text-lg'>{students.length}</div>
            <div className='text-muted-foreground'>Total Students</div>
          </div>
          <div className='text-center p-3 bg-muted/50 rounded-lg'>
            <div className='font-semibold text-lg'>
              {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.lessons_completed, 0) / students.length) : 0}
            </div>
            <div className='text-muted-foreground'>Average Lessons</div>
          </div>
          <div className='text-center p-3 bg-muted/50 rounded-lg'>
            <div className='font-semibold text-lg'>
              {students.length > 0 ? Math.max(...students.map(s => s.lessons_completed)) : 0}
            </div>
            <div className='text-muted-foreground'>Highest Progress</div>
          </div>
          <div className='text-center p-3 bg-muted/50 rounded-lg'>
            <div className='font-semibold text-lg'>
              {students.filter(s => s.lessons_completed > 0).length}
            </div>
            <div className='text-muted-foreground'>Active Students</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}