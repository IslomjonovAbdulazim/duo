import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
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
  DropdownMenuSeparator,
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
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { contentApi, type Chapter } from '@/lib/content-api'

interface ChaptersTableProps {
  data: Chapter[]
  isLoading?: boolean
  onEdit: (chapter: Chapter) => void
  onChapterClick?: (chapter: Chapter) => void
  onRefresh: () => void
  selectedChapter?: Chapter | null
}

export function ChaptersTable({
  data,
  isLoading,
  onEdit,
  onChapterClick,
  onRefresh,
  selectedChapter,
}: ChaptersTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null)
  const queryClient = useQueryClient()

  // Delete chapter mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => contentApi.chapters.delete(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['chapters'] })
      onRefresh()
      setDeleteDialogOpen(false)
      setChapterToDelete(null)
    },
    onError: (error) => {
      toast.error('Failed to delete chapter')
      console.error('Delete error:', error)
    },
  })

  const handleDelete = (chapter: Chapter, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setChapterToDelete(chapter)
    setDeleteDialogOpen(true)
  }

  const handleEdit = (chapter: Chapter, e?: React.MouseEvent) => {
    e?.stopPropagation()
    onEdit(chapter)
  }

  const confirmDelete = () => {
    if (chapterToDelete) {
      deleteMutation.mutate(chapterToDelete.id)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chapters</CardTitle>
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
          <CardTitle>Chapters</CardTitle>
          <CardDescription>No chapters found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8'>
            <FileText className='h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-muted-foreground text-center'>
              No chapters have been created yet.
              <br />
              Click "Add Chapter" to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort chapters by order
  const sortedChapters = [...data].sort((a, b) => a.order - b.order)

  return (
    <>
      <Card className='border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/95'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-xl font-semibold flex items-center gap-2'>
                <FileText className='h-5 w-5 text-primary' />
                Chapters ({sortedChapters.length})
              </CardTitle>
              <CardDescription className='mt-1'>
                {onChapterClick ? 'Click on a chapter to view its lessons' : 'Manage course chapters and their organization'}
              </CardDescription>
            </div>
            <div className='text-right'>
              <div className='text-sm text-muted-foreground'>Total Chapters</div>
              <div className='text-2xl font-bold text-primary'>
                {sortedChapters.length}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Chapter Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='w-[70px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedChapters.map((chapter) => (
                <TableRow 
                  key={chapter.id}
                  className={`${onChapterClick ? 'cursor-pointer hover:bg-muted/50' : ''} ${
                    selectedChapter?.id === chapter.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => onChapterClick?.(chapter)}
                >
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='w-8 h-8 rounded-full flex items-center justify-center p-0'>
                        {chapter.order}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className='max-w-[350px]'>
                    <div className='space-y-1'>
                      <div className='font-medium truncate' title={chapter.title}>
                        {chapter.title}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        ID: #{chapter.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant='default' className='bg-green-100 text-green-800 hover:bg-green-100'>
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant='ghost' 
                          className='h-8 w-8 p-0'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className='sr-only'>Open menu</span>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => handleEdit(chapter, e)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(chapter, e)}
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
        title='Delete Chapter'
        desc={`Are you sure you want to delete "${chapterToDelete?.title}"? This action cannot be undone.`}
        confirmText='Delete'
        handleConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}