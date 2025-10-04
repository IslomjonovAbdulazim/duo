import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  Volume2,
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
import { contentApi, type Story, buildMediaUrl } from '@/lib/content-api'

interface StoriesTableProps {
  data: Story[]
  isLoading?: boolean
  onEdit: (story: Story) => void
  onRefresh: () => void
  lessonId?: number
}

export function StoriesTable({
  data,
  isLoading,
  onEdit,
  onRefresh,
  lessonId: _lessonId,
}: StoriesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null)
  const queryClient = useQueryClient()

  // Get unique word lesson IDs from stories
  const wordLessonIds = [...new Set(data.filter(story => story.word_lesson_id).map(story => story.word_lesson_id!))]

  // Fetch word lessons to display their titles
  const { data: wordLessons } = useQuery({
    queryKey: ['word-lessons-by-ids', wordLessonIds],
    queryFn: async () => {
      if (wordLessonIds.length === 0) return []
      const lessons = await Promise.all(
        wordLessonIds.map(id => contentApi.lessons.get(id))
      )
      return lessons
    },
    enabled: wordLessonIds.length > 0,
  })

  // Create a map for quick lookup
  const wordLessonMap = new Map(wordLessons?.map(lesson => [lesson.id, lesson]) || [])

  // Delete story mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => contentApi.stories.delete(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['stories'] })
      onRefresh()
      setDeleteDialogOpen(false)
      setStoryToDelete(null)
    },
    onError: (error) => {
      toast.error('Failed to delete story')
      console.error('Delete error:', error)
    },
  })

  const handleDelete = (story: Story) => {
    setStoryToDelete(story)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (storyToDelete) {
      deleteMutation.mutate(storyToDelete.id)
    }
  }

  const playAudio = (audioUrl: string) => {
    if (audioUrl) {
      const fullUrl = buildMediaUrl(audioUrl)
      if (fullUrl) {
        const audio = new Audio(fullUrl)
        audio.play().catch((error) => {
          console.error('Error playing audio:', error)
          toast.error('Failed to play audio')
        })
      }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stories</CardTitle>
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
          <CardTitle>Stories</CardTitle>
          <CardDescription>No stories found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8'>
            <FileText className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-muted-foreground text-center'>
              No stories have been created yet.
              <br />
              Click "Add Story" to get started.
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
                <FileText className='h-5 w-5 text-primary' />
                Stories ({data.length})
              </CardTitle>
              <CardDescription className='mt-1'>
                Manage story content for this lesson
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='text-sm text-muted-foreground'>Total Stories</div>
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
                <TableHead>Story Text</TableHead>
                <TableHead>Word Lesson</TableHead>
                <TableHead>Audio</TableHead>
                <TableHead className='w-[70px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((story) => (
                <TableRow key={story.id}>
                  <TableCell className='max-w-[500px]'>
                    <div className='space-y-1'>
                      <div className='text-sm text-muted-foreground' style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }} title={story.story_text}>
                        {story.story_text}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        ID: #{story.id} • {story.story_text.length} characters
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {story.word_lesson_id ? (
                      <div className='flex items-center gap-2'>
                        <Badge variant='secondary' className='text-xs'>
                          {wordLessonMap.get(story.word_lesson_id)?.title || `Lesson #${story.word_lesson_id}`}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant='outline' className='text-xs text-muted-foreground'>
                        No connection
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      {story.audio_url ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                          onClick={() => playAudio(story.audio_url!)}
                          title='Play story audio'
                        >
                          <Volume2 className='h-4 w-4 text-blue-600' />
                        </Button>
                      ) : (
                        <Badge variant='outline' className='text-xs'>
                          No audio
                        </Badge>
                      )}
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
                        <DropdownMenuItem onClick={() => onEdit(story)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(story)}
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
        title='Delete Story'
        desc={`Are you sure you want to delete this story? This action cannot be undone.`}
        confirmText='Delete'
        handleConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}