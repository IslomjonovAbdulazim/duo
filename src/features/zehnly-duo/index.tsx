import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, BookOpen, FileText, GraduationCap, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { contentApi, type Course, type Chapter, type Lesson, type Word, type Story } from '@/lib/content-api'
import { CreateCourseDialog } from '@/features/content-management/components/create-course-dialog'
import { EditCourseDialog } from '@/features/content-management/components/edit-course-dialog'
import { ClickableCoursesTable } from './components/clickable-courses-table'
import { CreateChapterDialog } from '@/features/content-management/components/create-chapter-dialog'
import { EditChapterDialog } from '@/features/content-management/components/edit-chapter-dialog'
import { ChaptersTable } from '@/features/content-management/components/chapters-table'
import { LessonsTable } from './components/lessons-table'
import { CreateLessonDialog } from './components/create-lesson-dialog'
import { EditLessonDialog } from './components/edit-lesson-dialog'
import { WordsTable } from './components/words-table'
import { CreateWordDialog } from './components/create-word-dialog'
import { EditWordDialog } from './components/edit-word-dialog'
import { StoriesTable } from './components/stories-table'
import { CreateStoryDialog } from './components/create-story-dialog'
import { EditStoryDialog } from './components/edit-story-dialog'

export function ZehnlyDuoPage() {
  // Helper function to get URL search params
  const getSearchParams = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return {
      courseId: urlParams.get('courseId') ? Number(urlParams.get('courseId')) : undefined,
      chapterId: urlParams.get('chapterId') ? Number(urlParams.get('chapterId')) : undefined,
      lessonId: urlParams.get('lessonId') ? Number(urlParams.get('lessonId')) : undefined,
      tab: urlParams.get('tab') || 'courses',
    }
  }

  // Helper function to update URL search params
  const updateSearchParams = (params: Record<string, string | number | undefined>) => {
    const urlParams = new URLSearchParams(window.location.search)
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        urlParams.delete(key)
      } else {
        urlParams.set(key, String(value))
      }
    })
    
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`
    window.history.pushState({}, '', newUrl)
  }
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [editCourseDialogOpen, setEditCourseDialogOpen] = useState(false)
  const [editChapterDialogOpen, setEditChapterDialogOpen] = useState(false)
  const [editLessonDialogOpen, setEditLessonDialogOpen] = useState(false)
  const [editWordDialogOpen, setEditWordDialogOpen] = useState(false)
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [editStoryDialogOpen, setEditStoryDialogOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'courses' | 'chapters' | 'lessons' | 'words' | 'story'>('courses')

  // Fetch courses
  const {
    data: courses = [],
    isLoading: coursesLoading,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: ['courses'],
    queryFn: () => contentApi.courses.list(),
  })

  // Fetch chapters for selected course
  const selectedCourseId = selectedCourse?.id
  const {
    data: chapters = [],
    isLoading: chaptersLoading,
    refetch: refetchChapters,
  } = useQuery({
    queryKey: ['chapters', selectedCourseId],
    queryFn: () => contentApi.chapters.listByCourse(selectedCourseId!),
    enabled: !!selectedCourseId,
  })

  // Fetch lessons for selected chapter
  const selectedChapterId = selectedChapter?.id
  const {
    data: lessons = [],
    isLoading: lessonsLoading,
    refetch: refetchLessons,
  } = useQuery({
    queryKey: ['lessons', selectedChapterId],
    queryFn: () => contentApi.lessons.listByChapter(selectedChapterId!),
    enabled: !!selectedChapterId,
  })

  // Fetch words for selected lesson
  const selectedLessonId = selectedLesson?.id
  const {
    data: words = [],
    isLoading: wordsLoading,
    refetch: refetchWords,
  } = useQuery({
    queryKey: ['words', selectedLessonId],
    queryFn: () => contentApi.words.listByLesson(selectedLessonId!),
    enabled: !!selectedLessonId,
  })

  // Fetch stories for selected lesson
  const {
    data: stories = [],
    isLoading: storiesLoading,
    refetch: refetchStories,
  } = useQuery({
    queryKey: ['stories', selectedLessonId],
    queryFn: () => contentApi.stories.listByLesson(selectedLessonId!),
    enabled: !!selectedLessonId,
  })

  // Initialize state from URL parameters on page load
  useEffect(() => {
    const params = getSearchParams()
    setActiveTab(params.tab as 'courses' | 'chapters' | 'lessons' | 'words' | 'story')
  }, [])

  // Restore course state from URL parameters
  useEffect(() => {
    const params = getSearchParams()
    if (courses.length > 0 && params.courseId) {
      const course = courses.find(c => c.id === params.courseId)
      if (course) {
        setSelectedCourse(course)
      }
    }
  }, [courses])

  // Restore chapter state from URL parameters
  useEffect(() => {
    const params = getSearchParams()
    if (chapters.length > 0 && params.chapterId) {
      const chapter = chapters.find(c => c.id === params.chapterId)
      if (chapter) {
        setSelectedChapter(chapter)
      }
    }
  }, [chapters])

  // Restore lesson state from URL parameters
  useEffect(() => {
    const params = getSearchParams()
    if (lessons.length > 0 && params.lessonId) {
      const lesson = lessons.find(l => l.id === params.lessonId)
      if (lesson) {
        setSelectedLesson(lesson)
      }
    }
  }, [lessons])

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course)
    setEditCourseDialogOpen(true)
  }

  const handleEditChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setEditChapterDialogOpen(true)
  }

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setEditLessonDialogOpen(true)
  }

  const handleEditWord = (word: Word) => {
    setSelectedWord(word)
    setEditWordDialogOpen(true)
  }

  const handleEditStory = (story: Story) => {
    setSelectedStory(story)
    setEditStoryDialogOpen(true)
  }

  const handleLessonClick = (lesson: Lesson) => {
    // Test lessons should not be clickable for navigation
    if (lesson.lesson_type === 'test') {
      return
    }
    
    setSelectedLesson(lesson)
    const newTab = lesson.lesson_type === 'word' ? 'words' : lesson.lesson_type === 'story' ? 'story' : 'words'
    setActiveTab(newTab)
    updateSearchParams({
      lessonId: lesson.id,
      tab: newTab
    })
  }

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course)
    setActiveTab('chapters')
    updateSearchParams({
      courseId: course.id,
      chapterId: undefined,
      lessonId: undefined,
      tab: 'chapters'
    })
  }

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setActiveTab('lessons')
    updateSearchParams({
      chapterId: chapter.id,
      lessonId: undefined,
      tab: 'lessons'
    })
  }

  const handleRefreshCourses = () => {
    refetchCourses()
  }

  const handleRefreshChapters = () => {
    refetchChapters()
  }

  const handleRefreshLessons = () => {
    refetchLessons()
  }

  const handleRefreshWords = () => {
    refetchWords()
  }

  const handleRefreshStories = () => {
    refetchStories()
  }

  // Filter data based on search
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.native_language.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.learning_language.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredChapters = chapters.filter((chapter) =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredWords = words.filter((word) =>
    word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.example_sentence.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredStories = stories.filter((story) =>
    story.story_text.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
              Zehnly Duo Management
            </h1>
            <p className='text-muted-foreground text-lg'>
              Complete language learning content management system
            </p>
          </div>
        </div>

        {/* Search */}
        <div className='mb-6'>
          <Input
            placeholder='Search across all content...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='max-w-sm'
          />
        </div>

        {/* Tabs for different content types */}
        <Tabs value={activeTab} onValueChange={(newTab) => {
          setActiveTab(newTab as 'courses' | 'chapters' | 'lessons' | 'words' | 'story')
          updateSearchParams({
            tab: newTab
          })
        }} className='space-y-6'>
          <TabsList className='grid w-full grid-cols-5'>
            <TabsTrigger value='courses' className='flex items-center gap-2'>
              <GraduationCap className='h-4 w-4' />
              Courses ({filteredCourses.length})
            </TabsTrigger>
            <TabsTrigger value='chapters' className='flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Chapters ({filteredChapters.length})
            </TabsTrigger>
            <TabsTrigger value='lessons' className='flex items-center gap-2'>
              <BookOpen className='h-4 w-4' />
              Lessons ({filteredLessons.length})
            </TabsTrigger>
            <TabsTrigger value='words' className='flex items-center gap-2'>
              <Type className='h-4 w-4' />
              Words ({filteredWords.length})
            </TabsTrigger>
            <TabsTrigger value='story' className='flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Story Content
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value='courses' className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-2xl font-semibold'>Courses</h2>
              <CreateCourseDialog onSuccess={handleRefreshCourses}>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Course
                </Button>
              </CreateCourseDialog>
            </div>
            <ClickableCoursesTable
              data={filteredCourses}
              isLoading={coursesLoading}
              onEdit={handleEditCourse}
              onCourseClick={handleCourseClick}
              onRefresh={handleRefreshCourses}
              selectedCourse={selectedCourse}
            />
          </TabsContent>

          {/* Chapters Tab */}
          <TabsContent value='chapters' className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-semibold'>Chapters</h2>
                {selectedCourse && (
                  <p className='text-muted-foreground'>
                    {selectedCourse.title} • {selectedCourse.native_language} → {selectedCourse.learning_language}
                  </p>
                )}
              </div>
              {selectedCourse && (
                <CreateChapterDialog 
                  courseId={selectedCourse.id} 
                  onSuccess={handleRefreshChapters}
                >
                  <Button>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Chapter
                  </Button>
                </CreateChapterDialog>
              )}
            </div>
            {selectedCourse ? (
              <ChaptersTable
                data={filteredChapters}
                isLoading={chaptersLoading}
                onEdit={handleEditChapter}
                onChapterClick={handleChapterClick}
                onRefresh={handleRefreshChapters}
                selectedChapter={selectedChapter}
              />
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                Select a course from the Courses tab to view its chapters
              </div>
            )}
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value='lessons' className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-semibold'>Lessons</h2>
                {selectedChapter && (
                  <p className='text-muted-foreground'>
                    {selectedChapter.title} • Order {selectedChapter.order}
                  </p>
                )}
              </div>
              {selectedChapter && (
                <CreateLessonDialog 
                  chapterId={selectedChapter.id} 
                  onSuccess={handleRefreshLessons}
                >
                  <Button>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Lesson
                  </Button>
                </CreateLessonDialog>
              )}
            </div>
            {selectedChapter ? (
              <LessonsTable
                data={filteredLessons}
                isLoading={lessonsLoading}
                onEdit={handleEditLesson}
                onLessonClick={handleLessonClick}
                onRefresh={handleRefreshLessons}
                selectedLesson={selectedLesson}
              />
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                Select a chapter from the Chapters tab to view its lessons
              </div>
            )}
          </TabsContent>

          {/* Words Tab */}
          <TabsContent value='words' className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-semibold'>Words</h2>
                {selectedLesson && (
                  <p className='text-muted-foreground'>
                    {selectedLesson.title} • {selectedLesson.lesson_type} lesson • Order {selectedLesson.order}
                  </p>
                )}
              </div>
              {selectedLesson && (
                <CreateWordDialog 
                  lessonId={selectedLesson.id} 
                  onSuccess={handleRefreshWords}
                >
                  <Button>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Word
                  </Button>
                </CreateWordDialog>
              )}
            </div>
            {selectedLesson ? (
              <WordsTable
                data={filteredWords}
                isLoading={wordsLoading}
                onEdit={handleEditWord}
                onRefresh={handleRefreshWords}
              />
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                Select a lesson from the Lessons tab to view its vocabulary words
              </div>
            )}
          </TabsContent>

          {/* Story Content Tab */}
          <TabsContent value='story' className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-semibold'>Story Management</h2>
                {selectedLesson && (
                  <p className='text-muted-foreground'>
                    {selectedLesson.title} • Story lesson • Order {selectedLesson.order}
                  </p>
                )}
              </div>
              {selectedLesson && selectedLesson.lesson_type === 'story' && (
                <CreateStoryDialog 
                  lessonId={selectedLesson.id} 
                  onSuccess={handleRefreshStories}
                >
                  <Button>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Story
                  </Button>
                </CreateStoryDialog>
              )}
            </div>
            {selectedLesson && selectedLesson.lesson_type === 'story' ? (
              <StoriesTable
                data={filteredStories}
                isLoading={storiesLoading}
                onEdit={handleEditStory}
                onRefresh={handleRefreshStories}
              />
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                Select a story lesson from the Lessons tab to manage its stories
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Main>

      {/* Edit Dialogs */}
      <EditCourseDialog
        course={selectedCourse}
        open={editCourseDialogOpen}
        onOpenChange={setEditCourseDialogOpen}
        onSuccess={handleRefreshCourses}
      />

      <EditChapterDialog
        chapter={selectedChapter}
        open={editChapterDialogOpen}
        onOpenChange={setEditChapterDialogOpen}
        onSuccess={handleRefreshChapters}
      />

      <EditLessonDialog
        lesson={selectedLesson}
        open={editLessonDialogOpen}
        onOpenChange={setEditLessonDialogOpen}
        onSuccess={handleRefreshLessons}
      />

      <EditWordDialog
        word={selectedWord}
        open={editWordDialogOpen}
        onOpenChange={setEditWordDialogOpen}
        onSuccess={handleRefreshWords}
      />

      <EditStoryDialog
        story={selectedStory}
        open={editStoryDialogOpen}
        onOpenChange={setEditStoryDialogOpen}
        onSuccess={handleRefreshStories}
      />
    </>
  )
}

const topNav = [
  {
    title: 'Zehnly Duo',
    href: '/zehnly-duo',
    isActive: true,
    disabled: false,
  },
]