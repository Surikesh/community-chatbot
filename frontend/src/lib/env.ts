/**
 * Environment configuration for the frontend application
 */

export const env = {
  // API Configuration
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  apiChatEndpoint: process.env.NEXT_PUBLIC_API_CHAT_ENDPOINT || '/api/v1/chat/stream',
  
  // Development flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Feature flags
  enableDebugLogs: process.env.NODE_ENV === 'development',
} as const

/**
 * Get the full API URL for a given endpoint
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = env.apiBaseUrl
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${cleanEndpoint}`
}

/**
 * Get the chat streaming endpoint URL
 */
export function getChatStreamUrl(): string {
  // Make sure to include the full URL with the base API URL
  return getApiUrl(env.apiChatEndpoint)
}
