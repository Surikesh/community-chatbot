/**
 * AG-UI Event Types for Community Chatbot
 * Based on the AG-UI protocol for streaming interactions
 */

export interface AGUIEvent {
  type: string
  timestamp?: string
  [key: string]: unknown
}

export interface TextMessageEvent extends AGUIEvent {
  type: 'TEXT_MESSAGE_CONTENT'
  content: string
  isComplete?: boolean
}

export interface ActivitiesFoundEvent extends AGUIEvent {
  type: 'ACTIVITIES_FOUND'
  activities: Activity[]
  totalCount: number
  searchQuery?: string
}

export interface ImagesLoadedEvent extends AGUIEvent {
  type: 'IMAGES_LOADED'
  activityId: string
  images: ActivityImage[]
}

export interface ToolExecutionEvent extends AGUIEvent {
  type: 'TOOL_EXECUTION_START' | 'TOOL_EXECUTION_END'
  toolName: string
  toolArgs?: Record<string, unknown>
  result?: unknown
}

export interface ErrorEvent extends AGUIEvent {
  type: 'ERROR'
  message: string
  code?: string
  details?: Record<string, unknown>
}

export interface StreamingStateEvent extends AGUIEvent {
  type: 'STREAMING_START' | 'STREAMING_END'
  messageId?: string
}

/**
 * Application Data Types
 */

export interface Activity {
  id: string
  title: string
  description: string
  type: ActivityType
  location: Location
  difficulty: DifficultyLevel
  duration?: string
  distance?: number
  elevation?: number
  tags: string[]
  images: ActivityImage[]
  routes?: GPXRoute[]
  createdAt: string
  updatedAt: string
}

export interface ActivityImage {
  id: string
  url: string
  thumbnailUrl: string
  caption?: string
  width: number
  height: number
  cloudinaryId?: string
}

export interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  country: string
  region?: string
  city?: string
}

export interface GPXRoute {
  id: string
  name: string
  url: string
  distance: number
  elevation: number
  points: GPXPoint[]
}

export interface GPXPoint {
  latitude: number
  longitude: number
  elevation?: number
  timestamp?: string
}

export type ActivityType = 
  | 'hiking'
  | 'cycling'
  | 'running'
  | 'skiing'
  | 'climbing'
  | 'swimming'
  | 'kayaking'
  | 'other'

export type DifficultyLevel = 'easy' | 'moderate' | 'hard' | 'expert'

/**
 * Chat and Message Types
 */

export interface Message {
  id: string
  type: MessageType
  content: string
  timestamp: string
  isStreaming?: boolean
  activities?: Activity[]
  images?: ActivityImage[]
  metadata?: MessageMetadata
}

export interface MessageMetadata {
  totalCount?: number
  searchQuery?: string
  activityId?: string
  [key: string]: unknown
}

export type MessageType = 'user' | 'assistant' | 'system' | 'error'

export interface ChatState {
  messages: Message[]
  isStreaming: boolean
  currentActivity?: Activity
  activities: Activity[]
  error?: string
}

/**
 * User and Preferences Types
 */

export interface UserPreferences {
  location?: Location
  preferredActivities: ActivityType[]
  difficultyRange: [DifficultyLevel, DifficultyLevel]
  units: 'metric' | 'imperial'
  theme: 'light' | 'dark' | 'system'
}

export interface User {
  id: string
  name?: string
  email?: string
  preferences: UserPreferences
  chatHistory: string[] // message IDs
}

/**
 * API Response Types
 */

export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
    details?: Record<string, unknown>
  }
}

export interface SearchFilters {
  location?: {
    latitude: number
    longitude: number
    radius: number // in kilometers
  }
  activityTypes?: ActivityType[]
  difficulty?: DifficultyLevel[]
  duration?: {
    min?: number // in minutes
    max?: number
  }
  distance?: {
    min?: number // in kilometers
    max?: number
  }
}

/**
 * Component Props Types
 */

export interface ChatInterfaceProps {
  apiEndpoint?: string
  onActivitySelect?: (activity: Activity) => void
  className?: string
}

export interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
  onActivityClick?: (activity: Activity) => void
  showAvatar?: boolean
}

export interface ActivityCardProps {
  activity: Activity
  onClick?: () => void
  showDetails?: boolean
  className?: string
}

export interface ActivityMapProps {
  activities: Activity[]
  selectedActivity?: Activity
  onActivitySelect?: (activity: Activity) => void
  userLocation?: Location
  className?: string
}
