'use client'

import { Plus, MessageSquare, Settings, User, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface ChatHistory {
  id: string
  title: string
  date: string
}

interface ChatSidebarProps {
  isOpen: boolean
  onNewChat: () => void
  chatHistory: ChatHistory[]
  activeChatId: string | null
  onSelectChat: (id: string) => void
}

export function ChatSidebar({
  isOpen,
  onNewChat,
  chatHistory,
  activeChatId,
  onSelectChat,
}: ChatSidebarProps) {
  if (!isOpen) return null

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground text-sm">VIGNAN&apos;S</h1>
            <p className="text-xs text-muted-foreground">UNIVERSITY</p>
          </div>
        </div>
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {chatHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-4 text-center">
              No conversations yet
            </p>
          ) : (
            chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2',
                  activeChatId === chat.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">{chat.title}</span>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <a href="/settings" className="block">
          <button className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </a>
        <a href="/profile" className="block">
          <button className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </button>
        </a>
      </div>
    </aside>
  )
}
