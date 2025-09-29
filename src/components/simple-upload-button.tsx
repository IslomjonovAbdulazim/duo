import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SimpleUploadButtonProps {
  onUpload: (file: File) => Promise<any>
  accept: string
  children?: React.ReactNode
  queryKey?: any[]
  disabled?: boolean
}

export function SimpleUploadButton({
  onUpload,
  accept,
  children,
  queryKey,
  disabled = false,
}: SimpleUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log('Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type)
      try {
        const result = await onUpload(file)
        console.log('Upload successful:', result)
        return result
      } catch (error) {
        console.error('Upload failed:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('Upload success handler:', data)
      toast.success(data.message || 'File uploaded successfully')
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey })
      }
    },
    onError: (error: any) => {
      console.error('Upload error handler:', error)
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to upload file'
      toast.error(errorMessage)
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      
      uploadMutation.mutate(file)
    }
    // Reset input value so same file can be selected again
    e.target.value = ''
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={handleClick}
        disabled={disabled || uploadMutation.isPending}
        className='flex items-center gap-2'
      >
        {uploadMutation.isPending ? (
          <>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current'></div>
            Uploading...
          </>
        ) : (
          children || (
            <>
              <Upload className='h-4 w-4' />
              Upload
            </>
          )
        )}
      </Button>
      
      <input
        ref={fileInputRef}
        type='file'
        accept={accept}
        onChange={handleFileSelect}
        className='hidden'
      />
    </>
  )
}