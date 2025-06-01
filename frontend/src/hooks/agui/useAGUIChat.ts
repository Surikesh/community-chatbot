import { useCallback, useRef, useState } from 'react'
import { useChatStore } from '@/stores'
import type { 
  AGUIEvent, 
  TextMessageEvent, 
  ActivitiesFoundEvent, 
  ImagesLoadedEvent,
  ToolExecutionEvent,
  ErrorEvent,
  StreamingStateEvent,
  Message
} from '@/types'

interface UseAGUIChatProps {
  endpoint: string
  onError?: (error: string) => void
  onToolExecution?: (toolName: string, isStart: boolean) => void
}

interface UseAGUIChatReturn {
  sendMessage: (message: string) => Promise<void>
  isStreaming: boolean
  isConnected: boolean
  error: string | undefined
  reconnect: () => void
}

/**
 * Custom hook for AG-UI streaming chat functionality
 * Handles Server-Sent Events and manages chat state
 */
export function useAGUIChat({ 
  endpoint, 
  onError,
  onToolExecution 
}: UseAGUIChatProps): UseAGUIChatReturn {
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const currentMessageRef = useRef<string>('')
  const currentMessageIdRef = useRef<string>('')

  const {
    addMessage,
    updateMessage,
    setStreaming,
    setActivities,
    addActivities,
    setError,
    isStreaming,
    error
  } = useChatStore()

  /**
   * Parse AG-UI event from SSE data
   */
  const parseAGUIEvent = useCallback((data: string): AGUIEvent | null => {
    try {
      // Handle both single events and batched events
      if (data.startsWith('[')) {
        const events = JSON.parse(data) as AGUIEvent[]
        return events[0] // Process first event, could be enhanced to handle multiple
      }
      return JSON.parse(data) as AGUIEvent
    } catch (error) {
      console.error('Failed to parse AG-UI event:', error)
      return null
    }
  }, [])

  /**
   * Handle different AG-UI event types
   */
  const handleAGUIEvent = useCallback((event: AGUIEvent) => {
    switch (event.type) {
      case 'STREAMING_START': {
        const streamEvent = event as StreamingStateEvent
        setStreaming(true)
        currentMessageIdRef.current = streamEvent.messageId || `msg-${Date.now()}`
        currentMessageRef.current = ''
        
        // Create initial streaming message
        const message: Message = {
          id: currentMessageIdRef.current,
          type: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          isStreaming: true
        }
        addMessage(message)
        break
      }

      case 'TEXT_MESSAGE_CONTENT': {
        const textEvent = event as TextMessageEvent
        currentMessageRef.current += textEvent.content
        
        // Update the streaming message with new content
        updateMessage(currentMessageIdRef.current, {
          content: currentMessageRef.current,
          isStreaming: !textEvent.isComplete
        })
        break
      }

      case 'ACTIVITIES_FOUND': {
        const activitiesEvent = event as ActivitiesFoundEvent
        setActivities(activitiesEvent.activities)
        
        // Update message to include activities
        updateMessage(currentMessageIdRef.current, {
          activities: activitiesEvent.activities,
          metadata: {
            totalCount: activitiesEvent.totalCount,
            searchQuery: activitiesEvent.searchQuery
          }
        })
        break
      }

      case 'IMAGES_LOADED': {
        const imagesEvent = event as ImagesLoadedEvent
        
        // Update message to include images
        updateMessage(currentMessageIdRef.current, {
          images: imagesEvent.images,
          metadata: {
            activityId: imagesEvent.activityId
          }
        })
        break
      }

      case 'TOOL_EXECUTION_START': {
        const toolEvent = event as ToolExecutionEvent
        onToolExecution?.(toolEvent.toolName, true)
        break
      }

      case 'TOOL_EXECUTION_END': {
        const toolEvent = event as ToolExecutionEvent
        onToolExecution?.(toolEvent.toolName, false)
        break
      }

      case 'STREAMING_END': {
        setStreaming(false)
        
        // Mark message as complete
        updateMessage(currentMessageIdRef.current, {
          isStreaming: false
        })
        
        currentMessageRef.current = ''
        currentMessageIdRef.current = ''
        break
      }

      case 'ERROR': {
        const errorEvent = event as ErrorEvent
        setError(errorEvent.message)
        setStreaming(false)
        onError?.(errorEvent.message)
        
        // Add error message to chat
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: 'error',
          content: errorEvent.message,
          timestamp: new Date().toISOString()
        }
        addMessage(errorMessage)
        break
      }

      default:
        console.warn('Unknown AG-UI event type:', event.type)
    }
  }, [addMessage, updateMessage, setStreaming, setActivities, setError, onError, onToolExecution])

  /**
   * Setup Server-Sent Events connection
   */
  const setupEventSource = useCallback((messageContent: string) => {
    const url = new URL(endpoint)
    url.searchParams.set('message', encodeURIComponent(messageContent))
    
    const eventSource = new EventSource(url.toString())
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(undefined)
    }

    eventSource.onmessage = (event) => {
      const aguiEvent = parseAGUIEvent(event.data)
      if (aguiEvent) {
        handleAGUIEvent(aguiEvent)
      }
    }

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error)
      setIsConnected(false)
      
      if (eventSource.readyState === EventSource.CLOSED) {
        setError('Connection closed unexpectedly')
        onError?.('Connection lost. Please try again.')
      } else {
        setError('Connection error occurred')
        onError?.('Failed to connect to server')
      }
      
      eventSource.close()
      eventSourceRef.current = null
    }

    return eventSource
  }, [endpoint, parseAGUIEvent, handleAGUIEvent, setError, onError])

  /**
   * Send message and setup streaming response
   */
  const sendMessage = useCallback(async (message: string) => {
    if (isStreaming) {
      console.warn('Already streaming, ignoring new message')
      return
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    // Add user message to chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }
    addMessage(userMessage)

    // Setup streaming response
    try {
      setupEventSource(message)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send message'
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }, [isStreaming, addMessage, setupEventSource, setError, onError])

  /**
   * Reconnect to the streaming endpoint
   */
  const reconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    setIsConnected(false)
    setError(undefined)
    
    // Could implement auto-retry logic here
    // For now, require manual reconnection
  }, [setError])

  return {
    sendMessage,
    isStreaming,
    isConnected,
    error,
    reconnect
  }
}
