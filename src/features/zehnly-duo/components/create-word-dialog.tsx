import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PlusCircle, Type, Upload, Image, Zap } from 'lucide-react'
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
import { DirectAudioGenerationButton } from '@/components/direct-audio-generation-button'
import { SimpleUploadButton } from '@/components/simple-upload-button'

// Schema for word creation
const createWordSchema = z.object({
  word: z.string().min(1, 'Word is required'),
  translation: z.string().min(1, 'Translation is required'),
  example_sentence: z.string().min(1, 'Example sentence is required'),
})

type CreateWordData = z.infer<typeof createWordSchema>

interface CreateWordDialogProps {
  lessonId: number
  children?: React.ReactNode
  onSuccess?: () => void
}

export function CreateWordDialog({ lessonId, children, onSuccess }: CreateWordDialogProps) {
  const [open, setOpen] = useState(false)
  const [createdWordId, setCreatedWordId] = useState<number | null>(null)
  const [wordVoice, setWordVoice] = useState<string>('Betty')
  const [exampleVoice, setExampleVoice] = useState<string>('Betty')
  const queryClient = useQueryClient()

  const form = useForm<CreateWordData>({
    resolver: zodResolver(createWordSchema),
    defaultValues: {
      word: '',
      translation: '',
      example_sentence: '',
    },
  })

  // Create word mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateWordData) => 
      contentApi.words.create({
        ...data,
        lesson_id: lessonId,
        audio_url: null,
        image_url: null,
        example_audio: null,
      }),
    onSuccess: (createdWord) => {
      toast.success('Word created successfully')
      queryClient.invalidateQueries({ queryKey: ['words', lessonId] })
      setCreatedWordId(createdWord.id)
      form.reset()
      // Don't close dialog immediately, allow media upload
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to create word')
      console.error('Create word error:', error)
    },
  })

  const handleSubmit = (data: CreateWordData) => {
    createMutation.mutate(data)
  }

  const handleDialogClose = (open: boolean) => {
    setOpen(open)
    if (!open) {
      // Reset state when dialog closes
      setCreatedWordId(null)
      setWordVoice('Betty')
      setExampleVoice('Betty')
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <PlusCircle className='h-4 w-4' />
            Add Word
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Type className='h-5 w-5' />
            Create New Word
          </DialogTitle>
          <DialogDescription>
            Add a new vocabulary word with translation and example sentence.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <div className='grid gap-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='word'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Word *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder='e.g., hello' 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='translation'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Translation *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder='e.g., salom' 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='example_sentence'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Example Sentence *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='Hello, how are you?'
                        className='min-h-[80px]'
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {createdWordId && (
                <div className='grid gap-4'>
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium text-green-600'>✓ Word Created! Add Media (Optional)</h4>
                    
                    {/* Word Audio */}
                    <div className='space-y-2'>
                      <span className='text-sm font-medium'>Word Audio</span>
                      <div className='space-y-2'>
                        <Select value={wordVoice} onValueChange={setWordVoice}>
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
                            onGenerate={() => contentApi.words.generateAudio(createdWordId, wordVoice === 'default' ? null : wordVoice as any)}
                            queryKey={['words', lessonId]}
                          >
                            <Zap className='h-4 w-4 mr-2' />
                            Generate
                          </DirectAudioGenerationButton>
                        <SimpleUploadButton
                          accept='audio/mp3,audio/mpeg,audio/*'
                          onUpload={(file) => contentApi.words.uploadAudio(createdWordId, file)}
                          queryKey={['words', lessonId]}
                        >
                          <Upload className='h-4 w-4 mr-2' />
                          Upload Audio
                        </SimpleUploadButton>
                        </div>
                      </div>
                    </div>

                    {/* Word Image */}
                    <div className='space-y-2'>
                      <span className='text-sm font-medium'>Word Image</span>
                      <SimpleUploadButton
                        accept='image/jpeg,image/png,image/jpg,image/*'
                        onUpload={(file) => contentApi.words.uploadImage(createdWordId, file)}
                        queryKey={['words', lessonId]}
                      >
                        <Image className='h-4 w-4 mr-2' />
                        Upload Image
                      </SimpleUploadButton>
                    </div>

                    {/* Example Audio */}
                    <div className='space-y-2'>
                      <span className='text-sm font-medium'>Example Audio</span>
                      <div className='space-y-2'>
                        <Select value={exampleVoice} onValueChange={setExampleVoice}>
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
                            onGenerate={() => contentApi.words.generateExampleAudio(createdWordId, exampleVoice === 'default' ? null : exampleVoice as any)}
                            queryKey={['words', lessonId]}
                          >
                            <Zap className='h-4 w-4 mr-2' />
                            Generate
                          </DirectAudioGenerationButton>
                        <SimpleUploadButton
                          accept='audio/mp3,audio/mpeg,audio/*'
                          onUpload={(file) => contentApi.words.uploadExampleAudio(createdWordId, file)}
                          queryKey={['words', lessonId]}
                        >
                          <Upload className='h-4 w-4 mr-2' />
                          Upload Audio
                        </SimpleUploadButton>
                        </div>
                      </div>
                    </div>

                    <p className='text-xs text-muted-foreground'>
                      Media upload is optional. You can add or update media files later by editing the word.
                    </p>
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
                {createdWordId ? 'Done' : 'Cancel'}
              </Button>
              {!createdWordId && (
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
                    'Create Word'
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