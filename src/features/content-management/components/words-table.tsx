import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Type,
  Volume2,
  Image,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { contentApi, type Word } from '@/lib/content-api'
import { buildMediaUrl } from '@/lib/content-api'

interface WordsTableProps {
  data: Word[]
  isLoading?: boolean
  onEdit: (word: Word) => void
  onRefresh: () => void
  lessonName?: string
  onPreviewImage?: (word: Word) => void
}

export function WordsTable({
  data,
  isLoading,
  onEdit,
  onRefresh,
  lessonName,
  onPreviewImage,
}: WordsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const queryClient = useQueryClient()

  // Delete word mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => contentApi.words.delete(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['words'] })
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      onRefresh()
      setDeleteDialogOpen(false)
      setSelectedWord(null)
    },
    onError: (error) => {
      toast.error('Failed to delete word')
      console.error('Delete error:', error)
    },
  })

  const handleDelete = (word: Word) => {
    setSelectedWord(word)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedWord) {
      deleteMutation.mutate(selectedWord.id)
    }
  }


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Words</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Words</CardTitle>
          <CardDescription>
            {lessonName ? `No words found in "${lessonName}"` : 'No words found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8'>
            <Type className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-muted-foreground text-center'>
              {lessonName 
                ? `No vocabulary words have been created for "${lessonName}" yet.`
                : 'No vocabulary words have been created yet.'
              }
              <br />
              Click "Add Word" to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className='border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/95'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-xl font-semibold flex items-center gap-2'>
                <Type className='h-5 w-5 text-primary' />
                Words ({data.length})
                {lessonName && (
                  <Badge variant='outline' className='ml-2'>
                    {lessonName}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className='mt-1'>
                {lessonName 
                  ? `Manage vocabulary for "${lessonName}" lesson`
                  : 'Manage vocabulary words and their content'
                }
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='text-sm text-muted-foreground'>Total Words</div>
              <div className='text-2xl font-bold text-primary'>
                {data.length}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Word</TableHead>
                <TableHead>Translation</TableHead>
                <TableHead>Example</TableHead>
                <TableHead>Media</TableHead>
                <TableHead className='w-[70px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((word) => (
                <TableRow key={word.id}>
                    <TableCell className='max-w-[200px]'>
                      <div className='space-y-1'>
                        <div className='font-medium truncate' title={word.word}>
                          {word.word}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          ID: #{word.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='max-w-[200px]'>
                      <div className='font-medium text-green-600 truncate' title={word.translation}>
                        {word.translation}
                      </div>
                    </TableCell>
                    <TableCell className='max-w-[300px]'>
                      <div className='space-y-1'>
                        <p className='text-sm text-muted-foreground truncate' title={word.example_sentence}>
                          {word.example_sentence}
                        </p>
                        {word.example_audio && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 px-2 text-xs'
                            onClick={() => {
                              const fullUrl = buildMediaUrl(word.example_audio!)
                              if (fullUrl) {
                                const audio = new Audio(fullUrl)
                                audio.play().catch((error) => {
                                  console.error('Error playing audio:', error)
                                  toast.error('Failed to play audio')
                                })
                              }
                            }}
                          >
                            <Volume2 className='h-3 w-3 mr-1' />
                            Play Example
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {word.audio_url && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                            onClick={() => {
                              const fullUrl = buildMediaUrl(word.audio_url!)
                              if (fullUrl) {
                                const audio = new Audio(fullUrl)
                                audio.play().catch((error) => {
                                  console.error('Error playing audio:', error)
                                  toast.error('Failed to play audio')
                                })
                              }
                            }}
                            title='Play audio'
                          >
                            <Volume2 className='h-4 w-4 text-blue-600' />
                          </Button>
                        )}
                        {word.image_url && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                            onClick={() => {
                              if (onPreviewImage) {
                                onPreviewImage(word)
                              } else {
                                window.open(buildMediaUrl(word.image_url!)!, '_blank')
                              }
                            }}
                            title='View image'
                          >
                            <Image className='h-4 w-4 text-green-600' />
                          </Button>
                        )}
                        {!word.audio_url && !word.image_url && (
                          <Badge variant='outline' className='text-xs'>
                            No media
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>Open menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEdit(word)}>
                            <Edit className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(word)}
                            className='text-red-600'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='Delete Word'
        desc={`Are you sure you want to delete "${selectedWord?.word}"? This action cannot be undone.`}
        confirmText='Delete'
        handleConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}