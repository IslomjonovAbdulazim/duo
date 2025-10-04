import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Edit, Volume2, Zap, Upload, Search } from 'lucide-react'
import { z } from 'zod'
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
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { contentApi, type Story, buildMediaUrl } from '@/lib/content-api'
import { DirectAudioGenerationButton } from '@/components/direct-audio-generation-button'
import { FileUploadDialog } from '@/components/file-upload-dialog'

// Schema for story update
const updateStorySchema = z.object({
  story_text: z.string().min(1, 'Story text is required'),
  word_lesson_id: z.number().optional(),
})

type UpdateStoryData = z.infer<typeof updateStorySchema>

interface EditStoryDialogProps {
  story: Story | null
  chapterId?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditStoryDialog({ story, chapterId, open, onOpenChange, onSuccess }: EditStoryDialogProps) {
  const [wordLessonSearch, setWordLessonSearch] = useState('')
  const queryClient = useQueryClient()

  // Fetch word lessons for search directly from chapter
  const { data: wordLessons, isLoading: wordLessonsLoading } = useQuery({
    queryKey: ['word-lessons', chapterId],
    queryFn: async () => {
      if (!chapterId) return []
      // Get all lessons in this chapter and filter for word lessons
      const allLessons = await contentApi.lessons.listByChapter(chapterId)
      return allLessons.filter(l => l.lesson_type === 'word' && l.id !== story?.lesson_id)
    },
    enabled: !!chapterId && open,
  })

  // Filter word lessons based on search
  const filteredWordLessons = wordLessons?.filter(l => 
    l.title.toLowerCase().includes(wordLessonSearch.toLowerCase())
  ) || []

  const form = useForm<UpdateStoryData>({
    resolver: zodResolver(updateStorySchema),
    defaultValues: {
      story_text: '',
      word_lesson_id: undefined,
    },
  })

  // Update story mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateStoryData) => {
      if (!story) throw new Error('No story selected')
      return contentApi.stories.update(story.id, data)
    },
    onSuccess: () => {
      toast.success('Story updated successfully')
      queryClient.invalidateQueries({ queryKey: ['stories', story?.lesson_id] })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to update story')
      console.error('Update story error:', error)
    },
  })

  // Reset form when story changes
  useEffect(() => {
    if (story) {
      form.reset({
        story_text: story.story_text,
        word_lesson_id: story.word_lesson_id,
      })
    }
  }, [story, form])

  const handleSubmit = (data: UpdateStoryData) => {
    updateMutation.mutate(data)
  }

  if (!story) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            Edit Story
          </DialogTitle>
          <DialogDescription>
            Update the story content and narration.
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

              <div className='grid gap-4'>
                <div className='space-y-4'>
                  <h4 className='text-sm font-medium text-muted-foreground'>Audio Management</h4>
                  
                  {/* Story Audio */}
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Story Narration</span>
                      {story?.audio_url && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            const audio = new Audio(buildMediaUrl(story.audio_url)!)
                            audio.play().catch(console.error)
                          }}
                        >
                          <Volume2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                    <div className='flex gap-2'>
                      <DirectAudioGenerationButton
                        onGenerate={() => contentApi.stories.generateAudio(story!.id, null)}
                        queryKey={['stories', story?.lesson_id]}
                      >
                        <Zap className='h-4 w-4 mr-2' />
                        Generate
                      </DirectAudioGenerationButton>
                      <FileUploadDialog
                        title='Upload Story Audio'
                        description='Upload an MP3 audio file for story narration.'
                        accept='audio/mp3,audio/mpeg'
                        onUpload={(file) => contentApi.stories.uploadAudio(story!.id, file)}
                        queryKey={['stories', story?.lesson_id]}
                      >
                        <Button type='button' variant='outline' size='sm'>
                          <Upload className='h-4 w-4 mr-2' />
                          Upload
                        </Button>
                      </FileUploadDialog>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Generate AI narration or upload your own audio file for this story.
                    </p>
                  </div>
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
                className='min-w-[120px]'
              >
                {updateMutation.isPending ? (
                  <div className='flex items-center gap-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Updating...
                  </div>
                ) : (
                  'Update Story'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}