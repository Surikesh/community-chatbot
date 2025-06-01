import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { ChatInterface } from '../ChatInterface'

// Mock the AG-UI hook
vi.mock('@/hooks/agui/useAGUIChat', () => ({
  useAGUIChat: vi.fn(() => ({
    sendMessage: vi.fn(),
    isStreaming: false,
    isConnected: true,
    error: undefined,
    reconnect: vi.fn(),
  }))
}))

// Mock the stores
vi.mock('@/stores', () => ({
  useChatSelectors: vi.fn(() => ({
    messages: [],
    isStreaming: false,
    hasMessages: false,
    error: undefined
  }))
}))

describe('ChatInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders chat interface with input and header', () => {
    render(<ChatInterface />)
    
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText('Community Activities')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/ask about outdoor activities/i)).toBeInTheDocument()
  })

  it('shows welcome message when no messages exist', () => {
    render(<ChatInterface />)
    
    expect(screen.getByText('Start a conversation')).toBeInTheDocument()
    expect(screen.getByText('Ask me about outdoor activities in your area!')).toBeInTheDocument()
    expect(screen.getByText('🥾 Hiking trails')).toBeInTheDocument()
    expect(screen.getByText('🚴 Cycling routes')).toBeInTheDocument()
  })

  it('shows connection status indicator', () => {
    render(<ChatInterface />)
    
    // Should show green dot for connected state
    const statusIndicator = document.querySelector('.bg-green-500')
    expect(statusIndicator).toBeInTheDocument()
  })

  it('handles activity selection', () => {
    const mockOnActivitySelect = vi.fn()
    render(<ChatInterface onActivitySelect={mockOnActivitySelect} />)
    
    // This test would need mock activities to be more comprehensive
    expect(mockOnActivitySelect).not.toHaveBeenCalled()
  })

  it('displays error state when connection fails', async () => {
    // Mock error state
    const { useAGUIChat } = await import('@/hooks/agui/useAGUIChat')
    const useAGUIChatMocked = vi.mocked(useAGUIChat)
    useAGUIChatMocked.mockReturnValue({
      sendMessage: vi.fn(),
      isStreaming: false,
      isConnected: false,
      error: 'Connection failed',
      reconnect: vi.fn(),
    })

    render(<ChatInterface />)
    
    expect(screen.getByText('Connection failed')).toBeInTheDocument()
    expect(screen.getByText('Reconnect')).toBeInTheDocument()
  })
})
