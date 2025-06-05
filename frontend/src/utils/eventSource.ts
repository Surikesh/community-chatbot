/**
 * EventSource utilities to prevent automatic reconnection loops
 * and provide better error handling for AG-UI streaming
 */

interface EventSourceConfig {
  /** Maximum number of reconnection attempts before giving up */
  maxReconnectAttempts?: number
  /** Base delay between reconnection attempts in milliseconds */
  reconnectDelay?: number
  /** Whether to log debug information */
  debug?: boolean
}

export class SafeEventSource {
  private eventSource: EventSource | null = null
  private isManuallyDisconnected = false
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  
  constructor(
    private url: string,
    private config: EventSourceConfig = {}
  ) {
    this.config = {
      maxReconnectAttempts: 3,
      reconnectDelay: 1000,
      debug: false,
      ...config
    }
  }

  /**
   * Connect to the EventSource endpoint
   */
  connect(): EventSource {
    if (this.eventSource) {
      this.log('Closing existing EventSource connection')
      this.close()
    }

    this.log(`Connecting to EventSource: ${this.url}`)
    this.isManuallyDisconnected = false
    
    try {
      this.eventSource = new EventSource(this.url)
      this.setupEventHandlers()
      return this.eventSource
    } catch (error) {
      this.log(`Failed to create EventSource: ${error}`)
      throw error
    }
  }

  /**
   * Manually close the connection
   */
  close(): void {
    this.log('Manually closing EventSource connection')
    this.isManuallyDisconnected = true
    this.clearReconnectTimeout()
    
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN
  }

  /**
   * Get current connection state
   */
  getReadyState(): number | null {
    return this.eventSource?.readyState ?? null
  }

  /**
   * Set up event handlers with automatic reconnection prevention
   */
  private setupEventHandlers(): void {
    if (!this.eventSource) return

    const originalOnError = this.eventSource.onerror

    // Override the error handler to prevent automatic reconnection
    this.eventSource.onerror = (event) => {
      this.log(`EventSource error occurred. ReadyState: ${this.eventSource?.readyState}`)
      
      // CRITICAL: Immediately close to prevent browser auto-reconnection
      if (this.eventSource) {
        this.eventSource.close()
        this.eventSource = null
      }

      // Only handle as error if not manually disconnected
      if (!this.isManuallyDisconnected) {
        this.reconnectAttempts++
        this.log(`Reconnection attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`)
        
        if (this.reconnectAttempts <= (this.config.maxReconnectAttempts || 3)) {
          this.scheduleReconnect()
        } else {
          this.log('Max reconnection attempts reached. Giving up.')
        }
      }

      // Call original error handler if it exists
      if (originalOnError) {
        originalOnError.call(this.eventSource, event)
      }
    }
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  private scheduleReconnect(): void {
    this.clearReconnectTimeout()
    
    const delay = (this.config.reconnectDelay || 1000) * Math.pow(2, this.reconnectAttempts - 1)
    this.log(`Scheduling reconnect in ${delay}ms`)
    
    this.reconnectTimeout = setTimeout(() => {
      if (!this.isManuallyDisconnected) {
        this.log('Attempting automatic reconnection')
        try {
          this.connect()
        } catch (error) {
          this.log(`Reconnection failed: ${error}`)
        }
      }
    }, delay)
  }

  /**
   * Clear any pending reconnection timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  /**
   * Log debug messages if enabled
   */
  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[SafeEventSource] ${message}`)
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.close()
    this.clearReconnectTimeout()
  }
}

/**
 * Create a safer EventSource that prevents automatic reconnection loops
 */
export function createSafeEventSource(
  url: string,
  config?: EventSourceConfig
): SafeEventSource {
  return new SafeEventSource(url, config)
}

/**
 * Detect if browser is trying to automatically reconnect EventSource
 */
export function detectEventSourceLoop(
  eventCounts: Map<string, number>,
  url: string,
  timeWindow: number = 10000
): boolean {
  const now = Date.now()
  const key = `${url}_${Math.floor(now / timeWindow)}`
  
  const count = eventCounts.get(key) || 0
  eventCounts.set(key, count + 1)
  
  // Clean up old entries
  for (const [k] of eventCounts) {
    if (!k.endsWith(`_${Math.floor(now / timeWindow)}`)) {
      eventCounts.delete(k)
    }
  }
  
  // Flag as potential loop if more than 5 connections in time window
  return count > 5
}
