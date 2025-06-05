'use client'

import { ChatInterface } from '@/components/chat'
import { Activity } from '@/types'
import { getChatStreamUrl } from '@/lib/env'

export default function Home() {
  const handleActivitySelect = (activity: Activity) => {
    console.log('Selected activity:', activity)
    // TODO: Implement activity detail view or map focus
  }

  const chatStreamUrl = getChatStreamUrl()
  console.log('Chat stream URL:', chatStreamUrl)

  return (
    <main className="h-screen flex flex-col">
      <div className="flex-1 p-2 sm:p-4 max-w-5xl mx-auto w-full">
        <ChatInterface 
          apiEndpoint={chatStreamUrl}
          onActivitySelect={handleActivitySelect}
        />
      </div>
    </main>
  )
}
