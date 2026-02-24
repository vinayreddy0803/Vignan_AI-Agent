'use client'

import { User, GraduationCap, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { UIMessage } from 'ai'

interface ChatMessageProps {
  message: UIMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const getMessageText = () => {
    if (!message.parts || !Array.isArray(message.parts)) return ''
    return message.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
  }

  const text = getMessageText()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('py-6 px-4 md:px-0', isUser ? 'bg-transparent' : 'bg-card/30')}>
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
            isUser ? 'bg-secondary' : 'bg-primary'
          )}
        >
          {isUser ? (
            <User className="w-4 h-4 text-secondary-foreground" />
          ) : (
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-foreground">
              {isUser ? 'You' : 'VIGNAN AI'}
            </span>
          </div>
          <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
            {text}
          </div>

          {/* Actions for AI messages */}
          {!isUser && text && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-secondary"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
