'use client'

import { ChatInterface } from '@/components/chat'
import { Activity } from '@/types'

export default function Home() {
  const handleActivitySelect = (activity: Activity) => {
    console.log('Selected activity:', activity)
    // TODO: Implement activity detail view or map focus
  }

  return (
    <main className="h-screen flex flex-col">
      <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <ChatInterface 
          apiEndpoint="/api/chat/stream"
          onActivitySelect={handleActivitySelect}
        />
      </div>
    </main>
  )
}
