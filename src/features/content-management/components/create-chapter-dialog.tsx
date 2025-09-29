import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PlusCircle, FileText } from 'lucide-react'
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
import { contentApi } from '@/lib/content-api'

// Schema for chapter creation
const createChapterSchema = z.object({
  title: z.string().min(1, 'Chapter title is required'),
  order: z.number().min(1, 'Order must be at least 1'),
})

type CreateChapterData = z.infer<typeof createChapterSchema>

interface CreateChapterDialogProps {
  courseId: number
  children?: React.ReactNode
  onSuccess?: () => void
}

export function CreateChapterDialog({ courseId, children, onSuccess }: CreateChapterDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<CreateChapterData>({
    resolver: zodResolver(createChapterSchema),
    defaultValues: {
      title: '',
      order: 1,
    },
  })

  // Create chapter mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateChapterData) => 
      contentApi.chapters.create({
        ...data,
        course_id: courseId,
      }),
    onSuccess: () => {
      toast.success('Chapter created successfully')
      queryClient.invalidateQueries({ queryKey: ['chapters', courseId] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      form.reset()
      setOpen(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to create chapter')
      console.error('Create chapter error:', error)
    },
  })

  const handleSubmit = (data: CreateChapterData) => {
    createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <PlusCircle className='h-4 w-4' />
            Add Chapter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Create New Chapter
          </DialogTitle>
          <DialogDescription>
            Add a new chapter to organize course content.
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
                    <FormLabel>Chapter Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='e.g., Basic Greetings' 
                        {...field} 
                      />
                    </FormControl>
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
                  'Create Chapter'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}