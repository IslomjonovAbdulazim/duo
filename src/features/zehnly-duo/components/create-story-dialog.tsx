import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PlusCircle, FileText, Zap, Upload, Search } from 'lucide-react'
import { z } from 'zod'
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
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { contentApi } from '@/lib/content-api'
import { DirectAudioGenerationButton } from '@/components/direct-audio-generation-button'
import { FileUploadDialog } from '@/components/file-upload-dialog'

// Schema for story creation
const createStorySchema = z.object({
  story_text: z.string().min(1, 'Story text is required'),
  word_lesson_id: z.number().optional(),
})

type CreateStoryData = z.infer<typeof createStorySchema>

interface CreateStoryDialogProps {
  lessonId: number
  chapterId: number
  children?: React.ReactNode
  onSuccess?: () => void
}

export function CreateStoryDialog({ lessonId, chapterId, children, onSuccess }: CreateStoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [createdStoryId, setCreatedStoryId] = useState<number | null>(null)
  const [wordLessonSearch, setWordLessonSearch] = useState('')
  const [storyVoice, setStoryVoice] = useState<string>('Betty')
  const queryClient = useQueryClient()

  // Fetch word lessons for search directly from chapter
  const { data: wordLessons, isLoading: wordLessonsLoading } = useQuery({
    queryKey: ['word-lessons', chapterId],
    queryFn: async () => {
      if (!chapterId) return []
      // Get all lessons in this chapter and filter for word lessons
      const allLessons = await contentApi.lessons.listByChapter(chapterId)
      return allLessons.filter(l => l.lesson_type === 'word' && l.id !== lessonId)
    },
    enabled: !!chapterId && open,
  })

  // Filter word lessons based on search
  const filteredWordLessons = wordLessons?.filter(l => 
    l.title.toLowerCase().includes(wordLessonSearch.toLowerCase())
  ) || []

  const form = useForm<CreateStoryData>({
    resolver: zodResolver(createStorySchema),
    defaultValues: {
      story_text: '',
      word_lesson_id: undefined,
    },
  })

  // Create story mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateStoryData) => 
      contentApi.stories.create({
        ...data,
        lesson_id: lessonId,
        audio_url: null,
        word_lesson_id: data.word_lesson_id,
      }),
    onSuccess: (createdStory) => {
      toast.success('Story created successfully')
      queryClient.invalidateQueries({ queryKey: ['stories', lessonId] })
      setCreatedStoryId(createdStory.id)
      form.reset()
      // Don't close dialog immediately, allow audio upload
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to create story')
      console.error('Create story error:', error)
    },
  })

  const handleSubmit = (data: CreateStoryData) => {
    createMutation.mutate(data)
  }

  const handleDialogClose = (open: boolean) => {
    setOpen(open)
    if (!open) {
      // Reset state when dialog closes
      setCreatedStoryId(null)
      setWordLessonSearch('')
      setStoryVoice('Betty')
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <PlusCircle className='h-4 w-4' />
            Add Story
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Create New Story
          </DialogTitle>
          <DialogDescription>
            Add a new story to this lesson with engaging content.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <div className='grid gap-4'>
              <FormField
                control={form.control}
                name='story_text'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Content *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='Once upon a time, there was a young student learning English...'
                        className='min-h-[200px]'
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Word Lesson Selection */}
              <FormField
                control={form.control}
                name='word_lesson_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connect to Word Lesson (Optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === 'none' ? undefined : Number(value))} 
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a word lesson to connect...' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className='p-2'>
                          <div className='relative'>
                            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                            <Input
                              placeholder='Search word lessons...'
                              value={wordLessonSearch}
                              onChange={(e) => setWordLessonSearch(e.target.value)}
                              className='pl-10'
                            />
                          </div>
                        </div>
                        <SelectItem value='none'>No word lesson connection</SelectItem>
                        {wordLessonsLoading ? (
                          <div className='p-2 text-center text-sm text-muted-foreground'>
                            Loading word lessons...
                          </div>
                        ) : filteredWordLessons.length > 0 ? (
                          filteredWordLessons.map((lesson) => (
                            <SelectItem key={lesson.id} value={String(lesson.id)}>
                              {lesson.title}
                            </SelectItem>
                          ))
                        ) : (
                          <div className='p-2 text-center text-sm text-muted-foreground'>
                            {wordLessonSearch ? 'No word lessons found matching your search' : 'No word lessons available'}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <p className='text-xs text-muted-foreground'>
                      Connect this story to a specific word lesson to reinforce vocabulary learning.
                    </p>
                  </FormItem>
                )}
              />

              {createdStoryId && (
                <div className='grid gap-4'>
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium text-green-600'>✓ Story Created! Add Audio (Optional)</h4>
                    
                    {/* Story Audio */}
                    <div className='space-y-2'>
                      <span className='text-sm font-medium'>Story Narration</span>
                      <div className='space-y-2'>
                        <Select value={storyVoice} onValueChange={setStoryVoice}>
                          <SelectTrigger className='w-48'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Betty'>
                              <div className='flex items-center gap-2'>
                                <span>🇺🇸</span>
                                Betty
                              </div>
                            </SelectItem>
                            <SelectItem value='default'>Default</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className='flex gap-2'>
                          <DirectAudioGenerationButton
                            onGenerate={() => contentApi.stories.generateAudio(createdStoryId, storyVoice === 'default' ? null : storyVoice as any)}
                            queryKey={['stories', lessonId]}
                          >
                            <Zap className='h-4 w-4 mr-2' />
                            Generate
                          </DirectAudioGenerationButton>
                        <FileUploadDialog
                          title='Upload Story Audio'
                          description='Upload an MP3 audio file for story narration.'
                          accept='audio/mp3,audio/mpeg'
                          onUpload={(file) => contentApi.stories.uploadAudio(createdStoryId, file)}
                          queryKey={['stories', lessonId]}
                        >
                          <Button type='button' variant='outline' size='sm'>
                            <Upload className='h-4 w-4 mr-2' />
                            Upload
                          </Button>
                        </FileUploadDialog>
                        </div>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        Generate AI narration or upload your own audio file for this story.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                {createdStoryId ? 'Done' : 'Cancel'}
              </Button>
              {!createdStoryId && (
                <Button
                  type='submit'
                  disabled={createMutation.isPending}
                  className='min-w-[120px]'
                >
                  {createMutation.isPending ? (
                    <div className='flex items-center gap-2'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Story'
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}