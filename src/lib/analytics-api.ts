// import { api } from './api'
import { generateMockAnalyticsData, generateMockCacheStatus } from './mock-analytics-data'

export interface AnalyticsData {
  generated_at: string
  cache_expires_at: string
  data_period: {
    start_date: string
    end_date: string
    total_days: number
  }
  summary: {
    total_lessons_completed: number
    average_daily_lessons: number
    peak_daily_activity: number
    peak_date: string
    active_learning_days: number
    total_users: number
    daily_active_users_avg: number
  }
  daily_data: Array<{
    date: string
    day_of_week: string
    dau: number
    lessons_completed: number
    lessons_per_user: number
    lesson_breakdown: {
      word: number
      story: number
      test: number
    }
    performance_rating: string
  }>
  hourly_patterns: Array<{
    hour: number
    time: string
    lessons: number
    unique_users: number
    percentage_of_daily: number
    lessons_per_user: number
    weekend_lessons: number
    weekday_lessons: number
    activity_level: string
  }>
  courses: Array<{
    course_id: number
    course_name: string
    total_users: number
    total_lessons: number
    market_share_users: number
    market_share_lessons: number
    status: string
  }>
  user_segmentation: Array<{
    segment: string
    lesson_range: string
    user_count: number
    percentage: number
    avg_lessons: number
    behavior: string
  }>
  learning_zones: Array<{
    zone: string
    time_range: string
    total_lessons: number
    percentage: number
    description: string
  }>
  top_performance_days: Array<{
    rank: number
    date: string
    day: string
    dau: number
    lessons: number
    efficiency: number
    achievement: string
  }>
  kpis: {
    user_retention_rate: number
    power_users_percentage: number
    avg_lessons_per_active_user: number
    course_completion_balance: number
    peak_hour_concentration: number
  }
  recommendations: Array<{
    priority: string
    category: string
    title: string
    description: string
  }>
  cache_info: {
    is_cached: boolean
    cache_hit: boolean
    generation_time_ms: number
    data_freshness: string
  }
}

export interface CacheStatus {
  cache_exists: boolean
  generated_at?: string
  expires_at?: string
  age_minutes?: number
  expires_in_minutes?: number
  is_expired: boolean
  needs_refresh: boolean
}

export interface RefreshResponse {
  message: string
  cached: boolean
  generated_at: string
  expires_at: string
}

export interface ClearCacheResponse {
  message: string
}

// Get analytics data
export const getAnalytics = async (_forceRefresh = false): Promise<AnalyticsData> => {
  // For now, return mock data. In production, this would call the real API
  // const params = forceRefresh ? { force_refresh: true } : {}
  // const response = await api.get('/analytics/', { params })
  // return response.data
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return generateMockAnalyticsData()
}

// Refresh analytics cache
export const refreshAnalyticsCache = async (): Promise<RefreshResponse> => {
  // For now, return mock response. In production, this would call the real API
  // const response = await api.post('/analytics/refresh')
  // return response.data
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000)
  
  return {
    message: "Analytics cache refreshed successfully",
    cached: true,
    generated_at: now.toISOString(),
    expires_at: expiresAt.toISOString()
  }
}

// Get cache status
export const getCacheStatus = async (): Promise<CacheStatus> => {
  // For now, return mock status. In production, this would call the real API
  // const response = await api.get('/analytics/cache/status')
  // return response.data
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200))
  return generateMockCacheStatus()
}

// Clear analytics cache
export const clearAnalyticsCache = async (): Promise<ClearCacheResponse> => {
  // For now, return mock response. In production, this would call the real API
  // const response = await api.delete('/analytics/cache')
  // return response.data
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    message: "Analytics cache cleared successfully"
  }
}