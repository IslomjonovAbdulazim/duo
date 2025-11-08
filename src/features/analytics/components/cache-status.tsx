import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import type { CacheStatus as CacheStatusType } from '@/lib/analytics-api'

interface CacheStatusProps {
  status?: CacheStatusType
}

export function CacheStatus({ status }: CacheStatusProps) {
  if (!status) {
    return (
      <Badge variant="outline" className="text-gray-500">
        <Clock className="h-3 w-3 mr-1" />
        Unknown
      </Badge>
    )
  }

  const getStatusInfo = () => {
    if (!status.cache_exists) {
      return {
        icon: XCircle,
        variant: 'destructive' as const,
        text: 'No Cache',
        tooltip: 'Analytics cache does not exist'
      }
    }

    if (status.is_expired) {
      return {
        icon: AlertCircle,
        variant: 'destructive' as const,
        text: 'Expired',
        tooltip: `Cache expired ${Math.abs(status.expires_in_minutes || 0)} minutes ago`
      }
    }

    if (status.needs_refresh) {
      return {
        icon: AlertCircle,
        variant: 'default' as const,
        text: 'Needs Refresh',
        tooltip: `Cache expires in ${status.expires_in_minutes} minutes`
      }
    }

    return {
      icon: CheckCircle,
      variant: 'secondary' as const,
      text: 'Fresh',
      tooltip: `Cache valid for ${status.expires_in_minutes} more minutes`
    }
  }

  const { icon: Icon, variant, text, tooltip } = getStatusInfo()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className="cursor-help">
            <Icon className="h-3 w-3 mr-1" />
            {text}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p>{tooltip}</p>
            {status.generated_at && (
              <p className="text-xs">
                Generated: {new Date(status.generated_at).toLocaleString()}
              </p>
            )}
            {status.age_minutes !== undefined && (
              <p className="text-xs">
                Age: {status.age_minutes} minutes
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}