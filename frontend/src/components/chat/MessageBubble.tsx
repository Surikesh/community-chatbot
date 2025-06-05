'use client'

import { memo } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { StreamingMessage } from '@/components/chat/StreamingMessage'
import { ActivityCard } from '@/components/activities/ActivityCard'
import { cn } from '@/lib/utils'
import type { MessageBubbleProps } from '@/types'

/**
 * Individual message bubble component with support for different message types
 */
export const MessageBubble = memo(function MessageBubble({ 
  message, 
  showAvatar = true,
  onActivityClick 
}: MessageBubbleProps & { showAvatar?: boolean }) {
  const isUser = message.type === 'user'
  const isError = message.type === 'error'
  const isStreaming = message.isStreaming

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className={cn(
      "flex gap-3",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {showAvatar && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className={cn(
            isUser 
              ? "bg-primary text-primary-foreground" 
              : isError 
                ? "bg-destructive text-destructive-foreground"
                : "bg-secondary text-secondary-foreground"
          )}>
            {isUser ? "U" : isError ? "!" : "AI"}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={cn(
        "flex-1",
        isUser ? "flex flex-col items-end max-w-[85%]" : "flex flex-col items-start max-w-[90%]"
      )}>
        <Card className={cn(
          "relative w-full",
          isUser 
            ? "bg-primary text-primary-foreground ml-8" 
            : isError
              ? "bg-destructive/10 border-destructive/50"
              : "bg-muted mr-8"
        )}>
          <CardContent className="p-3">
            {/* Message Text */}
            {isStreaming ? (
              <StreamingMessage content={message.content} />
            ) : (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
            )}

            {/* Activities */}
            {message.activities && message.activities.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {message.activities.length} activities found
                  </Badge>
                  {message.metadata?.totalCount && 
                   message.metadata.totalCount > message.activities.length && (
                    <span className="text-xs text-muted-foreground">
                      (showing first {message.activities.length} of {message.metadata.totalCount})
                    </span>
                  )}
                </div>
                
                <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
                  {message.activities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      onClick={() => onActivityClick?.(activity)}
                      showDetails={false}
                      className="cursor-pointer hover:shadow-md transition-shadow w-full"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            {message.images && message.images.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-2">
                  {message.images.slice(0, 4).map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                    >
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt={image.caption || "Activity image"}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        loading="lazy"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                          {image.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {message.images.length > 4 && (
                  <div className="mt-2 text-center">
                    <Badge variant="outline" className="text-xs">
                      +{message.images.length - 4} more images
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Timestamp */}
            <div className={cn(
              "mt-2 text-xs opacity-70",
              isUser ? "text-right" : "text-left"
            )}>
              {formatTime(message.timestamp)}
              {isStreaming && (
                <span className="ml-1 animate-pulse">●</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})
