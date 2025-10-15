import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Users, Phone, BookOpen, Award } from 'lucide-react'
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
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { statsApi } from '@/lib/stats-api'
import { useTranslation } from '@/i18n'
import { ProgressChart } from './progress-chart'

interface CourseDetailViewProps {
  courseId: number
}

export function CourseDetailView({ courseId }: CourseDetailViewProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    data: courseDetails,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['stats', 'course', courseId],
    queryFn: () => statsApi.getCourseDetails(courseId),
  })

  const handleBackClick = () => {
    navigate({ to: '/duo-stats' })
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        {/* Header Skeleton */}
        <div className='space-y-4'>
          <Skeleton className='h-8 w-32' />
          <div className='space-y-2'>
            <Skeleton className='h-8 w-64' />
            <Skeleton className='h-4 w-96' />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <Skeleton className='h-5 w-5' />
                  <div className='space-y-2 flex-1'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-6 w-12' />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-48' />
            <Skeleton className='h-4 w-64' />
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='flex items-center space-x-4'>
                  <Skeleton className='h-10 w-10 rounded-full' />
                  <div className='space-y-2 flex-1'>
                    <Skeleton className='h-4 w-48' />
                    <Skeleton className='h-3 w-32' />
                  </div>
                  <Skeleton className='h-4 w-16' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className='p-8'>
          <div className='text-center'>
            <p className='text-red-500 mb-4'>Failed to load course details</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!courseDetails) {
    return (
      <Card>
        <CardContent className='p-8'>
          <div className='text-center'>
            <p className='text-muted-foreground'>Course not found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { course_info, total_students, students } = courseDetails
  const maxLessons = Math.max(...students.map(s => s.lessons_completed), 1)

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-4'>
        <Button 
          variant='ghost' 
          onClick={handleBackClick}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          {t.duoStats.courseDetail.backToCourses}
        </Button>
        
        <div>
          <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
            {course_info.title}
          </h1>
          <p className='text-muted-foreground text-lg'>
            {t.duoStats.courseDetail.description}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <Users className='h-5 w-5 text-blue-500' />
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  {t.duoStats.courseDetail.totalStudents}
                </p>
                <p className='text-2xl font-bold'>{total_students}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <BookOpen className='h-5 w-5 text-green-500' />
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Average Progress
                </p>
                <p className='text-2xl font-bold'>
                  {students.length > 0 
                    ? Math.round(students.reduce((sum, s) => sum + s.lessons_completed, 0) / students.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <Award className='h-5 w-5 text-yellow-500' />
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Top Performer
                </p>
                <p className='text-lg font-bold'>
                  {students.length > 0 ? `${students[0]?.lessons_completed || 0} lessons` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      <ProgressChart students={students} />

      {/* Students Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            {t.duoStats.courseDetail.studentsProgress}
          </CardTitle>
          <CardDescription>
            Students sorted by lessons completed (highest first)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <Users className='h-12 w-12 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold text-muted-foreground mb-2'>
                {t.duoStats.courseDetail.noStudents}
              </h3>
              <p className='text-sm text-muted-foreground'>
                {t.duoStats.courseDetail.noStudentsDescription}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.duoStats.table.studentName}</TableHead>
                  <TableHead>{t.duoStats.table.phoneNumber}</TableHead>
                  <TableHead>{t.duoStats.table.lessonsCompleted}</TableHead>
                  <TableHead>{t.duoStats.table.progress}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.user_id}>
                    <TableCell>
                      <div className='flex items-center space-x-3'>
                        <Avatar className='h-8 w-8'>
                          <AvatarFallback className='text-xs'>
                            {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='font-medium'>{student.full_name}</div>
                          <div className='text-sm text-muted-foreground'>
                            ID: {student.user_id}
                          </div>
                        </div>
                        {index === 0 && (
                          <Badge variant='secondary' className='ml-2'>
                            <Award className='h-3 w-3 mr-1' />
                            Top
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {student.phone_number ? (
                          <>
                            <Phone className='h-4 w-4 text-muted-foreground' />
                            <span className='text-sm'>{student.phone_number}</span>
                          </>
                        ) : (
                          <span className='text-sm text-muted-foreground'>
                            {t.duoStats.table.noPhone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {student.lessons_completed} lessons
                      </Badge>
                    </TableCell>
                    <TableCell className='w-48'>
                      <div className='space-y-1'>
                        <div className='flex justify-between text-sm'>
                          <span>{student.lessons_completed}</span>
                          <span className='text-muted-foreground'>of {maxLessons}</span>
                        </div>
                        <Progress 
                          value={(student.lessons_completed / maxLessons) * 100} 
                          className='h-2'
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}