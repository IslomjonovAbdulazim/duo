import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface CoursesAnalyticsProps {
  courses: Array<{
    course_id: number
    course_name: string
    total_users: number
    total_lessons: number
    market_share_users: number
    market_share_lessons: number
    status: string
  }>
}

export function CoursesAnalytics({ courses }: CoursesAnalyticsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'primary': return 'default'
      case 'secondary': return 'secondary'
      case 'emerging': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course.course_id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium leading-none">{course.course_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Course ID: {course.course_id}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(course.status) as any}>
                    {course.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Users</p>
                    <p className="font-medium">{course.total_users.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Lessons</p>
                    <p className="font-medium">{course.total_lessons.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">User Market Share</p>
                    <p className="font-medium">{course.market_share_users.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lesson Market Share</p>
                    <p className="font-medium">{course.market_share_lessons.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>User Share</span>
                    <span>{course.market_share_users.toFixed(1)}%</span>
                  </div>
                  <Progress value={course.market_share_users} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Lesson Share</span>
                    <span>{course.market_share_lessons.toFixed(1)}%</span>
                  </div>
                  <Progress value={course.market_share_lessons} className="h-2" />
                </div>

                {course !== courses[courses.length - 1] && (
                  <div className="border-b" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}