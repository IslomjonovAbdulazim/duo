import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PlusCircle, BookOpen, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { contentApi } from '@/lib/content-api'
import { createLessonSchema, type CreateLessonData, lessonTypeOptions } from '../data/schema'

interface CreateLessonDialogProps {
  courseId?: number
  children?: React.ReactNode
  onSuccess?: () => void
}

export function CreateLessonDialog({ courseId, children, onSuccess }: CreateLessonDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(createLessonSchema),
    defaultValues: {
      title: '',
      content: '',
      order: 1,
      lesson_type: 'word' as const,
      word_lesson_id: undefined,
    },
  })

  // Watch lesson type to conditionally show word lesson search
  const watchedLessonType = form.watch('lesson_type')
  const [wordLessonSearch, setWordLessonSearch] = useState('')

  // Fetch courses for dropdown (if courseId not provided)
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => contentApi.courses.list(),
    enabled: !courseId,
  })

  // Fetch word lessons for search (only when lesson type is TEST)
  const { data: wordLessons, isLoading: wordLessonsLoading } = useQuery({
    queryKey: ['word-lessons', courseId],
    queryFn: async () => {
      if (!courseId) return []
      const chapters = await contentApi.chapters.listByCourse(courseId)
      const allLessons = await Promise.all(
        chapters.map(chapter => contentApi.lessons.listByChapter(chapter.id))
      )
      return allLessons.flat().filter(lesson => lesson.lesson_type === 'word')
    },
    enabled: watchedLessonType === 'test' && !!courseId,
  })

  // Filter word lessons based on search
  const filteredWordLessons = wordLessons?.filter(lesson => 
    lesson.title.toLowerCase().includes(wordLessonSearch.toLowerCase())
  ) || []

  // Create lesson mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateLessonData & { courseId: number }) => 
      contentApi.lessons.create({
        title: data.title,
        content: data.content,
        order: data.order,
        chapter_id: data.courseId, // Note: This should be updated to use actual chapter_id
        lesson_type: data.lesson_type,
        word_lesson_id: data.word_lesson_id
      }),
    onSuccess: () => {
      toast.success('Lesson created successfully')
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      form.reset()
      setOpen(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to create lesson')
      console.error('Create lesson error:', error)
    },
  })

  const handleSubmit = (data: any) => {
    const selectedCourseId = courseId || parseInt(form.watch('courseId' as any))
    if (!selectedCourseId) {
      toast.error('Please select a course')
      return
    }
    createMutation.mutate({ ...data, courseId: selectedCourseId })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <PlusCircle className='h-4 w-4' />
            Add Lesson
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5' />
            Create New Lesson
          </DialogTitle>
          <DialogDescription>
            Add a new lesson to organize educational content and words.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <div className='grid gap-4'>
              {!courseId && (
                <FormField
                  control={form.control}
                  name={'courseId' as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course *</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        disabled={coursesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a course' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses?.map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              <div className='flex items-center gap-2'>
                                <div className={`w-2 h-2 rounded-full ${
                                  course.is_active ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                                {course.title}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                            {filteredWordLessons.map((lesson) => (
                              <SelectItem key={lesson.id} value={lesson.id.toString()}>
                                <div className='flex items-center gap-2'>
                                  <BookOpen className='h-4 w-4 text-muted-foreground' />
                                  <div className='flex flex-col'>
                                    <span>{lesson.title}</span>
                                    <span className='text-xs text-muted-foreground'>Order: {lesson.order}</span>
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
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={createMutation.isPending}
                className='min-w-[100px]'
              >
                {createMutation.isPending ? (
                  <div className='flex items-center gap-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Creating...
                  </div>
                ) : (
                  'Create Lesson'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}