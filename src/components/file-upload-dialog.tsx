import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Upload, FileImage, FileAudio, X } from 'lucide-react'
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

interface FileUploadDialogProps {
  title: string
  description: string
  accept: string
  maxSize?: number // in MB
  onUpload: (file: File) => Promise<any>
  children?: React.ReactNode
  queryKey?: any[]
}

export function FileUploadDialog({
  title,
  description,
  accept,
  maxSize = 10,
  onUpload,
  children,
  queryKey,
}: FileUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!selectedFile) throw new Error('No file selected')
      return onUpload(selectedFile)
    },
    onSuccess: (data) => {
      toast.success(data.message)
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey })
      }
      setSelectedFile(null)
      setOpen(false)
    },
    onError: (error) => {
      toast.error('Failed to upload file')
      console.error('File upload error:', error)
    },
  })

  const handleFileSelect = (file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`)
      return
    }

    setSelectedFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = () => {
    uploadMutation.mutate()
  }

  const getFileIcon = () => {
    if (accept.includes('image')) return <FileImage className='h-8 w-8' />
    if (accept.includes('audio')) return <FileAudio className='h-8 w-8' />
    return <Upload className='h-8 w-8' />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant='outline' size='sm'>
            <Upload className='h-4 w-4 mr-2' />
            Upload File
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className='grid gap-4 py-4'>
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {selectedFile ? (
              <div className='space-y-3'>
                <div className='flex items-center justify-center text-green-600'>
                  {getFileIcon()}
                </div>
                <div className='space-y-1'>
                  <p className='font-medium'>{selectedFile.name}</p>
                  <p className='text-sm text-muted-foreground'>
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setSelectedFile(null)}
                >
                  <X className='h-4 w-4 mr-2' />
                  Remove
                </Button>
              </div>
            ) : (
              <div className='space-y-3'>
                <div className='flex items-center justify-center text-muted-foreground'>
                  {getFileIcon()}
                </div>
                <div className='space-y-1'>
                  <p className='font-medium'>Drop your file here</p>
                  <p className='text-sm text-muted-foreground'>
                    or click to browse (max {maxSize}MB)
                  </p>
                </div>
                <Button
                  variant='outline'
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type='file'
            accept={accept}
            onChange={handleFileInputChange}
            className='hidden'
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
            type='button'
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className='min-w-[120px]'
          >
            {uploadMutation.isPending ? (
              <div className='flex items-center gap-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                Uploading...
              </div>
            ) : (
              <>
                <Upload className='h-4 w-4 mr-2' />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}