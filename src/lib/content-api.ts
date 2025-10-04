import api from './api'

// Types for Content Management API
export interface Course {
  id: number
  title: string
  native_language: string
  learning_language: string
  logo_url: string | null
  // Legacy fields for backward compatibility (will be removed when lessons/words are updated)
  learning_center_id?: number
  is_active?: boolean
  lessons_count?: number
  description?: string
  created_at?: string
  updated_at?: string
}

export interface Chapter {
  id: number
  title: string
  course_id: number
  order: number
}

export interface Lesson {
  id: number
  title: string
  content: string
  chapter_id: number
  order: number
  lesson_type: 'word' | 'story' | 'test'
  word_lesson_id?: number
}

export interface Word {
  id: number
  lesson_id: number
  word: string
  translation: string
  example_sentence: string
  audio_url: string | null
  image_url: string | null
  example_audio: string | null
}

export interface Story {
  id: number
  lesson_id: number
  story_text: string
  audio_url: string | null
  word_lesson_id?: number
}

// Request types
export interface CreateCourseRequest {
  title: string
  native_language: string
  learning_language: string
}

export interface UpdateCourseRequest {
  title?: string
  native_language?: string
  learning_language?: string
}

export interface CreateChapterRequest {
  title: string
  course_id: number
  order: number
}

export interface UpdateChapterRequest {
  title?: string
  course_id?: number
  order?: number
}

export interface CreateLessonRequest {
  title: string
  chapter_id: number
  order: number
  lesson_type: 'word' | 'story' | 'test'
  content: string
  word_lesson_id?: number
}

export interface UpdateLessonRequest {
  title?: string
  chapter_id?: number
  order?: number
  lesson_type?: 'word' | 'story' | 'test'
  content?: string
  word_lesson_id?: number
}

export interface CreateWordRequest {
  lesson_id: number
  word: string
  translation: string
  example_sentence: string
  audio_url?: string | null
  image_url?: string | null
  example_audio?: string | null
}

export interface UpdateWordRequest {
  lesson_id?: number
  word?: string
  translation?: string
  example_sentence?: string
  audio_url?: string | null
  image_url?: string | null
  example_audio?: string | null
}

export interface CreateStoryRequest {
  lesson_id: number
  story_text: string
  audio_url?: string | null
  word_lesson_id?: number
}

export interface UpdateStoryRequest {
  lesson_id?: number
  story_text?: string
  audio_url?: string | null
  word_lesson_id?: number
}

// Query params (simplified for new API)
export interface ListCoursesParams {
  skip?: number
  limit?: number
}

export interface ListLessonsParams {
  chapter_id?: number
  skip?: number
  limit?: number
}

export interface ListWordsParams {
  lesson_id?: number
  skip?: number
  limit?: number
}

export interface ListStoriesParams {
  lesson_id?: number
  skip?: number
  limit?: number
}

// Response types
export interface DeleteResponse {
  message: string
}

export interface UploadResponse {
  message: string
  path: string
  url: string
}

export interface AudioGenerationResponse {
  message: string
  audio_url: string
}

export interface FileUploadResponse {
  message: string
  audio_url?: string
  image_url?: string
  logo_url?: string
}

// Voice options for audio generation
export type VoiceOption = 'amy' | 'brian' | 'emma' | 'russell' | 'sally' | 'Betty'

// Base URL for media assets (from environment or default)
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || 'https://zehnlyduo-production.up.railway.app'

// Utility function to build full media URLs
export const buildMediaUrl = (relativePath: string | null): string | null => {
  if (!relativePath) return null
  if (relativePath.startsWith('http')) return relativePath // Already a full URL
  return `${MEDIA_BASE_URL}/${relativePath.replace(/^\//, '')}`
}

// Content Management API functions
export const contentApi = {
  // Course Management
  courses: {
    list: async (params?: ListCoursesParams): Promise<Course[]> => {
      const searchParams = new URLSearchParams()
      if (params?.skip !== undefined) 
        searchParams.set('skip', params.skip.toString())
      if (params?.limit !== undefined) 
        searchParams.set('limit', params.limit.toString())
      
      const queryString = searchParams.toString()
      const response = await api.get<Course[]>(
        `/admin/courses${queryString ? `?${queryString}` : ''}`
      )
      return response.data
    },

    get: async (id: number): Promise<Course> => {
      const response = await api.get<Course>(`/admin/courses/${id}`)
      return response.data
    },

    create: async (data: CreateCourseRequest): Promise<Course> => {
      const response = await api.post<Course>('/admin/courses', data)
      return response.data
    },

    update: async (id: number, data: UpdateCourseRequest): Promise<Course> => {
      const response = await api.put<Course>(`/admin/courses/${id}`, data)
      return response.data
    },

    delete: async (id: number): Promise<DeleteResponse> => {
      const response = await api.delete<DeleteResponse>(`/admin/courses/${id}`)
      return response.data
    },

    // Logo upload
    uploadLogo: async (id: number, file: File): Promise<FileUploadResponse> => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post<FileUploadResponse>(
        `/admin/upload/logo/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    },
  },

  // Chapter Management
  chapters: {
    listByCourse: async (courseId: number): Promise<Chapter[]> => {
      const response = await api.get<Chapter[]>(`/admin/courses/${courseId}/chapters`)
      return response.data
    },

    create: async (data: CreateChapterRequest): Promise<Chapter> => {
      const response = await api.post<Chapter>('/admin/chapters', data)
      return response.data
    },

    update: async (id: number, data: UpdateChapterRequest): Promise<Chapter> => {
      const response = await api.put<Chapter>(`/admin/chapters/${id}`, data)
      return response.data
    },

    delete: async (id: number): Promise<DeleteResponse> => {
      const response = await api.delete<DeleteResponse>(`/admin/chapters/${id}`)
      return response.data
    },
  },

  // Lesson Management
  lessons: {
    // New chapter-based API
    listByChapter: async (chapterId: number): Promise<Lesson[]> => {
      const response = await api.get<Lesson[]>(`/admin/chapters/${chapterId}/lessons`)
      return response.data
    },

    // Legacy API for backward compatibility (still use old lesson structure)
    list: async (params?: ListLessonsParams): Promise<any[]> => {
      const searchParams = new URLSearchParams()
      if (params?.chapter_id !== undefined) 
        searchParams.set('chapter_id', params.chapter_id.toString())
      if (params?.skip !== undefined) 
        searchParams.set('skip', params.skip.toString())
      if (params?.limit !== undefined) 
        searchParams.set('limit', params.limit.toString())
      
      const response = await api.get<any[]>(
        `/api/v1/super-admin/content/lessons?${searchParams.toString()}`
      )
      return response.data
    },

    get: async (id: number): Promise<Lesson> => {
      const response = await api.get<Lesson>(`/admin/lessons/${id}`)
      return response.data
    },

    create: async (data: CreateLessonRequest): Promise<Lesson> => {
      const response = await api.post<Lesson>('/admin/lessons', data)
      return response.data
    },

    update: async (id: number, data: UpdateLessonRequest): Promise<Lesson> => {
      const response = await api.put<Lesson>(`/admin/lessons/${id}`, data)
      return response.data
    },

    delete: async (id: number): Promise<DeleteResponse> => {
      const response = await api.delete<DeleteResponse>(`/admin/lessons/${id}`)
      return response.data
    },
  },

  // Word Management
  words: {
    // New lesson-based API
    listByLesson: async (lessonId: number): Promise<Word[]> => {
      const response = await api.get<Word[]>(`/admin/lessons/${lessonId}/words`)
      return response.data
    },

    // Legacy API for backward compatibility
    list: async (params?: ListWordsParams): Promise<any[]> => {
      const searchParams = new URLSearchParams()
      if (params?.lesson_id !== undefined) 
        searchParams.set('lesson_id', params.lesson_id.toString())
      if (params?.skip !== undefined) 
        searchParams.set('skip', params.skip.toString())
      if (params?.limit !== undefined) 
        searchParams.set('limit', params.limit.toString())
      
      const response = await api.get<any[]>(
        `/api/v1/super-admin/content/words?${searchParams.toString()}`
      )
      return response.data
    },

    get: async (id: number): Promise<Word> => {
      const response = await api.get<Word>(`/admin/words/${id}`)
      return response.data
    },

    create: async (data: CreateWordRequest): Promise<Word> => {
      const response = await api.post<Word>('/admin/words', data)
      return response.data
    },

    update: async (id: number, data: UpdateWordRequest): Promise<Word> => {
      const response = await api.put<Word>(`/admin/words/${id}`, data)
      return response.data
    },

    delete: async (id: number): Promise<DeleteResponse> => {
      const response = await api.delete<DeleteResponse>(`/admin/words/${id}`)
      return response.data
    },

    // Audio generation
    generateAudio: async (id: number, voice: VoiceOption | null = null): Promise<AudioGenerationResponse> => {
      const url = voice ? `/admin/words/${id}/generate-audio?voice=${voice}` : `/admin/words/${id}/generate-audio`
      const response = await api.post<AudioGenerationResponse>(url)
      return response.data
    },

    generateExampleAudio: async (id: number, voice: VoiceOption | null = null): Promise<AudioGenerationResponse> => {
      const url = voice ? `/admin/words/${id}/generate-example-audio?voice=${voice}` : `/admin/words/${id}/generate-example-audio`
      const response = await api.post<AudioGenerationResponse>(url)
      return response.data
    },

    // File uploads
    uploadAudio: async (id: number, file: File): Promise<FileUploadResponse> => {
      console.log(`Uploading audio for word ${id}:`, file.name, file.type, file.size)
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        const response = await api.post<FileUploadResponse>(
          `/admin/upload/audio/${id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        console.log('Upload audio response:', response.data)
        return response.data
      } catch (error) {
        console.error('Upload audio error:', error)
        throw error
      }
    },

    uploadExampleAudio: async (id: number, file: File): Promise<FileUploadResponse> => {
      console.log(`Uploading example audio for word ${id}:`, file.name, file.type, file.size)
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        const response = await api.post<FileUploadResponse>(
          `/admin/upload/example-audio/${id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        console.log('Upload example audio response:', response.data)
        return response.data
      } catch (error) {
        console.error('Upload example audio error:', error)
        throw error
      }
    },

    uploadImage: async (id: number, file: File): Promise<FileUploadResponse> => {
      console.log(`Uploading image for word ${id}:`, file.name, file.type, file.size)
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        const response = await api.post<FileUploadResponse>(
          `/admin/upload/image/${id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        console.log('Upload image response:', response.data)
        return response.data
      } catch (error) {
        console.error('Upload image error:', error)
        throw error
      }
    },
  },

  // Story Management
  stories: {
    // Get stories for a lesson
    listByLesson: async (lessonId: number): Promise<Story[]> => {
      const response = await api.get<Story[]>(`/admin/lessons/${lessonId}/stories`)
      return response.data
    },

    get: async (id: number): Promise<Story> => {
      const response = await api.get<Story>(`/admin/stories/${id}`)
      return response.data
    },

    create: async (data: CreateStoryRequest): Promise<Story> => {
      const response = await api.post<Story>('/admin/stories', data)
      return response.data
    },

    update: async (id: number, data: UpdateStoryRequest): Promise<Story> => {
      const response = await api.put<Story>(`/admin/stories/${id}`, data)
      return response.data
    },

    delete: async (id: number): Promise<DeleteResponse> => {
      const response = await api.delete<DeleteResponse>(`/admin/stories/${id}`)
      return response.data
    },

    // Audio generation
    generateAudio: async (id: number, voice: VoiceOption | null = null): Promise<AudioGenerationResponse> => {
      const url = voice ? `/admin/stories/${id}/generate-audio?voice=${voice}` : `/admin/stories/${id}/generate-audio`
      const response = await api.post<AudioGenerationResponse>(url)
      return response.data
    },

    // File upload
    uploadAudio: async (id: number, file: File): Promise<FileUploadResponse> => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post<FileUploadResponse>(
        `/admin/upload/story-audio/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    },
  },

}