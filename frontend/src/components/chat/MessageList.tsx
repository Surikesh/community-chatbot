'use client'

import { MessageBubble } from './MessageBubble'
import type { Message, Activity } from '@/types'

interface MessageListProps {
  messages: Message[]
  onActivityClick?: (activity: Activity) => void
}

/**
 * Displays a list of chat messages with proper spacing and styling
 */
export function MessageList({ messages, onActivityClick }: MessageListProps) {
  if (messages.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : null
        const showAvatar = !previousMessage || previousMessage.type !== message.type
        
        return (
          <MessageBubble
            key={message.id}
            message={message}
            showAvatar={showAvatar}
            onActivityClick={onActivityClick}
          />
        )
      })}
    </div>
  )
}
