import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Edit, BookOpen, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { contentApi, type Lesson } from '@/lib/content-api'
import { updateLessonSchema, type UpdateLessonData, lessonTypeOptions } from '../data/schema'

interface EditLessonDialogProps {
  lesson: Lesson | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditLessonDialog({ lesson, open, onOpenChange, onSuccess }: EditLessonDialogProps) {
  const queryClient = useQueryClient()
  const [wordLessonSearch, setWordLessonSearch] = useState('')

  const form = useForm({
    resolver: zodResolver(updateLessonSchema),
    defaultValues: {
      title: '',
      content: '',
      order: 1,
      lesson_type: 'word',
      word_lesson_id: undefined,
    },
  })

  // Watch lesson type to conditionally show word lesson search
  const watchedLessonType = form.watch('lesson_type')

  // Fetch word lessons for search (only when lesson type is TEST)
  const { data: wordLessons, isLoading: wordLessonsLoading } = useQuery({
    queryKey: ['word-lessons', lesson?.chapter_id],
    queryFn: async () => {
      if (!lesson?.chapter_id) return []
      // Get all lessons in this chapter and filter for word lessons
      const allLessons = await contentApi.lessons.listByChapter(lesson.chapter_id)
      return allLessons.filter(l => l.lesson_type === 'word' && l.id !== lesson?.id)
    },
    enabled: watchedLessonType === 'test' && !!lesson && open,
  })

  // Filter word lessons based on search
  const filteredWordLessons = wordLessons?.filter(l => 
    l.title.toLowerCase().includes(wordLessonSearch.toLowerCase())
  ) || []


  // Update lesson mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateLessonData) => {
      if (!lesson) throw new Error('No lesson selected')
      return contentApi.lessons.update(lesson.id, data)
    },
    onSuccess: () => {
      toast.success('Lesson updated successfully')
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to update lesson')
      console.error('Update lesson error:', error)
    },
  })

  // Reset form when lesson changes
  useEffect(() => {
    if (lesson) {
      form.reset({
        title: lesson.title,
        content: lesson.content,
        order: lesson.order,
        lesson_type: lesson.lesson_type || 'word',
        word_lesson_id: lesson.word_lesson_id,
      })
    }
  }, [lesson, form])

  const handleSubmit = (data: any) => {
    updateMutation.mutate(data)
  }

  if (!lesson) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            Edit Lesson
          </DialogTitle>
          <DialogDescription>
            Update the lesson information and content.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <div className='grid gap-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='md:col-span-2'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lesson Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder='e.g., Greetings and Introductions' 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name='order'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order *</FormLabel>
                        <FormControl>
                          <Input 
                            type='number'
                            min='1'
                            placeholder='1'
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name='lesson_type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Type *</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select lesson type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lessonTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className='flex flex-col'>
                              <span className='font-medium'>{option.label}</span>
                              <span className='text-xs text-muted-foreground'>{option.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedLessonType === 'test' && (
                <FormField
                  control={form.control}
                  name='word_lesson_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connect to Word Lesson *</FormLabel>
                      <div className='space-y-2'>
                        <div className='relative'>
                          <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                          <Input
                            placeholder='Search word lessons...'
                            value={wordLessonSearch}
                            onChange={(e) => setWordLessonSearch(e.target.value)}
                            className='pl-10'
                          />
                        </div>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                          disabled={wordLessonsLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a word lesson to connect' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className='max-h-60'>
                            {filteredWordLessons.map((wordLesson) => (
                              <SelectItem key={wordLesson.id} value={wordLesson.id.toString()}>
                                <div className='flex items-center gap-2'>
                                  <BookOpen className='h-4 w-4 text-muted-foreground' />
                                  <div className='flex flex-col'>
                                    <span>{wordLesson.title}</span>
                                    <span className='text-xs text-muted-foreground'>Order: {wordLesson.order}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                            {filteredWordLessons.length === 0 && !wordLessonsLoading && (
                              <div className='p-2 text-sm text-muted-foreground text-center'>
                                {wordLessonSearch ? 'No word lessons found matching your search' : 'No word lessons available'}
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Content *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe the lesson objectives, key concepts, and learning outcomes...'
                        className='min-h-[150px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='bg-muted/50 border rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <BookOpen className='h-4 w-4 text-muted-foreground' />
                  <span className='font-medium text-sm'>Current Course</span>
                </div>
                <div className='text-sm text-muted-foreground'>
                  Chapter {lesson.chapter_id}
                </div>
                <div className='text-xs text-muted-foreground mt-1'>
                  Note: To move this lesson to a different course, please create a new lesson in the target course.
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={updateMutation.isPending}
                className='min-w-[100px]'
              >
                {updateMutation.isPending ? (
                  <div className='flex items-center gap-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Updating...
                  </div>
                ) : (
                  'Update Lesson'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}