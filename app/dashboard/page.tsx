'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, PanelLeftClose, Settings, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { ChatMessage } from '@/components/chat/chat-message'
import { ChatInput } from '@/components/chat/chat-input'
import { WelcomeScreen } from '@/components/chat/welcome-screen'

interface ChatHistoryItem {
  id: string
  title: string
  date: string
  messages: Array<{id: string, role: 'user' | 'assistant', parts: Array<{type: 'text', text: string}>}>
}

export default function Dashboard() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', parts: Array<{type: 'text', text: string}>}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  // Load user and chat history on mount
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    
    // Load chat history specific to this user
    const userEmail = parsedUser.email
    const chatHistoryKey = `chatHistory_${userEmail}`
    const savedChatHistory = localStorage.getItem(chatHistoryKey)
    if (savedChatHistory) {
      try {
        setChatHistory(JSON.parse(savedChatHistory))
      } catch (e) {
        console.error('Failed to load chat history:', e)
      }
    }
  }, [router])

  // Save chat history to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (user && chatHistory.length > 0) {
      const userEmail = user.email
      const chatHistoryKey = `chatHistory_${userEmail}`
      localStorage.setItem(chatHistoryKey, JSON.stringify(chatHistory))
    }
  }, [chatHistory, user])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  // Save current chat and create new chat
  const saveCurrentChat = (messagesToSave: typeof messages) => {
    if (messagesToSave.length === 0 || activeChatId !== null) return

    const firstUserMsg = messagesToSave.find(msg => msg.role === 'user')
    const chatTitle = firstUserMsg?.parts?.[0]?.text?.slice(0, 40)?.trim() || 'New Chat'
    const chatId = `chat_${Date.now()}`
    
    const newChat: ChatHistoryItem = {
      id: chatId,
      title: chatTitle,
      date: new Date().toLocaleDateString(),
      messages: messagesToSave
    }
    
    setChatHistory(prev => {
      // Check if chat with same title already exists (avoid duplicates)
      const isDuplicate = prev.some(chat => chat.title === chatTitle && chat.date === newChat.date)
      if (isDuplicate) return prev
      return [newChat, ...prev]
    })
  }

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      parts: [{ type: 'text' as const, text: input }]
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        parts: [{ type: 'text' as const, text: '' }]
      }

      setMessages(prev => [...prev, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const data = JSON.parse(line.slice(2))
              if (data.text) {
                setMessages(prev => {
                  const lastMsg = prev[prev.length - 1]
                  return [...prev.slice(0, -1), {
                    ...lastMsg,
                    parts: [{ type: 'text' as const, text: lastMsg.parts[0].text + data.text }]
                  }]
                })
              }
            } catch (e) {
              // Parse error, skip
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Save chat after message completes
  useEffect(() => {
    if (!isLoading && messages.length > 1 && activeChatId === null) {
      saveCurrentChat(messages)
    }
  }, [isLoading, activeChatId])

  const handleNewChat = () => {
    // Save current chat if it has messages
    if (messages.length > 0 && activeChatId === null) {
      saveCurrentChat(messages)
    }

    // Clear current chat
    setMessages([])
    setInput('')
    setActiveChatId(null)
  }

  const handleSelectChat = (chatId: string) => {
    const selectedChat = chatHistory.find(chat => chat.id === chatId)
    if (selectedChat) {
      setMessages(selectedChat.messages)
      setActiveChatId(chatId)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <ChatSidebar
          isOpen={sidebarOpen}
          onNewChat={handleNewChat}
          chatHistory={chatHistory.map(chat => ({ id: chat.id, title: chat.title, date: chat.date }))}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
            <h1 className="font-semibold text-foreground">VIGNAN AI Chat</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {user?.name}
            </div>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/settings')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={(text) => setInput(text)} />
          ) : (
            <div className="max-w-4xl mx-auto w-full px-4 py-6 space-y-4">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
