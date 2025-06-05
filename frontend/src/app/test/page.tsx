'use client'

import { useState } from 'react'
import { getChatStreamUrl } from '@/lib/env'

export default function TestPage() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setResponse('')
    setError(null)
    
    const url = getChatStreamUrl()
    console.log('Testing connection to:', url)
    
    try {
      const fullUrl = new URL(url)
      fullUrl.searchParams.set('message', encodeURIComponent(message || 'test'))
      
      console.log('Full URL:', fullUrl.toString())
      
      const eventSource = new EventSource(fullUrl.toString())
      
      eventSource.onopen = () => {
        console.log('Connection opened')
        setIsConnected(true)
        setError(null)
      }
      
      eventSource.onmessage = (event) => {
        console.log('Message received:', event.data)
        setResponse(prev => prev + event.data + '\n')
      }
      
      eventSource.onerror = (error) => {
        console.error('EventSource error:', error)
        setIsConnected(false)
        setError('Connection failed')
        eventSource.close()
      }
      
      // Close after 10 seconds
      setTimeout(() => {
        eventSource.close()
        setIsConnected(false)
      }, 10000)
      
    } catch (error) {
      console.error('Error creating EventSource:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">EventSource Test</h1>
      
      <div className="mb-4">
        <p><strong>Chat Stream URL:</strong> {getChatStreamUrl()}</p>
        <p><strong>Connection Status:</strong> 
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? ' Connected' : ' Disconnected'}
          </span>
        </p>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Test message"
          className="border p-2 rounded mr-2 w-64"
        />
        <button
          onClick={testConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Connection
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="border p-4 rounded bg-gray-50 min-h-32">
        <h3 className="font-bold mb-2">Response:</h3>
        <pre className="whitespace-pre-wrap">{response || 'No response yet'}</pre>
      </div>
    </div>
  )
}
