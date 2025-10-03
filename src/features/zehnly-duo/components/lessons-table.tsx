import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  BookOpen,
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
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { contentApi, type Lesson } from '@/lib/content-api'

interface LessonsTableProps {
  data: Lesson[]
  isLoading?: boolean
  onEdit: (lesson: Lesson) => void
  onLessonClick?: (lesson: Lesson) => void
  onRefresh: () => void
  selectedLesson?: Lesson | null
}

export function LessonsTable({
  data,
  isLoading,
  onEdit,
  onLessonClick,
  onRefresh,
  selectedLesson,
}: LessonsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null)
  const queryClient = useQueryClient()

  // Delete lesson mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => contentApi.lessons.delete(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      onRefresh()
      setDeleteDialogOpen(false)
      setLessonToDelete(null)
    },
    onError: (error) => {
      toast.error('Failed to delete lesson')
      console.error('Delete error:', error)
    },
  })

  const handleDelete = (lesson: Lesson) => {
    setLessonToDelete(lesson)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (lessonToDelete) {
      deleteMutation.mutate(lessonToDelete.id)
    }
  }

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'word':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'story':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
      case 'test':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lessons</CardTitle>
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
          <CardTitle>Lessons</CardTitle>
          <CardDescription>No lessons found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8'>
            <BookOpen className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-muted-foreground text-center'>
              No lessons have been created yet.
              <br />
              Click "Add Lesson" to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort lessons by order
  const sortedLessons = [...data].sort((a, b) => a.order - b.order)

  return (
    <>
      <Card className='border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/95'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-xl font-semibold flex items-center gap-2'>
                <BookOpen className='h-5 w-5 text-primary' />
                Lessons ({sortedLessons.length})
              </CardTitle>
              <CardDescription className='mt-1'>
                Manage chapter lessons and their content
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='text-sm text-muted-foreground'>Total Lessons</div>
              <div className='text-2xl font-bold text-primary'>
                {sortedLessons.length}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Lesson Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className='w-[70px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLessons.map((lesson) => {
                const isSelected = selectedLesson?.id === lesson.id
                const isTestLesson = lesson.lesson_type === 'test'
                return (
                <TableRow 
                  key={lesson.id}
                  className={`transition-colors ${
                    isTestLesson 
                      ? 'cursor-not-allowed opacity-70' 
                      : 'cursor-pointer hover:bg-muted/50'
                  } ${isSelected ? 'bg-muted border-l-4 border-l-primary' : ''}`}
                  onClick={() => !isTestLesson && onLessonClick?.(lesson)}
                >
                  <TableCell>
                    <Badge variant='outline' className='w-8 h-8 rounded-full flex items-center justify-center p-0'>
                      {lesson.order}
                    </Badge>
                  </TableCell>
                  <TableCell className='max-w-[300px]'>
                    <div className='space-y-1'>
                      <div className='font-medium truncate' title={lesson.title}>
                        {lesson.title}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        ID: #{lesson.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant='secondary' className={getLessonTypeColor(lesson.lesson_type)}>
                      {lesson.lesson_type.charAt(0).toUpperCase() + lesson.lesson_type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className='max-w-[400px]'>
                    <p className='text-sm text-muted-foreground truncate' title={lesson.content}>
                      {lesson.content}
                    </p>
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
                        <DropdownMenuItem onClick={() => onEdit(lesson)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(lesson)}
                          className='text-red-600'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='Delete Lesson'
        desc={`Are you sure you want to delete "${lessonToDelete?.title}"? This action cannot be undone.`}
        confirmText='Delete'
        handleConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}