import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Volume2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { type VoiceOption } from '@/lib/content-api'

interface AudioGenerationDialogProps {
  title: string
  description: string
  onGenerate: (voice: VoiceOption | null) => Promise<any>
  children?: React.ReactNode
  queryKey?: any[]
}

export function AudioGenerationDialog({
  title,
  description,
  onGenerate,
  children,
  queryKey,
}: AudioGenerationDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>('amy')
  const queryClient = useQueryClient()

  const generateMutation = useMutation({
    mutationFn: () => onGenerate(null), // Always send null as voice
    onSuccess: (data) => {
      toast.success(data.message)
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey })
      }
      setOpen(false)
    },
    onError: (error) => {
      toast.error('Failed to generate audio')
      console.error('Audio generation error:', error)
    },
  })

  const handleVoiceChange = (voice: VoiceOption) => {
    setSelectedVoice(voice)
    // Auto-start generation when voice is selected
    generateMutation.mutate()
  }

  const voiceOptions = [
    { value: 'amy', label: 'Amy (Female)' },
    { value: 'brian', label: 'Brian (Male)' },
    { value: 'emma', label: 'Emma (Female)' },
    { value: 'russell', label: 'Russell (Male)' },
    { value: 'sally', label: 'Sally (Female)' },
  ] as const

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant='outline' size='sm'>
            <Zap className='h-4 w-4 mr-2' />
            Generate Audio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Volume2 className='h-5 w-5' />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='voice'>Voice Selection</Label>
            <Select value={selectedVoice} onValueChange={handleVoiceChange}>
              <SelectTrigger>
                <SelectValue placeholder='Select a voice' />
              </SelectTrigger>
              <SelectContent>
                {voiceOptions.map((voice) => (
                  <SelectItem key={voice.value} value={voice.value}>
                    {voice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {generateMutation.isPending && (
          <div className='flex items-center justify-center gap-2 py-4'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
            <span className='text-sm text-muted-foreground'>Generating audio...</span>
          </div>
        )}

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => setOpen(false)}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? 'Generating...' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}