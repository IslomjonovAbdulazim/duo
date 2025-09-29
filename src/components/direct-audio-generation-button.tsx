import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DirectAudioGenerationButtonProps {
  onGenerate: () => Promise<any>
  children?: React.ReactNode
  queryKey?: any[]
  disabled?: boolean
}

export function DirectAudioGenerationButton({
  onGenerate,
  children,
  queryKey,
  disabled = false,
}: DirectAudioGenerationButtonProps) {
  const queryClient = useQueryClient()

  const generateMutation = useMutation({
    mutationFn: onGenerate,
    onSuccess: (data) => {
      toast.success(data.message || 'Audio generated successfully')
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey })
      }
    },
    onError: (error) => {
      toast.error('Failed to generate audio')
      console.error('Audio generation error:', error)
    },
  })

  const handleClick = () => {
    generateMutation.mutate()
  }

  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      onClick={handleClick}
      disabled={disabled || generateMutation.isPending}
      className='flex items-center gap-2'
    >
      {generateMutation.isPending ? (
        <>
          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current'></div>
          Generating...
        </>
      ) : (
        children || (
          <>
            <Zap className='h-4 w-4' />
            Generate
          </>
        )
      )}
    </Button>
  )
}