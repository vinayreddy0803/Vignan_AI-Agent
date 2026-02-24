'use client'

import React, { useRef, useState } from "react"
import { Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onFileUpload?: (file: File) => void
  isLoading: boolean
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onFileUpload,
  isLoading,
  placeholder = 'Type your message or click the microphone to speak...',
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  const checkMicrophonePermission = async () => {
    try {
      // Check if we have microphone permission
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      return result.state === 'granted'
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      return false
    }
  }

  const startVoiceRecognition = async () => {
    // First check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    // Check microphone permission
    const hasPermission = await checkMicrophonePermission()
    if (!hasPermission) {
      const proceed = confirm(
        'Microphone permission is required for voice input. ' +
        'Click OK to grant permission, then click the microphone again.'
      )
      if (proceed) {
        // Try to request permission by starting recognition
        // This will trigger the browser's permission prompt
      } else {
        return
      }
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()

    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onstart = () => {
      setIsListening(true)
    }

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onChange(value + (value ? ' ' : '') + transcript)
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)

      // Handle different error types with user-friendly messages
      let errorMessage = ''
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone permissions in your browser settings and try again. Look for the microphone/camera icon in your browser address bar.'
          break
        case 'no-speech':
          errorMessage = 'No speech detected. Please speak clearly into your microphone.'
          break
        case 'audio-capture':
          errorMessage = 'Audio capture failed. Please check your microphone connection and try again.'
          break
        case 'network':
          errorMessage = 'Network error occurred. Please check your internet connection and try again.'
          break
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not allowed. Please try again later.'
          break
        case 'aborted':
          errorMessage = 'Speech recognition was cancelled.'
          break
        default:
          errorMessage = `Speech recognition error: ${event.error}. Please try again.`
      }

      alert(errorMessage)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    try {
      recognitionRef.current.start()
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      alert('Failed to start voice recognition. Please check your microphone permissions and try again.')
      setIsListening(false)
    }
  }

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopVoiceRecognition()
    } else {
      startVoiceRecognition()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading) {
        onSubmit()
      }
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target
    target.style.height = 'auto'
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`
    onChange(target.value)
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onFileUpload) {
      onFileUpload(file)
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto p-4">
        {/* Voice Input Button */}
        <div className="flex justify-center mb-4">
          <Button
            onClick={toggleVoiceRecognition}
            disabled={isLoading}
            size="lg"
            className={cn(
              "rounded-full px-8 py-3 transition-all duration-200",
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/25"
                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            )}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 mr-2" />
                Listening... Click to Stop
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                Click to Speak to AI
              </>
            )}
          </Button>
        </div>

        <div className="relative bg-secondary rounded-2xl border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <textarea
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className={cn(
              'w-full resize-none bg-transparent px-4 py-3.5 pr-24 text-foreground placeholder:text-muted-foreground focus:outline-none',
              'min-h-[52px] max-h-[200px]'
            )}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.txt"
              className="hidden"
            />
            <button
              type="button"
              onClick={handleFileClick}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50"
              title="Attach file"
            >
              📎
            </button>
            <Button
              onClick={onSubmit}
              disabled={!value.trim() || isLoading}
              size="icon"
              className={cn(
                'h-9 w-9 rounded-xl transition-all',
                value.trim() && !isLoading
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              ➤
            </Button>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground/70 text-center">
          💡 <strong>Voice Input:</strong> Click "Click to Speak to AI" to use voice commands, or type your message above.
          VIGNAN AI can make mistakes - consider checking important information.
        </div>
      </div>
    </div>
  )
}
