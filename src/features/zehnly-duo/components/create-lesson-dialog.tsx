import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PlusCircle, BookOpen } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { contentApi } from '@/lib/content-api'

// Schema for lesson creation
const createLessonSchema = z.object({
  title: z.string().min(1, 'Lesson title is required'),
  lesson_type: z.enum(['word', 'story']),
  order: z.number().min(1, 'Order must be at least 1'),
  content: z.string().min(1, 'Content is required'),
})

type CreateLessonData = z.infer<typeof createLessonSchema>

interface CreateLessonDialogProps {
  chapterId: number
  children?: React.ReactNode
  onSuccess?: () => void
}

export function CreateLessonDialog({ chapterId, children, onSuccess }: CreateLessonDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<CreateLessonData>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: {
      title: '',
      lesson_type: 'word',
      order: 1,
      content: '',
    },
  })

  // Create lesson mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateLessonData) => 
      contentApi.lessons.create({
        ...data,
        chapter_id: chapterId,
      }),
    onSuccess: () => {
      toast.success('Lesson created successfully')
      queryClient.invalidateQueries({ queryKey: ['lessons', chapterId] })
      form.reset()
      setOpen(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to create lesson')
      console.error('Create lesson error:', error)
    },
  })

  const handleSubmit = (data: CreateLessonData) => {
    createMutation.mutate(data)
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
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5' />
            Create New Lesson
          </DialogTitle>
          <DialogDescription>
            Add a new lesson to this chapter with content and exercises.
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select lesson type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='word'>Word</SelectItem>
                          <SelectItem value='story'>Story</SelectItem>
                          <SelectItem value='test'>Test</SelectItem>
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
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
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