import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PlusCircle, BookOpen } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { contentApi } from '@/lib/content-api'
import { z } from 'zod'

// Schema for the new course structure
const createCourseSchema = z.object({
  title: z.string().min(1, 'Course title is required'),
  native_language: z.string().min(1, 'Native language is required'),
  learning_language: z.string().min(1, 'Learning language is required'),
})

type CreateCourseData = z.infer<typeof createCourseSchema>

// Language options
const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi',
  'Uzbek', 'Turkish', 'Persian', 'Urdu'
]

interface CreateCourseDialogProps {
  children?: React.ReactNode
  onSuccess?: () => void
}

export function CreateCourseDialog({ children, onSuccess }: CreateCourseDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<CreateCourseData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: '',
      native_language: '',
      learning_language: '',
    },
  })

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCourseData) => contentApi.courses.create(data),
    onSuccess: () => {
      toast.success('Course created successfully')
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      form.reset()
      setOpen(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to create course')
      console.error('Create course error:', error)
    },
  })

  const handleSubmit = (data: CreateCourseData) => {
    createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <PlusCircle className='h-4 w-4' />
            Add Course
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5' />
            Create New Course
          </DialogTitle>
          <DialogDescription>
            Create a new language learning course with native and target languages.
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
                    <FormLabel>Course Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='e.g., English for Beginners' 
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
                  name='native_language'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Native Language *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select native language' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LANGUAGES.map((language) => (
                            <SelectItem key={language} value={language}>
                              {language}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='learning_language'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Language *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select target language' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LANGUAGES.map((language) => (
                            <SelectItem key={language} value={language}>
                              {language}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                  'Create Course'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}