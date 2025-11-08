import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Info, CheckCircle, Lightbulb } from 'lucide-react'

interface RecommendationsProps {
  recommendations: Array<{
    priority: string
    category: string
    title: string
    description: string
  }>
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertTriangle
      case 'medium': return Info
      case 'low': return CheckCircle
      default: return Lightbulb
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-blue-600'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'optimization': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'performance': return 'bg-green-50 text-green-700 border-green-200'
      case 'user_experience': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'content': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'technical': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  // Sort recommendations by priority
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
           (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actionable Insights & Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedRecommendations.map((recommendation, index) => {
            const Icon = getPriorityIcon(recommendation.priority)
            return (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={`h-5 w-5 mt-0.5 ${getPriorityColor(recommendation.priority)}`} />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{recommendation.title}</h3>
                        <Badge 
                          variant={getPriorityBadgeVariant(recommendation.priority) as any}
                          className="text-xs"
                        >
                          {recommendation.priority} priority
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getCategoryColor(recommendation.category)}`}
                        >
                          {recommendation.category.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {recommendation.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {recommendations.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <p className="text-muted-foreground">
                No actionable recommendations at this time. Your analytics look great!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}