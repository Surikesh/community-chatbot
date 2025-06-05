'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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
 * Welcome screen component for when there are no messages
 */
function WelcomeScreen({ onSendMessage, isStreaming }: { 
  onSendMessage: (message: string) => void
  isStreaming: boolean 
}) {
  return (
    <div className="text-center py-12">
      <div className="text-muted-foreground mb-4">
        <svg 
          className="mx-auto h-12 w-12 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
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
          onClick={() => onSendMessage("Find hiking trails near me")}
          className="p-3 text-left bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          disabled={isStreaming}
          aria-label="Find hiking trails near me"
        >
          <div className="font-medium text-sm">🥾 Hiking trails</div>
          <div className="text-xs text-muted-foreground">Find nearby trails</div>
        </button>
        <button
          onClick={() => onSendMessage("Show me cycling routes")}
          className="p-3 text-left bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          disabled={isStreaming}
          aria-label="Show me cycling routes"
        >
          <div className="font-medium text-sm">🚴 Cycling routes</div>
          <div className="text-xs text-muted-foreground">Discover bike paths</div>
        </button>
      </div>
    </div>
  )
}

/**
 * Error display component for connection and chat errors
 */
function ErrorDisplay({ 
  hasError, 
  isConnected, 
  error, 
  onReconnect 
}: { 
  hasError: boolean
  isConnected: boolean
  error: string | undefined
  onReconnect: () => void 
}) {
  if (!hasError) return null

  // Determine error type and provide specific guidance
  const getErrorDetails = () => {
    if (!isConnected) {
      return {
        icon: "🔌",
        title: "Connection Issue",
        message: "Unable to connect to server. Please ensure the backend is running on port 8080.",
        action: "Retry Connection"
      }
    }
    
    if (error?.includes("Duplicate message")) {
      return {
        icon: "🔄",
        title: "Duplicate Message",
        message: "Please wait a moment before sending the same message again.",
        action: null
      }
    }
    
    if (error?.includes("Too Many Requests")) {
      return {
        icon: "⏳",
        title: "Rate Limited",
        message: "Too many requests. Please wait a moment before trying again.",
        action: null
      }
    }
    
    return {
      icon: "⚠️",
      title: "Error",
      message: error || "An unexpected error occurred",
      action: "Retry"
    }
  }

  const errorDetails = getErrorDetails()

  return (
    <div className="p-4 border-t bg-destructive/10" role="alert" aria-live="polite">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-destructive">
          <span className="text-lg" aria-hidden="true">{errorDetails.icon}</span>
          <div>
            <div className="font-medium text-sm">{errorDetails.title}</div>
            <div className="text-xs text-muted-foreground">{errorDetails.message}</div>
          </div>
        </div>
        {errorDetails.action && (
          <button
            onClick={onReconnect}
            className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary px-2 py-1 rounded"
            aria-label={errorDetails.action}
          >
            {errorDetails.action}
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Main chat interface component with AG-UI streaming support
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
    onToolExecution: useCallback((toolName: string, isStart: boolean) => {
      setToolExecutions(prev => {
        const newSet = new Set(prev)
        if (isStart) {
          newSet.add(toolName)
        } else {
          newSet.delete(toolName)
        }
        return newSet
      })
    }, [])
  })

  // Auto-scroll to bottom when new messages arrive with error handling
  useEffect(() => {
    try {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }
      }
    } catch (error) {
      console.warn('Failed to auto-scroll:', error)
    }
  }, [messages])

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isStreaming) return
    
    try {
      await sendMessage(message.trim())
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [sendMessage, isStreaming])

  const handleActivitySelect = useCallback((activity: Activity) => {
    onActivitySelect?.(activity)
  }, [onActivitySelect])

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
          <div 
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              isConnected ? "bg-green-500" : "bg-red-500"
            )}
            aria-label={isConnected ? "Connected" : "Disconnected"}
            role="status"
          />
          <h2 className="text-lg font-semibold">Community Activities</h2>
          {!isConnected && (
            <span className="text-xs text-muted-foreground">
              (Backend disconnected)
            </span>
          )}
        </div>
        
        {hasActiveTools && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
            <div className="animate-spin w-3 h-3 border border-primary border-t-transparent rounded-full" aria-hidden="true" />
            <span>Finding activities...</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-4">
            {!hasMessages && (
              <WelcomeScreen 
                onSendMessage={handleSendMessage}
                isStreaming={isStreaming}
              />
            )}

            <MessageList 
              messages={messages}
              onActivityClick={handleActivitySelect}
            />

            {isStreaming && <TypingIndicator />}
          </div>
        </ScrollArea>
      </div>

      <ErrorDisplay 
        hasError={!!hasError}
        isConnected={isConnected}
        error={hasError}
        onReconnect={reconnect}
      />

      {/* Input Area */}
      <div className="p-4 border-t">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming}
          placeholder={
            !isConnected 
              ? "Ask about outdoor activities... (will connect when you send)" 
              : isStreaming 
                ? "Sending..." 
                : "Ask about outdoor activities..."
          }
        />
      </div>
    </Card>
  )
}
