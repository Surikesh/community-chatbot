'use client'

import { useAGUIChat } from '@/hooks/agui/useAGUIChat'
import { useChatSelectors } from '@/stores'
import { getChatStreamUrl } from '@/lib/env'

export default function SimpleTest() {
  const { messages, isStreaming } = useChatSelectors()
  
  const {
    sendMessage,
    isConnected,
    error,
    reconnect
  } = useAGUIChat({
    endpoint: getChatStreamUrl(),
    onError: (error) => {
      console.error('Chat Error:', error)
    },
    onToolExecution: (toolName, isStart) => {
      console.log('Tool execution:', toolName, isStart ? 'started' : 'ended')
    }
  })

  const handleTest = () => {
    sendMessage('Hello, this is a test message!')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Simple Chat Test</h1>
      
      <div className="mb-4 space-y-2">
        <p><strong>Endpoint:</strong> {getChatStreamUrl()}</p>
        <p><strong>Connected:</strong> 
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? ' Yes' : ' No'}
          </span>
        </p>
        <p><strong>Streaming:</strong> {isStreaming ? 'Yes' : 'No'}</p>
        <p><strong>Messages Count:</strong> {messages.length}</p>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
          <button
            onClick={reconnect}
            className="ml-4 text-sm bg-red-600 text-white px-2 py-1 rounded"
          >
            Reconnect
          </button>
        </div>
      )}
      
      <div className="mb-4">
        <button
          onClick={handleTest}
          disabled={isStreaming}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Send Test Message
        </button>
      </div>
      
      <div className="border p-4 rounded bg-gray-50 min-h-32">
        <h3 className="font-bold mb-2">Messages:</h3>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet</p>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div key={message.id} className="border-b pb-2">
                <div className="text-sm text-gray-600">
                  {message.type} • {new Date(message.timestamp).toLocaleTimeString()}
                  {message.isStreaming && ' • streaming...'}
                </div>
                <div className="text-sm">{message.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
