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
import { Input } from '@/components/ui/input'
import { contentApi, type Chapter } from '@/lib/content-api'

// Schema for updating chapter
const updateChapterSchema = z.object({
  title: z.string().min(1, 'Chapter title is required'),
  order: z.number().min(1, 'Order must be at least 1'),
})

type UpdateChapterData = z.infer<typeof updateChapterSchema>

interface EditChapterDialogProps {
  chapter: Chapter | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditChapterDialog({ chapter, open, onOpenChange, onSuccess }: EditChapterDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<UpdateChapterData>({
    resolver: zodResolver(updateChapterSchema),
    defaultValues: {
      title: '',
      order: 1,
    },
  })

  // Update chapter mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateChapterData) => {
      if (!chapter) throw new Error('No chapter selected')
      return contentApi.chapters.update(chapter.id, data)
    },
    onSuccess: () => {
      toast.success('Chapter updated successfully')
      queryClient.invalidateQueries({ queryKey: ['chapters', chapter?.course_id] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to update chapter')
      console.error('Update chapter error:', error)
    },
  })

  // Reset form when chapter changes
  useEffect(() => {
    if (chapter) {
      form.reset({
        title: chapter.title,
        order: chapter.order,
      })
    }
  }, [chapter, form])

  const handleSubmit = (data: UpdateChapterData) => {
    updateMutation.mutate(data)
  }

  if (!chapter) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            Edit Chapter
          </DialogTitle>
          <DialogDescription>
            Update the chapter information and order.
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
                  'Update Chapter'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}