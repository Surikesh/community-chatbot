import { useCallback, useRef, useState, useEffect } from 'react'
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
  const [connectionError, setConnectionError] = useState<string | undefined>(undefined)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)
  const currentMessageRef = useRef<string>('')
  const currentMessageIdRef = useRef<string>('')
  const isManuallyDisconnected = useRef(false)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Combine store error and connection error
  const combinedError = error || connectionError

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
        
        // Close the EventSource connection to prevent loops
        // Set manual disconnection flag to prevent automatic reconnection
        isManuallyDisconnected.current = true
        if (eventSourceRef.current) {
          console.log('Closing EventSource after streaming ended - preventing automatic reconnection')
          eventSourceRef.current.close()
          eventSourceRef.current = null
          setIsConnected(false)
        }
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
        
        // Close connection on error to prevent reconnection loops
        isManuallyDisconnected.current = true
        if (eventSourceRef.current) {
          console.log('Closing EventSource due to error - preventing automatic reconnection')
          eventSourceRef.current.close()
          eventSourceRef.current = null
          setIsConnected(false)
        }
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
    console.log('Setting up EventSource with endpoint:', endpoint)
    
    // Clear any previous errors
    setConnectionError(undefined)
    setError(undefined)
    
    // Validate endpoint format
    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      const errorMsg = 'Invalid endpoint URL format. Must be a full URL including protocol and host.'
      console.error(errorMsg)
      setConnectionError(errorMsg)
      return
    }
    
    // Create URL object from the endpoint
    let url: URL
    try {
      url = new URL(endpoint)
      url.searchParams.set('message', messageContent) // Don't double encode
    } catch (error) {
      const errorMsg = `Failed to create URL from endpoint: ${endpoint}`
      console.error(errorMsg, error)
      setConnectionError(errorMsg)
      return
    }
    
    console.log('Connecting to chat stream at:', url.toString())
    
    // Create EventSource with proper error handling
    let eventSource: EventSource
    try {
      eventSource = new EventSource(url.toString())
      console.log('EventSource created successfully')
    } catch (error) {
      const errorMsg = `Failed to connect to chat API: ${error instanceof Error ? error.message : String(error)}`
      console.error('Failed to create EventSource:', error)
      setConnectionError(errorMsg)
      return
    }
    eventSourceRef.current = eventSource

    eventSource.onopen = (event) => {
      console.log('EventSource connection opened:', event)
      setIsConnected(true)
      setConnectionError(undefined)
      setError(undefined)
    }

    eventSource.onmessage = (event) => {
      console.log('EventSource message received:', event.data)
      const aguiEvent = parseAGUIEvent(event.data)
      if (aguiEvent) {
        console.log('Parsed AG-UI event:', aguiEvent)
        handleAGUIEvent(aguiEvent)
      } else {
        console.warn('Failed to parse AG-UI event:', event.data)
      }
    }

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error)
      console.log('EventSource readyState:', eventSource.readyState)
      setIsConnected(false)
      
      // Immediately close the connection to prevent automatic reconnection
      eventSource.close()
      eventSourceRef.current = null
      
      let errorMessage = 'Connection error occurred'
      
      if (eventSource.readyState === EventSource.CLOSED) {
        errorMessage = 'Connection closed unexpectedly'
        onError?.('Connection lost. Please try again.')
      } else {
        onError?.('Failed to connect to server')
      }
      
      setConnectionError(errorMessage)
    }

    return eventSource
  }, [endpoint, parseAGUIEvent, handleAGUIEvent, onError])

  /**
   * Send message and setup streaming response
   */
  const sendMessage = useCallback(async (message: string) => {
    if (isStreaming) {
      console.warn('Already streaming, ignoring new message')
      return
    }

    console.log('SendMessage called with:', message)
    console.log('Endpoint:', endpoint)

    // Close existing connection and reset state
    if (eventSourceRef.current) {
      console.log('Closing existing EventSource before sending new message')
      isManuallyDisconnected.current = true // Mark as manual to prevent error handling
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }

    // Clear any pending reconnection timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
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
      console.error('Error in sendMessage:', errorMsg)
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }, [isStreaming, addMessage, setupEventSource, onError, endpoint])

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log('Cleaning up EventSource connection and timeouts')
      
      // Clear any pending timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      
      // Close EventSource
      if (eventSourceRef.current) {
        isManuallyDisconnected.current = true
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [])

  /**
   * Reconnect to the streaming endpoint
   */
  const reconnect = useCallback(() => {
    console.log('Manual reconnect requested')
    
    // Close existing connection
    if (eventSourceRef.current) {
      isManuallyDisconnected.current = true
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    // Clear timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    setIsConnected(false)
    setConnectionError(undefined)
    setError(undefined)
    setReconnectAttempts(0)
    
    // Note: We don't automatically reconnect here
    // User needs to send a new message to establish connection
  }, [])

  return {
    sendMessage,
    isStreaming,
    isConnected,
    error: combinedError,
    reconnect
  }
}
