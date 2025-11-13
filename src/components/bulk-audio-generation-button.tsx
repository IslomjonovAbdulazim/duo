import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Volume2, CheckCircle, XCircle, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { contentApi, type Word } from '@/lib/content-api'

interface BulkAudioGenerationButtonProps {
  words: Word[]
  lessonId: number
  children?: React.ReactNode
  onSuccess?: () => void
}

interface WordProgress {
  id: number
  word: string
  translation: string
  wordAudioStatus: 'pending' | 'generating' | 'success' | 'error'
  translationAudioStatus: 'pending' | 'generating' | 'success' | 'error'
  wordError?: string
  translationError?: string
}

export function BulkAudioGenerationButton({
  words,
  lessonId,
  children,
  onSuccess,
}: BulkAudioGenerationButtonProps) {
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState<WordProgress[]>([])
  const [currentStep, setCurrentStep] = useState<'idle' | 'generating' | 'completed' | 'cancelled'>('idle')
  const [overallProgress, setOverallProgress] = useState(0)
  const [cancelled, setCancelled] = useState(false)
  
  const queryClient = useQueryClient()

  // Initialize progress array
  const initializeProgress = () => {
    return words.map(word => ({
      id: word.id,
      word: word.word,
      translation: word.translation,
      wordAudioStatus: 'pending' as const,
      translationAudioStatus: 'pending' as const,
    }))
  }

  // Generate audio for a single word
  const generateWordAudio = async (wordId: number, isTranslation: boolean = false) => {
    try {
      if (isTranslation) {
        const response = await contentApi.words.generateExampleAudio(wordId)
        return { success: true, message: response.message }
      } else {
        const response = await contentApi.words.generateAudio(wordId)
        return { success: true, message: response.message }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Update progress for a specific word
  const updateWordProgress = (
    wordId: number, 
    updates: Partial<Pick<WordProgress, 'wordAudioStatus' | 'translationAudioStatus' | 'wordError' | 'translationError'>>
  ) => {
    setProgress(prev => prev.map(item => 
      item.id === wordId ? { ...item, ...updates } : item
    ))
  }

  // Calculate overall progress percentage
  const calculateProgress = (progressArray: WordProgress[]) => {
    let completedTasks = 0
    const totalTasks = progressArray.length * 2 // 2 audio files per word

    progressArray.forEach(item => {
      if (item.wordAudioStatus === 'success' || item.wordAudioStatus === 'error') completedTasks++
      if (item.translationAudioStatus === 'success' || item.translationAudioStatus === 'error') completedTasks++
    })

    return Math.round((completedTasks / totalTasks) * 100)
  }

  // Main generation function
  const bulkGenerateMutation = useMutation({
    mutationFn: async () => {
      setCancelled(false)
      setCurrentStep('generating')
      const progressArray = initializeProgress()
      setProgress(progressArray)
      setOverallProgress(0)

      let successCount = 0
      let errorCount = 0

      // Process words one by one to avoid overwhelming the server
      for (let i = 0; i < words.length && !cancelled; i++) {
        const word = words[i]

        // Generate audio for the word itself
        if (!cancelled) {
          updateWordProgress(word.id, { wordAudioStatus: 'generating' })
          
          const wordResult = await generateWordAudio(word.id, false)
          
          if (wordResult.success) {
            updateWordProgress(word.id, { wordAudioStatus: 'success' })
            successCount++
          } else {
            updateWordProgress(word.id, { 
              wordAudioStatus: 'error', 
              wordError: wordResult.error 
            })
            errorCount++
          }
        }

        // Generate audio for the translation
        if (!cancelled) {
          updateWordProgress(word.id, { translationAudioStatus: 'generating' })
          
          const translationResult = await generateWordAudio(word.id, true)
          
          if (translationResult.success) {
            updateWordProgress(word.id, { translationAudioStatus: 'success' })
            successCount++
          } else {
            updateWordProgress(word.id, { 
              translationAudioStatus: 'error', 
              translationError: translationResult.error 
            })
            errorCount++
          }
        }

        // Update overall progress
        setProgress(currentProgress => {
          const newProgress = calculateProgress(currentProgress)
          setOverallProgress(newProgress)
          return currentProgress
        })

        // Small delay to prevent overwhelming the server
        if (i < words.length - 1 && !cancelled) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      if (cancelled) {
        setCurrentStep('cancelled')
        toast.info('Audio generation cancelled')
      } else {
        setCurrentStep('completed')
        
        // Show summary toasts
        if (successCount > 0) {
          toast.success(`Successfully generated ${successCount} audio files`)
        }
        if (errorCount > 0) {
          toast.error(`Failed to generate ${errorCount} audio files`)
        }
      }

      return { successCount, errorCount }
    },
    onSuccess: () => {
      // Refresh the words data
      queryClient.invalidateQueries({ queryKey: ['words', lessonId] })
      onSuccess?.()
    },
    onError: (error) => {
      toast.error('Bulk audio generation failed')
      // eslint-disable-next-line no-console
      console.error('Bulk generation error:', error)
      setCurrentStep('completed')
    },
  })

  const handleStart = () => {
    setOpen(true)
    bulkGenerateMutation.mutate()
  }

  const handleCancel = () => {
    setCancelled(true)
    setCurrentStep('cancelled')
  }

  const handleClose = () => {
    setOpen(false)
    setCurrentStep('idle')
    setProgress([])
    setOverallProgress(0)
    setCancelled(false)
  }

  const getStatusIcon = (status: WordProgress['wordAudioStatus']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-200" />
      case 'generating':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const canGenerate = words.length > 0 && !bulkGenerateMutation.isPending
  const wordsWithoutAudio = words.filter(w => !w.audio_url || !w.example_audio)
  const completedWords = progress.filter(p => 
    (p.wordAudioStatus === 'success' || p.wordAudioStatus === 'error') && 
    (p.translationAudioStatus === 'success' || p.translationAudioStatus === 'error')
  ).length

  return (
    <>
      <Button
        onClick={handleStart}
        disabled={!canGenerate}
        variant="outline"
        className="flex items-center gap-2"
      >
        {children || (
          <>
            <Volume2 className="h-4 w-4" />
            Generate All Audio
            {wordsWithoutAudio.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {wordsWithoutAudio.length}
              </Badge>
            )}
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Generate All Audio
            </DialogTitle>
            <DialogDescription>
              Generating audio for {words.length} words and their translations
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{overallProgress}% ({completedWords}/{words.length} words)</span>
              </div>
              <Progress value={overallProgress} className="w-full" />
            </div>

            {/* Status Summary */}
            {currentStep === 'generating' && (
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm font-medium">Generating audio files...</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={cancelled}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}

            {currentStep === 'completed' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {progress.filter(p => 
                      p.wordAudioStatus === 'success' && p.translationAudioStatus === 'success'
                    ).length}
                  </div>
                  <div className="text-sm text-green-600">Words Completed</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="text-lg font-bold text-red-600">
                    {progress.filter(p => 
                      p.wordAudioStatus === 'error' || p.translationAudioStatus === 'error'
                    ).length}
                  </div>
                  <div className="text-sm text-red-600">Errors</div>
                </div>
              </div>
            )}

            {/* Detailed Progress List */}
            {progress.length > 0 && (
              <ScrollArea className="flex-1 max-h-[300px]">
                <div className="space-y-2">
                  {progress.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">
                          {item.word} → {item.translation}
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(item.wordAudioStatus)}
                          {getStatusIcon(item.translationAudioStatus)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Word:</span>
                          <Badge 
                            variant={item.wordAudioStatus === 'success' ? 'default' : 
                                   item.wordAudioStatus === 'error' ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {item.wordAudioStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Translation:</span>
                          <Badge 
                            variant={item.translationAudioStatus === 'success' ? 'default' : 
                                   item.translationAudioStatus === 'error' ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {item.translationAudioStatus}
                          </Badge>
                        </div>
                      </div>

                      {/* Error messages */}
                      {(item.wordError || item.translationError) && (
                        <div className="mt-2 space-y-1">
                          {item.wordError && (
                            <div className="text-xs text-red-600">
                              Word error: {item.wordError}
                            </div>
                          )}
                          {item.translationError && (
                            <div className="text-xs text-red-600">
                              Translation error: {item.translationError}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}