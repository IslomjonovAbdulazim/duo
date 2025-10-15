import { z } from 'zod'

export const courseStatsSchema = z.object({
  course_id: z.number(),
  course_title: z.string(),
  total_students: z.number(),
})

export const studentProgressSchema = z.object({
  user_id: z.number(),
  full_name: z.string(),
  phone_number: z.string().nullable(),
  lessons_completed: z.number(),
})

export const courseDetailStatsSchema = z.object({
  course_info: z.object({
    id: z.number(),
    title: z.string(),
  }),
  total_students: z.number(),
  students: z.array(studentProgressSchema),
})

export type CourseStats = z.infer<typeof courseStatsSchema>
export type StudentProgress = z.infer<typeof studentProgressSchema>
export type CourseDetailStats = z.infer<typeof courseDetailStatsSchema>