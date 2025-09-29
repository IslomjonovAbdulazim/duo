import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  BookOpen,
  Eye,
  FileText,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { contentApi, type Course } from '@/lib/content-api'
import { UploadCourseLogoDialog } from './upload-course-logo-dialog'
import { getLogoUrl } from '@/lib/media-utils'

interface CoursesTableProps {
  data: Course[]
  isLoading?: boolean
  onEdit: (course: Course) => void
  onViewLessons: (course: Course) => void
  onViewChapters: (course: Course) => void
  onRefresh: () => void
}

export function CoursesTable({
  data,
  isLoading,
  onEdit,
  onViewLessons,
  onViewChapters,
  onRefresh,
}: CoursesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [uploadLogoDialogOpen, setUploadLogoDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const queryClient = useQueryClient()

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => contentApi.courses.delete(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      onRefresh()
      setDeleteDialogOpen(false)
      setSelectedCourse(null)
    },
    onError: (error) => {
      toast.error('Failed to delete course')
      console.error('Delete error:', error)
    },
  })

  const handleDelete = (course: Course) => {
    setSelectedCourse(course)
    setDeleteDialogOpen(true)
  }

  const handleUploadLogo = (course: Course) => {
    setSelectedCourse(course)
    setUploadLogoDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedCourse) {
      deleteMutation.mutate(selectedCourse.id)
    }
  }

  const handleLogoUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['courses'] })
    onRefresh()
    setUploadLogoDialogOpen(false)
    setSelectedCourse(null)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>No courses found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8'>
            <BookOpen className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-muted-foreground text-center'>
              No courses have been created yet.
              <br />
              Click "Add Course" to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className='border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/95'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-xl font-semibold flex items-center gap-2'>
                <BookOpen className='h-5 w-5 text-primary' />
                Courses ({data.length})
              </CardTitle>
              <CardDescription className='mt-1'>
                Manage educational courses and their content
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='text-sm text-muted-foreground'>Total Courses</div>
              <div className='text-2xl font-bold text-primary'>
                {data.length}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Languages</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead className='w-[70px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className='max-w-[350px]'>
                    <div className='space-y-1'>
                      <div className='font-medium truncate' title={course.title}>{course.title}</div>
                      <div className='text-sm text-muted-foreground'>
                        ID: #{course.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='max-w-[200px]'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2 text-sm'>
                        <span className='font-medium text-blue-600'>{course.native_language}</span>
                        <span className='text-muted-foreground'>→</span>
                        <span className='font-medium text-green-600'>{course.learning_language}</span>
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Native → Target
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      {course.logo_url ? (
                        <div className='relative'>
                          <Avatar className='h-10 w-10 border-2 border-green-200'>
                            <AvatarImage src={getLogoUrl(course.logo_url)} alt={course.title} />
                            <AvatarFallback className='bg-green-50'>
                              <BookOpen className='h-5 w-5 text-green-600' />
                            </AvatarFallback>
                          </Avatar>
                          <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></div>
                        </div>
                      ) : (
                        <div className='relative'>
                          <div className='h-10 w-10 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center'>
                            <BookOpen className='h-5 w-5 text-gray-400' />
                          </div>
                          <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-gray-300 rounded-full border-2 border-white'></div>
                        </div>
                      )}
                      <div className='flex flex-col'>
                        <span className={`text-xs font-medium ${course.logo_url ? 'text-green-600' : 'text-gray-500'}`}>
                          {course.logo_url ? '✓ Logo uploaded' : '○ No logo'}
                        </span>
                        <span className='text-[10px] text-muted-foreground'>
                          {course.logo_url ? 'Ready to display' : 'Upload recommended'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <span className='sr-only'>Open menu</span>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onViewChapters(course)}>
                          <FileText className='mr-2 h-4 w-4' />
                          View Chapters
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewLessons(course)}>
                          <Eye className='mr-2 h-4 w-4' />
                          View Lessons
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUploadLogo(course)}>
                          <Upload className='mr-2 h-4 w-4' />
                          Upload Logo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(course)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(course)}
                          className='text-red-600'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='Delete Course'
        desc={`Are you sure you want to delete "${selectedCourse?.title}"? This action cannot be undone and will also delete all associated lessons and words.`}
        confirmText='Delete'
        handleConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {selectedCourse && (
        <UploadCourseLogoDialog
          open={uploadLogoDialogOpen}
          onOpenChange={setUploadLogoDialogOpen}
          course={selectedCourse}
          onSuccess={handleLogoUploadSuccess}
        />
      )}
    </>
  )
}