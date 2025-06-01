import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { MessageList } from '../MessageList'

const mockMessages = [
  {
    id: '1',
    type: 'user' as const,
    content: 'Find hiking trails',
    timestamp: '2024-01-01T12:00:00Z',
    isStreaming: false
  },
  {
    id: '2',
    type: 'assistant' as const,
    content: 'I found some trails for you!',
    timestamp: '2024-01-01T12:01:00Z',
    isStreaming: false,
    activities: [
      {
        id: 'act1',
        title: 'Mountain Trail',
        description: 'Beautiful trail',
        type: 'hiking' as const,
        location: {
          id: 'loc1',
          name: 'Mount Wilson',
          latitude: 34.2257,
          longitude: -118.0582,
          country: 'USA'
        },
        difficulty: 'moderate' as const,
        tags: ['hiking'],
        images: [],
        routes: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  },
  {
    id: '3',
    type: 'user' as const,
    content: 'Show me more details',
    timestamp: '2024-01-01T12:02:00Z',
    isStreaming: false
  },
  {
    id: '4',
    type: 'user' as const,
    content: 'Actually, show cycling routes instead',
    timestamp: '2024-01-01T12:03:00Z',
    isStreaming: false
  }
]

describe('MessageList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all messages', () => {
    render(<MessageList messages={mockMessages} />)
    
    expect(screen.getByText('Find hiking trails')).toBeInTheDocument()
    expect(screen.getByText('I found some trails for you!')).toBeInTheDocument()
    expect(screen.getByText('Show me more details')).toBeInTheDocument()
    expect(screen.getByText('Actually, show cycling routes instead')).toBeInTheDocument()
  })

  it('returns null when no messages provided', () => {
    const { container } = render(<MessageList messages={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows avatar for first message of each type', () => {
    render(<MessageList messages={mockMessages} />)
    
    // Should show avatars: User (first), Assistant, User (after assistant)
    // But NOT for the second consecutive user message
    const avatars = screen.getAllByText(/^(U|AI)$/)
    expect(avatars).toHaveLength(3) // First user, assistant, second user (after assistant)
  })

  it('hides avatar for consecutive messages from same sender', () => {
    render(<MessageList messages={mockMessages} />)
    
    // The last user message should not have an avatar since it follows another user message
    const userAvatars = screen.getAllByText('U')
    expect(userAvatars).toHaveLength(2) // Not 3, because last consecutive user message hides avatar
  })

  it('passes onActivityClick to MessageBubble components', () => {
    const mockOnActivityClick = vi.fn()
    render(<MessageList messages={mockMessages} onActivityClick={mockOnActivityClick} />)
    
    // Click on the activity in the assistant message
    fireEvent.click(screen.getByText('Mountain Trail'))
    expect(mockOnActivityClick).toHaveBeenCalledWith(mockMessages[1].activities![0])
  })

  it('applies correct spacing between messages', () => {
    const { container } = render(<MessageList messages={mockMessages} />)
    
    const messageContainer = container.querySelector('.space-y-4')
    expect(messageContainer).toBeInTheDocument()
  })

  it('handles single message correctly', () => {
    const singleMessage = [mockMessages[0]]
    render(<MessageList messages={singleMessage} />)
    
    expect(screen.getByText('Find hiking trails')).toBeInTheDocument()
    expect(screen.getByText('U')).toBeInTheDocument() // Should show avatar for single message
  })

  it('handles alternating message types correctly', () => {
    const alternatingMessages = [
      mockMessages[0], // user
      mockMessages[1], // assistant  
      mockMessages[2]  // user
    ]
    
    render(<MessageList messages={alternatingMessages} />)
    
    // All messages should show avatars since they alternate
    expect(screen.getAllByText('U')).toHaveLength(2)
    expect(screen.getAllByText('AI')).toHaveLength(1)
  })

  describe('avatar visibility logic', () => {
    it('shows avatar when message type changes', () => {
      const messages = [
        { ...mockMessages[0], type: 'user' as const },
        { ...mockMessages[1], type: 'assistant' as const },
        { ...mockMessages[2], type: 'user' as const }
      ]
      
      render(<MessageList messages={messages} />)
      
      // Each message type change should show avatar
      expect(screen.getAllByText(/^(U|AI)$/)).toHaveLength(3)
    })

    it('hides avatar for consecutive messages of same type', () => {
      const consecutiveUserMessages = [
        { ...mockMessages[0], id: '1', type: 'user' as const },
        { ...mockMessages[1], id: '2', type: 'user' as const, content: 'Second user message' },
        { ...mockMessages[2], id: '3', type: 'user' as const, content: 'Third user message' }
      ]
      
      render(<MessageList messages={consecutiveUserMessages} />)
      
      // Only first message should show avatar
      expect(screen.getAllByText('U')).toHaveLength(1)
    })
  })

  it('maintains proper message order', () => {
    render(<MessageList messages={mockMessages} />)
    
    const messageTexts = screen.getAllByText(/Find hiking trails|I found some trails|Show me more details|Actually, show cycling/)
    expect(messageTexts).toHaveLength(4)
    
    // Verify order by checking the DOM structure
    const container = screen.getByText('Find hiking trails').closest('.space-y-4')
    const messageElements = container?.children
    
    expect(messageElements?.[0]).toHaveTextContent('Find hiking trails')
    expect(messageElements?.[1]).toHaveTextContent('I found some trails')
    expect(messageElements?.[2]).toHaveTextContent('Show me more details')
    expect(messageElements?.[3]).toHaveTextContent('Actually, show cycling')
  })
})
