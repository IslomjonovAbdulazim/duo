import { useNavigate } from '@tanstack/react-router'
import { Eye, GraduationCap, Users, Building2, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { type CourseStats } from '@/lib/stats-api'
import { useTranslation } from '@/i18n'

interface CoursesStatsTableProps {
  data: CourseStats[]
  isLoading: boolean
  onRefresh: () => void
}

export function CoursesStatsTable({ data, isLoading, onRefresh }: CoursesStatsTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleCourseClick = (courseId: number) => {
    navigate({ to: `/duo-stats/${courseId}` })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-5 w-5' />
            {t.duoStats.title}
          </CardTitle>
          <CardDescription>
            {t.duoStats.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center space-x-4'>
                <Skeleton className='h-12 w-12 rounded-full' />
                <div className='space-y-2 flex-1'>
                  <Skeleton className='h-4 w-[250px]' />
                  <Skeleton className='h-4 w-[200px]' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <GraduationCap className='h-5 w-5' />
            {t.duoStats.title}
          </CardTitle>
          <CardDescription>
            {t.duoStats.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <GraduationCap className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold text-muted-foreground mb-2'>
              {t.duoStats.noResults}
            </h3>
            <p className='text-sm text-muted-foreground mb-4 max-w-sm'>
              {t.duoStats.noResultsDescription}
            </p>
            <Button onClick={onRefresh} variant='outline'>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <GraduationCap className='h-5 w-5' />
          Course Statistics
        </CardTitle>
        <CardDescription>
          Click on any course to view detailed student progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.duoStats.table.course}</TableHead>
              <TableHead>{t.duoStats.table.totalStudents}</TableHead>
              <TableHead className='text-right'>{t.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((course) => (
              <TableRow 
                key={course.course_id}
                className='cursor-pointer hover:bg-muted/50 transition-colors'
                onClick={() => handleCourseClick(course.course_id)}
              >
                <TableCell>
                  <div className='flex items-center space-x-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                      <GraduationCap className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <div className='font-medium'>{course.course_title}</div>
                      <div className='text-sm text-muted-foreground'>
                        Course ID: {course.course_id}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Badge variant='secondary' className='flex items-center gap-1'>
                      <Users className='h-3 w-3' />
                      {course.total_students} {t.duoStats.table.students}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <Button 
                    variant='ghost' 
                    size='sm'
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCourseClick(course.course_id)
                    }}
                  >
                    <Eye className='h-4 w-4 mr-2' />
                    {t.duoStats.table.viewDetails}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Summary Card */}
        <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center space-x-2'>
                <GraduationCap className='h-5 w-5 text-blue-500' />
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Total Courses</p>
                  <p className='text-2xl font-bold'>{data.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center space-x-2'>
                <Users className='h-5 w-5 text-green-500' />
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Total Students</p>
                  <p className='text-2xl font-bold'>
                    {data.reduce((sum, course) => sum + course.total_students, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center space-x-2'>
                <Building2 className='h-5 w-5 text-purple-500' />
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Average Students</p>
                  <p className='text-2xl font-bold'>
                    {data.length > 0 ? Math.round(data.reduce((sum, course) => sum + course.total_students, 0) / data.length) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}