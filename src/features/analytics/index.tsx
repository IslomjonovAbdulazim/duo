import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { AnalyticsSummary } from './components/analytics-summary'
import { DailyChart } from './components/daily-chart'
import { HourlyChart } from './components/hourly-chart'
import { CoursesAnalytics } from './components/courses-analytics'
import { UserSegmentation } from './components/user-segmentation'
import { TopPerformanceDays } from './components/top-performance-days'
import { KPIsDisplay } from './components/kpis-display'
import { Recommendations } from './components/recommendations'
import { CacheStatus } from './components/cache-status'
import { getAnalytics, refreshAnalyticsCache, getCacheStatus, clearAnalyticsCache } from '@/lib/analytics-api'
import { RotateCcw, Trash2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/context/translation-provider'

export function AnalyticsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => getAnalytics(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })

  const { data: cacheStatus } = useQuery({
    queryKey: ['analytics-cache-status'],
    queryFn: getCacheStatus,
    refetchInterval: 30 * 1000, // Check cache status every 30 seconds
  })

  const refreshMutation = useMutation({
    mutationFn: refreshAnalyticsCache,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['analytics-cache-status'] })
      toast.success('Analytics cache refreshed successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to refresh cache: ' + error.message)
    }
  })

  const clearCacheMutation = useMutation({
    mutationFn: clearAnalyticsCache,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['analytics-cache-status'] })
      toast.success('Analytics cache cleared successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to clear cache: ' + error.message)
    }
  })

  const forceRefresh = () => {
    refetch()
    toast.info('Refreshing analytics data...')
  }

  // Top navigation links
  const topNavLinks = [
    {
      title: 'Analytics Overview',
      href: '/analytics',
      isActive: true,
      disabled: false,
    },
    {
      title: 'Data Export',
      href: '/analytics/export',
      isActive: false,
      disabled: true,
    },
    {
      title: 'Reports',
      href: '/analytics/reports',
      isActive: false,
      disabled: true,
    },
  ]

  if (isLoading) {
    return (
      <>
        <Header>
          <TopNav links={topNavLinks} />
          <div className="ms-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        </Main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header>
          <TopNav links={topNavLinks} />
          <div className="ms-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-destructive mb-4">Failed to load analytics data</p>
              <Button onClick={forceRefresh}>Try Again</Button>
            </div>
          </div>
        </Main>
      </>
    )
  }

  if (!analytics) {
    return (
      <>
        <Header>
          <TopNav links={topNavLinks} />
          <div className="ms-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">No analytics data available</p>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNavLinks} />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t.nav.analytics}
              </h1>
              <p className="text-muted-foreground text-lg">
                Comprehensive learning analytics with intelligent caching
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <CacheStatus status={cacheStatus} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh Cache
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearCacheMutation.mutate()}
                disabled={clearCacheMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </div>

      {/* Cache Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <CardTitle className="text-sm">Cache Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Generated</p>
              <p className="font-medium">{new Date(analytics.generated_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expires</p>
              <p className="font-medium">{new Date(analytics.cache_expires_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data Period</p>
              <p className="font-medium">{analytics.data_period.total_days} days</p>
            </div>
            <div>
              <p className="text-muted-foreground">Cache Status</p>
              <Badge variant={analytics.cache_info.cache_hit ? "default" : "secondary"}>
                {analytics.cache_info.cache_hit ? "HIT" : "MISS"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <AnalyticsSummary summary={analytics.summary} />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <DailyChart data={analytics.daily_data} />
            <HourlyChart data={analytics.hourly_patterns} />
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <CoursesAnalytics courses={analytics.courses} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserSegmentation segmentation={analytics.user_segmentation} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <TopPerformanceDays days={analytics.top_performance_days} />
            <KPIsDisplay kpis={analytics.kpis} />
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Recommendations recommendations={analytics.recommendations} />
        </TabsContent>
      </Tabs>
        </div>
      </Main>
    </>
  )
}