'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { useAGUIChat } from '@/hooks/agui/useAGUIChat'
import { useChatSelectors } from '@/stores'
import { cn } from '@/lib/utils'
import type { ChatInterfaceProps, Activity } from '@/types'

/**
 * Main chat interface component with AG-UI streaming support
 * 
 * @param apiEndpoint - Backend streaming endpoint URL
 * @param onActivitySelect - Callback when user selects an activity
 * @param className - Additional CSS classes
 */
export function ChatInterface({ 
  apiEndpoint = '/api/chat/stream',
  onActivitySelect,
  className 
}: ChatInterfaceProps) {
  const [toolExecutions, setToolExecutions] = useState<Set<string>>(new Set())
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  const {
    messages,
    isStreaming,
    hasMessages,
    error: chatError
  } = useChatSelectors()

  const {
    sendMessage,
    isConnected,
    error: connectionError,
    reconnect
  } = useAGUIChat({
    endpoint: apiEndpoint,
    onError: (error) => {
      console.error('AG-UI Chat Error:', error)
    },
    onToolExecution: (toolName, isStart) => {
      setToolExecutions(prev => {
        const newSet = new Set(prev)
        if (isStart) {
          newSet.add(toolName)
        } else {
          newSet.delete(toolName)
        }
        return newSet
      })
    }
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isStreaming) return
    
    try {
      await sendMessage(message.trim())
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleActivitySelect = (activity: Activity) => {
    onActivitySelect?.(activity)
  }

  const hasError = chatError || connectionError
  const hasActiveTools = toolExecutions.size > 0

  return (
    <Card 
      role="main"
      className={cn(
        "flex flex-col h-full max-h-screen bg-background",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )} />
          <h2 className="text-lg font-semibold">Community Activities</h2>
        </div>
        
        {hasActiveTools && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin w-3 h-3 border border-primary border-t-transparent rounded-full" />
            <span>Finding activities...</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-4">
            {!hasMessages && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <svg 
                    className="mx-auto h-12 w-12 mb-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                    />
                  </svg>
                  <h3 className="text-lg font-medium">Start a conversation</h3>
                  <p className="text-sm">Ask me about outdoor activities in your area!</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto">
                  <button
                    onClick={() => handleSendMessage("Find hiking trails near me")}
                    className="p-3 text-left bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    disabled={isStreaming}
                  >
                    <div className="font-medium text-sm">🥾 Hiking trails</div>
                    <div className="text-xs text-muted-foreground">Find nearby trails</div>
                  </button>
                  <button
                    onClick={() => handleSendMessage("Show me cycling routes")}
                    className="p-3 text-left bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    disabled={isStreaming}
                  >
                    <div className="font-medium text-sm">🚴 Cycling routes</div>
                    <div className="text-xs text-muted-foreground">Discover bike paths</div>
                  </button>
                </div>
              </div>
            )}

            <MessageList 
              messages={messages}
              onActivityClick={handleActivitySelect}
            />

            {isStreaming && <TypingIndicator />}
          </div>
        </ScrollArea>
      </div>

      {/* Error Display */}
      {hasError && (
        <div className="p-4 border-t bg-destructive/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-destructive">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span className="text-sm">{hasError}</span>
            </div>
            {!isConnected && (
              <button
                onClick={reconnect}
                className="text-sm text-primary hover:underline"
              >
                Reconnect
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming || !isConnected}
          placeholder={
            !isConnected 
              ? "Connecting..." 
              : isStreaming 
                ? "Sending..." 
                : "Ask about outdoor activities..."
          }
        />
      </div>
    </Card>
  )
}
