import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { MessageBubble } from '../MessageBubble'

const mockUserMessage = {
  id: '1',
  type: 'user' as const,
  content: 'Find hiking trails near me',
  timestamp: '2024-01-01T12:00:00Z',
  isStreaming: false
}

const mockAssistantMessage = {
  id: '2',
  type: 'assistant' as const,
  content: 'I found some great hiking trails for you!',
  timestamp: '2024-01-01T12:01:00Z',
  isStreaming: false,
  activities: [
    {
      id: 'act1',
      title: 'Mountain Trail',
      description: 'Beautiful mountain hike',
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
  ],
  images: [
    {
      id: 'img1',
      url: 'https://example.com/trail.jpg',
      thumbnailUrl: 'https://example.com/trail-thumb.jpg',
      caption: 'Trail view',
      width: 800,
      height: 600
    }
  ]
}

const mockErrorMessage = {
  id: '3',
  type: 'error' as const,
  content: 'Failed to load activities',
  timestamp: '2024-01-01T12:02:00Z',
  isStreaming: false
}

const mockStreamingMessage = {
  id: '4',
  type: 'assistant' as const,
  content: 'Looking for trails...',
  timestamp: '2024-01-01T12:03:00Z',
  isStreaming: true
}

describe('MessageBubble', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders user message correctly', () => {
    render(<MessageBubble message={mockUserMessage} />)
    
    expect(screen.getByText('Find hiking trails near me')).toBeInTheDocument()
    expect(screen.getByText('U')).toBeInTheDocument() // User avatar
    expect(screen.getByText('07:00 PM')).toBeInTheDocument() // Formatted time in 12-hour format
  })

  it('renders assistant message correctly', () => {
    render(<MessageBubble message={mockAssistantMessage} />)
    
    expect(screen.getByText('I found some great hiking trails for you!')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument() // Assistant avatar
  })

  it('renders error message with correct styling', () => {
    render(<MessageBubble message={mockErrorMessage} />)
    
    expect(screen.getByText('Failed to load activities')).toBeInTheDocument()
    expect(screen.getByText('!')).toBeInTheDocument() // Error avatar
  })

  it('shows streaming indicator for streaming messages', () => {
    render(<MessageBubble message={mockStreamingMessage} />)
    
    expect(screen.getByText('Looking for trails...')).toBeInTheDocument()
    expect(screen.getByText('●')).toBeInTheDocument() // Streaming indicator
  })

  it('displays activities when present', () => {
    render(<MessageBubble message={mockAssistantMessage} />)
    
    expect(screen.getByText('1 activities found')).toBeInTheDocument()
    expect(screen.getByText('Mountain Trail')).toBeInTheDocument()
  })

  it('displays images when present', () => {
    render(<MessageBubble message={mockAssistantMessage} />)
    
    const image = screen.getByAltText('Trail view')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/trail-thumb.jpg')
  })

  it('calls onActivityClick when activity is clicked', () => {
    const mockOnActivityClick = vi.fn()
    render(
      <MessageBubble 
        message={mockAssistantMessage} 
        onActivityClick={mockOnActivityClick} 
      />
    )
    
    fireEvent.click(screen.getByText('Mountain Trail'))
    expect(mockOnActivityClick).toHaveBeenCalledWith(mockAssistantMessage.activities![0])
  })

  it('can hide avatar when showAvatar is false', () => {
    render(<MessageBubble message={mockUserMessage} showAvatar={false} />)
    
    expect(screen.queryByText('U')).not.toBeInTheDocument()
  })

  it('formats timestamp correctly', () => {
    const messageWithSpecificTime = {
      ...mockUserMessage,
      timestamp: '2024-01-01T14:30:00Z'
    }
    
    render(<MessageBubble message={messageWithSpecificTime} />)
    expect(screen.getByText('09:30 PM')).toBeInTheDocument() // 14:30 UTC = 9:30 PM local time
  })

  it('shows multiple activities count correctly', () => {
    const messageWithMultipleActivities = {
      ...mockAssistantMessage,
      activities: [
        mockAssistantMessage.activities![0],
        { ...mockAssistantMessage.activities![0], id: 'act2', title: 'River Trail' }
      ]
    }
    
    render(<MessageBubble message={messageWithMultipleActivities} />)
    expect(screen.getByText('2 activities found')).toBeInTheDocument()
  })

  it('shows total count when more activities available', () => {
    const messageWithTotalCount = {
      ...mockAssistantMessage,
      metadata: { totalCount: 10 }
    }
    
    render(<MessageBubble message={messageWithTotalCount} />)
    expect(screen.getByText('(showing first 1 of 10)')).toBeInTheDocument()
  })

  it('handles multiple images with overflow indicator', () => {
    const messageWithManyImages = {
      ...mockAssistantMessage,
      images: [
        mockAssistantMessage.images![0],
        { ...mockAssistantMessage.images![0], id: 'img2' },
        { ...mockAssistantMessage.images![0], id: 'img3' },
        { ...mockAssistantMessage.images![0], id: 'img4' },
        { ...mockAssistantMessage.images![0], id: 'img5' },
        { ...mockAssistantMessage.images![0], id: 'img6' }
      ]
    }
    
    render(<MessageBubble message={messageWithManyImages} />)
    expect(screen.getByText('+2 more images')).toBeInTheDocument()
  })

  it('handles message without activities or images', () => {
    const simpleMessage = {
      ...mockAssistantMessage,
      activities: undefined,
      images: undefined
    }
    
    render(<MessageBubble message={simpleMessage} />)
    expect(screen.getByText('I found some great hiking trails for you!')).toBeInTheDocument()
    expect(screen.queryByText('activities found')).not.toBeInTheDocument()
  })

  describe('message alignment', () => {
    it('aligns user messages to the right', () => {
      const { container } = render(<MessageBubble message={mockUserMessage} />)
      
      const messageContainer = container.querySelector('.flex-row-reverse')
      expect(messageContainer).toBeInTheDocument()
    })

    it('aligns assistant messages to the left', () => {
      const { container } = render(<MessageBubble message={mockAssistantMessage} />)
      
      const messageContainer = container.querySelector('.flex-row:not(.flex-row-reverse)')
      expect(messageContainer).toBeInTheDocument()
    })
  })
})
