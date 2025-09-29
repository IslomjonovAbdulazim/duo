import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PlusCircle, FileText, Zap, Upload } from 'lucide-react'
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
import { contentApi } from '@/lib/content-api'
import { DirectAudioGenerationButton } from '@/components/direct-audio-generation-button'
import { FileUploadDialog } from '@/components/file-upload-dialog'

// Schema for story creation
const createStorySchema = z.object({
  story_text: z.string().min(1, 'Story text is required'),
})

type CreateStoryData = z.infer<typeof createStorySchema>

interface CreateStoryDialogProps {
  lessonId: number
  children?: React.ReactNode
  onSuccess?: () => void
}

export function CreateStoryDialog({ lessonId, children, onSuccess }: CreateStoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [createdStoryId, setCreatedStoryId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const form = useForm<CreateStoryData>({
    resolver: zodResolver(createStorySchema),
    defaultValues: {
      story_text: '',
    },
  })

  // Create story mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateStoryData) => 
      contentApi.stories.create({
        ...data,
        lesson_id: lessonId,
        audio_url: null,
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

              {createdStoryId && (
                <div className='grid gap-4'>
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium text-green-600'>✓ Story Created! Add Audio (Optional)</h4>
                    
                    {/* Story Audio */}
                    <div className='space-y-2'>
                      <span className='text-sm font-medium'>Story Narration</span>
                      <div className='flex gap-2'>
                        <DirectAudioGenerationButton
                          onGenerate={() => contentApi.stories.generateAudio(createdStoryId, null)}
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