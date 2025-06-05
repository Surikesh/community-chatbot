import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { 
  ChatState, 
  Message, 
  Activity, 
  UserPreferences,
  ActivityType,
  DifficultyLevel
} from '@/types'

interface ChatStore extends ChatState {
  // Actions
  addMessage: (message: Message) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  setStreaming: (isStreaming: boolean) => void
  setActivities: (activities: Activity[]) => void
  addActivities: (activities: Activity[]) => void
  setCurrentActivity: (activity: Activity | undefined) => void
  setError: (error: string | undefined) => void
  clearChat: () => void
}

interface UserStore {
  preferences: UserPreferences
  chatHistory: string[]
  
  // Actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  addToChatHistory: (messageId: string) => void
  clearChatHistory: () => void
}

// Chat store - handles current chat session state
export const useChatStore = create<ChatStore>()((set, get) => ({
  // Initial state
  messages: [],
  isStreaming: false,
  activities: [],
  currentActivity: undefined,
  error: undefined,

  // Actions
  addMessage: (message: Message) => {
    console.log('Store: Adding message:', message)
    set((state) => ({
      messages: [...state.messages, message]
    }))
  },

  updateMessage: (id: string, updates: Partial<Message>) => {
    console.log('Store: Updating message:', id, updates)
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      )
    }))
  },

  setStreaming: (isStreaming: boolean) => {
    set({ isStreaming })
  },

  setActivities: (activities: Activity[]) => {
    set({ activities })
  },

  addActivities: (activities: Activity[]) => {
    set((state) => ({
      activities: [...state.activities, ...activities]
    }))
  },

  setCurrentActivity: (activity: Activity | undefined) => {
    set({ currentActivity: activity })
  },

  setError: (error: string | undefined) => {
    set({ error })
  },

  clearChat: () => {
    set({
      messages: [],
      isStreaming: false,
      activities: [],
      currentActivity: undefined,
      error: undefined
    })
  }
}))

// User store - persisted user preferences and history
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      preferences: {
        preferredActivities: [] as ActivityType[],
        difficultyRange: ['easy', 'hard'] as [DifficultyLevel, DifficultyLevel],
        units: 'metric' as const,
        theme: 'system' as const
      },
      chatHistory: [],

      // Actions
      updatePreferences: (preferences: Partial<UserPreferences>) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences }
        }))
      },

      addToChatHistory: (messageId: string) => {
        set((state) => ({
          chatHistory: [...state.chatHistory, messageId].slice(-100) // Keep last 100 messages
        }))
      },

      clearChatHistory: () => {
        set({ chatHistory: [] })
      }
    }),
    {
      name: 'user-preferences', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        chatHistory: state.chatHistory
      })
    }
  )
)

// Computed selectors for better performance
export const useChatSelectors = () => {
  const messages = useChatStore((state) => state.messages)
  const activities = useChatStore((state) => state.activities)
  const isStreaming = useChatStore((state) => state.isStreaming)
  const currentActivity = useChatStore((state) => state.currentActivity)
  const error = useChatStore((state) => state.error)

  return {
    messages,
    activities,
    isStreaming,
    currentActivity,
    error,
    hasMessages: messages.length > 0,
    hasActivities: activities.length > 0,
    lastMessage: messages[messages.length - 1],
    userMessages: messages.filter(msg => msg.type === 'user'),
    assistantMessages: messages.filter(msg => msg.type === 'assistant')
  }
}
