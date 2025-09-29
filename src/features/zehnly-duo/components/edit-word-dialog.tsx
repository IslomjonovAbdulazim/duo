import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Edit, Upload, Volume2, Image, Zap } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { contentApi, type Word, buildMediaUrl } from '@/lib/content-api'
import { DirectAudioGenerationButton } from '@/components/direct-audio-generation-button'
import { SimpleUploadButton } from '@/components/simple-upload-button'

// Schema for word update
const updateWordSchema = z.object({
  word: z.string().min(1, 'Word is required'),
  translation: z.string().min(1, 'Translation is required'),
  example_sentence: z.string().min(1, 'Example sentence is required'),
})

type UpdateWordData = z.infer<typeof updateWordSchema>

interface EditWordDialogProps {
  word: Word | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditWordDialog({ word, open, onOpenChange, onSuccess }: EditWordDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<UpdateWordData>({
    resolver: zodResolver(updateWordSchema),
    defaultValues: {
      word: '',
      translation: '',
      example_sentence: '',
    },
  })

  // Update word mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateWordData) => {
      if (!word) throw new Error('No word selected')
      return contentApi.words.update(word.id, data)
    },
    onSuccess: () => {
      toast.success('Word updated successfully')
      queryClient.invalidateQueries({ queryKey: ['words', word?.lesson_id] })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to update word')
      console.error('Update word error:', error)
    },
  })

  // Reset form when word changes
  useEffect(() => {
    if (word) {
      form.reset({
        word: word.word,
        translation: word.translation,
        example_sentence: word.example_sentence,
      })
    }
  }, [word, form])

  const handleSubmit = (data: UpdateWordData) => {
    updateMutation.mutate(data)
  }

  if (!word) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            Edit Word
          </DialogTitle>
          <DialogDescription>
            Update the word information, translation, and example sentence.
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

              <div className='grid gap-4'>
                <div className='space-y-4'>
                  <h4 className='text-sm font-medium text-muted-foreground'>Media Management</h4>
                  
                  {/* Word Audio */}
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Word Audio</span>
                      {word?.audio_url && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            const audio = new Audio(buildMediaUrl(word.audio_url)!)
                            audio.play().catch(console.error)
                          }}
                        >
                          <Volume2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                    <div className='flex gap-2'>
                      <DirectAudioGenerationButton
                        onGenerate={() => contentApi.words.generateAudio(word!.id, null)}
                        queryKey={['words', word?.lesson_id]}
                      >
                        <Zap className='h-4 w-4 mr-2' />
                        Generate
                      </DirectAudioGenerationButton>
                      <SimpleUploadButton
                        accept='audio/mp3,audio/mpeg,audio/*'
                        onUpload={(file) => contentApi.words.uploadAudio(word!.id, file)}
                        queryKey={['words', word?.lesson_id]}
                      >
                        <Upload className='h-4 w-4 mr-2' />
                        Upload Audio
                      </SimpleUploadButton>
                    </div>
                  </div>

                  {/* Word Image */}
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Word Image</span>
                      {word?.image_url && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => window.open(buildMediaUrl(word.image_url)!, '_blank')}
                        >
                          <Image className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                    <SimpleUploadButton
                      accept='image/jpeg,image/png,image/jpg,image/*'
                      onUpload={(file) => contentApi.words.uploadImage(word!.id, file)}
                      queryKey={['words', word?.lesson_id]}
                    >
                      <Image className='h-4 w-4 mr-2' />
                      {word?.image_url ? 'Replace Image' : 'Upload Image'}
                    </SimpleUploadButton>
                  </div>

                  {/* Example Audio */}
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Example Audio</span>
                      {word?.example_audio && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            const audio = new Audio(buildMediaUrl(word.example_audio)!)
                            audio.play().catch(console.error)
                          }}
                        >
                          <Volume2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                    <div className='flex gap-2'>
                      <DirectAudioGenerationButton
                        onGenerate={() => contentApi.words.generateExampleAudio(word!.id, null)}
                        queryKey={['words', word?.lesson_id]}
                      >
                        <Zap className='h-4 w-4 mr-2' />
                        Generate
                      </DirectAudioGenerationButton>
                      <SimpleUploadButton
                        accept='audio/mp3,audio/mpeg,audio/*'
                        onUpload={(file) => contentApi.words.uploadExampleAudio(word!.id, file)}
                        queryKey={['words', word?.lesson_id]}
                      >
                        <Upload className='h-4 w-4 mr-2' />
                        Upload Audio
                      </SimpleUploadButton>
                    </div>
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
                  'Update Word'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}