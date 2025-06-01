'use client'

import { memo } from 'react'

interface StreamingMessageProps {
  content: string
}

/**
 * Component for displaying streaming message content with typing effect
 */
export const StreamingMessage = memo(function StreamingMessage({ 
  content 
}: StreamingMessageProps) {
  return (
    <div className="relative">
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {content}
        <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1 align-middle" />
      </div>
    </div>
  )
})
