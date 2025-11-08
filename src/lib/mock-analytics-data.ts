import type { AnalyticsData, CacheStatus } from './analytics-api'

// Mock data generator for analytics
export function generateMockAnalyticsData(): AnalyticsData {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const cacheExpiry = new Date(now.getTime() + 6 * 60 * 60 * 1000) // 6 hours from now

  // Generate daily data for the last 30 days
  const dailyData = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
    const dau = Math.floor(Math.random() * 150) + 30 // 30-180 daily active users
    const lessonsCompleted = Math.floor(Math.random() * 1200) + 200 // 200-1400 lessons
    
    dailyData.push({
      date: date.toISOString().split('T')[0],
      day_of_week: dayOfWeek,
      dau,
      lessons_completed: lessonsCompleted,
      lessons_per_user: Math.round((lessonsCompleted / dau) * 10) / 10,
      lesson_breakdown: {
        word: Math.floor(lessonsCompleted * 0.4),
        story: Math.floor(lessonsCompleted * 0.35),
        test: Math.floor(lessonsCompleted * 0.25),
      },
      performance_rating: lessonsCompleted > 1000 ? 'excellent' 
        : lessonsCompleted > 800 ? 'strong'
        : lessonsCompleted > 600 ? 'good'
        : lessonsCompleted > 400 ? 'moderate' : 'low'
    })
  }

  // Generate hourly patterns
  const hourlyPatterns = []
  for (let hour = 0; hour < 24; hour++) {
    const lessons = Math.floor(Math.random() * 2000) + 100
    const uniqueUsers = Math.floor(Math.random() * 150) + 20
    const percentageOfDaily = Math.round((lessons / 29232) * 100 * 10) / 10
    
    hourlyPatterns.push({
      hour,
      time: `${hour.toString().padStart(2, '0')}:00`,
      lessons,
      unique_users: uniqueUsers,
      percentage_of_daily: percentageOfDaily,
      lessons_per_user: Math.round((lessons / uniqueUsers) * 10) / 10,
      weekend_lessons: Math.floor(lessons * 0.3),
      weekday_lessons: Math.floor(lessons * 0.7),
      activity_level: percentageOfDaily > 8 ? 'peak'
        : percentageOfDaily > 6 ? 'high'
        : percentageOfDaily > 4 ? 'moderate'
        : percentageOfDaily > 2 ? 'low' : 'minimal'
    })
  }

  return {
    generated_at: now.toISOString(),
    cache_expires_at: cacheExpiry.toISOString(),
    data_period: {
      start_date: thirtyDaysAgo.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0],
      total_days: 30
    },
    summary: {
      total_lessons_completed: 29232,
      average_daily_lessons: 885.8,
      peak_daily_activity: 1740,
      peak_date: "2025-10-29",
      active_learning_days: 30,
      total_users: 4030,
      daily_active_users_avg: 112
    },
    daily_data: dailyData,
    hourly_patterns: hourlyPatterns,
    courses: [
      {
        course_id: 1,
        course_name: "English for Russian Speakers - Elementary",
        total_users: 2108,
        total_lessons: 18685,
        market_share_users: 52.3,
        market_share_lessons: 63.9,
        status: "primary"
      },
      {
        course_id: 2,
        course_name: "English for Russian Speakers - Intermediate",
        total_users: 1245,
        total_lessons: 8547,
        market_share_users: 30.9,
        market_share_lessons: 29.2,
        status: "secondary"
      },
      {
        course_id: 3,
        course_name: "Business English",
        total_users: 677,
        total_lessons: 2000,
        market_share_users: 16.8,
        market_share_lessons: 6.9,
        status: "emerging"
      }
    ],
    user_segmentation: [
      {
        segment: "light",
        lesson_range: "1-4",
        user_count: 869,
        percentage: 37.2,
        avg_lessons: 1.9,
        behavior: "trial_users"
      },
      {
        segment: "moderate",
        lesson_range: "5-19",
        user_count: 1205,
        percentage: 29.9,
        avg_lessons: 11.2,
        behavior: "casual_learners"
      },
      {
        segment: "active",
        lesson_range: "20-49",
        user_count: 1233,
        percentage: 30.6,
        avg_lessons: 32.1,
        behavior: "committed_learners"
      },
      {
        segment: "very_active",
        lesson_range: "50+",
        user_count: 93,
        percentage: 2.3,
        avg_lessons: 78.5,
        behavior: "power_users"
      }
    ],
    learning_zones: [
      {
        zone: "peak",
        time_range: "13:00-17:00",
        total_lessons: 12096,
        percentage: 41.8,
        description: "prime_time"
      },
      {
        zone: "high",
        time_range: "09:00-12:00",
        total_lessons: 8755,
        percentage: 30.2,
        description: "morning_rush"
      },
      {
        zone: "moderate",
        time_range: "18:00-21:00",
        total_lessons: 5839,
        percentage: 20.1,
        description: "evening_study"
      },
      {
        zone: "low",
        time_range: "22:00-08:00",
        total_lessons: 2542,
        percentage: 7.9,
        description: "off_hours"
      }
    ],
    top_performance_days: [
      {
        rank: 1,
        date: "2025-10-29",
        day: "Wednesday",
        dau: 177,
        lessons: 1740,
        efficiency: 9.8,
        achievement: "peak_day"
      },
      {
        rank: 2,
        date: "2025-11-05",
        day: "Tuesday",
        dau: 165,
        lessons: 1680,
        efficiency: 10.2,
        achievement: "high_efficiency"
      },
      {
        rank: 3,
        date: "2025-10-22",
        day: "Tuesday",
        dau: 158,
        lessons: 1595,
        efficiency: 10.1,
        achievement: "consistent_performance"
      },
      {
        rank: 4,
        date: "2025-11-01",
        day: "Friday",
        dau: 152,
        lessons: 1520,
        efficiency: 10.0,
        achievement: "strong_friday"
      },
      {
        rank: 5,
        date: "2025-10-15",
        day: "Tuesday",
        dau: 148,
        lessons: 1485,
        efficiency: 10.0,
        achievement: "milestone_day"
      }
    ],
    kpis: {
      user_retention_rate: 60.4,
      power_users_percentage: 2.3,
      avg_lessons_per_active_user: 14.7,
      course_completion_balance: 0.95,
      peak_hour_concentration: 11.5
    },
    recommendations: [
      {
        priority: "high",
        category: "optimization",
        title: "Peak Hour Resource Focus",
        description: "Focus infrastructure resources on 1-4 PM peak period"
      },
      {
        priority: "medium",
        category: "user_experience",
        title: "Light User Engagement",
        description: "Implement onboarding improvements to convert trial users to committed learners"
      },
      {
        priority: "low",
        category: "content",
        title: "Course Balance Enhancement",
        description: "Consider expanding intermediate level content to balance user distribution"
      }
    ],
    cache_info: {
      is_cached: true,
      cache_hit: true,
      generation_time_ms: 245,
      data_freshness: "6_hours"
    }
  }
}

export function generateMockCacheStatus(): CacheStatus {
  const now = new Date()
  const generatedAt = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
  const expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000) // 4 hours from now
  
  return {
    cache_exists: true,
    generated_at: generatedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    age_minutes: 120,
    expires_in_minutes: 240,
    is_expired: false,
    needs_refresh: false
  }
}