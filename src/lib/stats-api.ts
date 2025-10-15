import { api } from './api'

export interface CourseStats {
  course_id: number
  course_title: string
  total_students: number
}

export interface CourseStatsResponse {
  courses: CourseStats[]
}

export interface StudentProgress {
  user_id: number
  full_name: string
  phone_number: string | null
  lessons_completed: number
}

export interface CourseDetailStats {
  course_info: {
    id: number
    title: string
  }
  total_students: number
  students: StudentProgress[]
}

export const statsApi = {
  async getCourses(): Promise<CourseStats[]> {
    const response = await api.get<CourseStatsResponse>('/admin/stats/courses')
    return response.data.courses
  },

  async getCourseDetails(courseId: number): Promise<CourseDetailStats> {
    const response = await api.get<CourseDetailStats>(`/admin/stats/courses/${courseId}`)
    return response.data
  },
}