import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Edit } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { contentApi, type Lesson } from '@/lib/content-api'

// Schema for updating lesson
const updateLessonSchema = z.object({
  title: z.string().min(1, 'Lesson title is required'),
  lesson_type: z.enum(['word', 'story']),
  order: z.number().min(1, 'Order must be at least 1'),
  content: z.string().min(1, 'Content is required'),
})

type UpdateLessonData = z.infer<typeof updateLessonSchema>

interface EditLessonDialogProps {
  lesson: Lesson | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditLessonDialog({ lesson, open, onOpenChange, onSuccess }: EditLessonDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<UpdateLessonData>({
    resolver: zodResolver(updateLessonSchema),
    defaultValues: {
      title: '',
      lesson_type: 'word',
      order: 1,
      content: '',
    },
  })

  // Update lesson mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateLessonData) => {
      if (!lesson) throw new Error('No lesson selected')
      return contentApi.lessons.update(lesson.id, data)
    },
    onSuccess: () => {
      toast.success('Lesson updated successfully')
      queryClient.invalidateQueries({ queryKey: ['lessons', lesson?.chapter_id] })
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
        lesson_type: lesson.lesson_type,
        order: lesson.order,
        content: lesson.content,
      })
    }
  }, [lesson, form])

  const handleSubmit = (data: UpdateLessonData) => {
    updateMutation.mutate(data)
  }

  if (!lesson) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            Edit Lesson
          </DialogTitle>
          <DialogDescription>
            Update the lesson information, type, and content.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <div className='grid gap-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='e.g., Hello and Goodbye' 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='lesson_type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select lesson type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='word'>Word</SelectItem>
                          <SelectItem value='story'>Story</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='In this lesson we learn basic greetings...'
                        className='min-h-[120px]'
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