import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { ArrowLeft, Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { contentApi, type Chapter } from '@/lib/content-api'
import { CreateChapterDialog } from './components/create-chapter-dialog'
import { EditChapterDialog } from './components/edit-chapter-dialog'
import { ChaptersTable } from './components/chapters-table'

export function ChaptersPage() {
  const navigate = useNavigate()
  const { courseId } = useSearch({ from: '/_authenticated/content/chapters' }) as { courseId?: number }
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Redirect to courses page if no courseId is provided
  useEffect(() => {
    if (!courseId) {
      navigate({ to: '/content/courses' })
    }
  }, [courseId, navigate])

  // Fetch course details
  const {
    data: course,
    isLoading: courseLoading,
  } = useQuery({
    queryKey: ['courses', courseId],
    queryFn: () => contentApi.courses.get(courseId!),
    enabled: !!courseId,
  })

  // Fetch chapters
  const {
    data: chapters = [],
    isLoading: chaptersLoading,
    refetch: refetchChapters,
  } = useQuery({
    queryKey: ['chapters', courseId],
    queryFn: () => contentApi.chapters.listByCourse(courseId!),
    enabled: !!courseId,
  })

  // Filter chapters based on search
  const filteredChapters = chapters.filter((chapter) =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setEditDialogOpen(true)
  }

  const handleRefresh = () => {
    refetchChapters()
  }

  const handleBackToCourses = () => {
    navigate({ to: '/content/courses' })
  }

  // Show loading or redirect if no courseId
  if (!courseId) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-1'>
            <div className='flex items-center gap-3'>
              <Button 
                variant='ghost' 
                size='sm' 
                onClick={handleBackToCourses}
                className='px-2'
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <div>
                <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
                  Chapter Management
                </h1>
                {course && (
                  <p className='text-muted-foreground text-lg'>
                    {course.title} • {course.native_language} → {course.learning_language}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className='flex items-center space-x-3'>
            <CreateChapterDialog 
              courseId={courseId} 
              onSuccess={handleRefresh}
            >
              <Button 
                size='lg'
                className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200'
              >
                <Plus className='mr-2 h-5 w-5' />
                Add Chapter
              </Button>
            </CreateChapterDialog>
          </div>
        </div>

        {/* Filters */}
        <div className='flex flex-col gap-3 md:flex-row md:items-center mb-6'>
          <div className='flex-1'>
            <Input
              placeholder='Search chapters...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full'
            />
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm'>
              <Download className='h-4 w-4' />
              Export
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        {searchQuery && (
          <div className='flex items-center gap-2 text-sm text-muted-foreground mb-6'>
            <span>Showing {filteredChapters.length} of {chapters.length} chapters</span>
            <Badge variant='secondary'>
              Search: "{searchQuery}"
            </Badge>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSearchQuery('')}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Chapters Table */}
        <ChaptersTable
          data={filteredChapters}
          isLoading={chaptersLoading || courseLoading}
          onEdit={handleEdit}
          onRefresh={handleRefresh}
        />
      </Main>

      {/* Edit Dialog */}
      <EditChapterDialog
        chapter={selectedChapter}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleRefresh}
      />
    </>
  )
}

const topNav = [
  {
    title: 'Courses',
    href: '/content/courses',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Chapters',
    href: '/content/chapters',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Lessons',
    href: '/content/lessons',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Words',
    href: '/content/words',
    isActive: false,
    disabled: false,
  },
]