'use client'

/**
 * Typing indicator component shown when assistant is composing a response
 */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 mt-4">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
        <span className="text-xs font-medium text-secondary-foreground">AI</span>
      </div>
      
      <div className="bg-muted rounded-lg px-4 py-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce delay-200" />
        </div>
      </div>
    </div>
  )
}
