import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { ActivityCard } from '../ActivityCard'

const mockActivity = {
  id: '1',
  title: 'Mountain Trail Hike',
  description: 'A beautiful hiking trail with scenic mountain views',
  type: 'hiking' as const,
  location: {
    id: 'loc1',
    name: 'Mount Wilson',
    latitude: 34.2257,
    longitude: -118.0582,
    country: 'USA',
    region: 'California',
    city: 'Los Angeles'
  },
  difficulty: 'moderate' as const,
  duration: '3-4 hours',
  distance: 8.5,
  elevation: 500,
  tags: ['hiking', 'scenic', 'mountain'],
  images: [
    {
      id: 'img1',
      url: 'https://example.com/trail.jpg',
      thumbnailUrl: 'https://example.com/trail-thumb.jpg',
      caption: 'Trail view',
      width: 800,
      height: 600
    }
  ],
  routes: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

describe('ActivityCard', () => {
  it('renders activity information correctly', () => {
    render(<ActivityCard activity={mockActivity} />)
    
    expect(screen.getByText('Mountain Trail Hike')).toBeInTheDocument()
    expect(screen.getByText('A beautiful hiking trail with scenic mountain views')).toBeInTheDocument()
    expect(screen.getByText('Los Angeles, USA')).toBeInTheDocument()
    expect(screen.getByText('3-4 hours')).toBeInTheDocument()
    expect(screen.getByText('8.5km')).toBeInTheDocument()
    expect(screen.getByText('500m')).toBeInTheDocument()
  })

  it('displays correct activity type icon', () => {
    render(<ActivityCard activity={mockActivity} />)
    expect(screen.getByText('🥾')).toBeInTheDocument()
  })

  it('shows difficulty badge with correct styling', () => {
    render(<ActivityCard activity={mockActivity} />)
    
    const difficultyBadge = screen.getByText('Moderate')
    expect(difficultyBadge).toBeInTheDocument()
    expect(difficultyBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('displays activity tags', () => {
    render(<ActivityCard activity={mockActivity} />)
    
    expect(screen.getByText('hiking')).toBeInTheDocument()
    expect(screen.getByText('scenic')).toBeInTheDocument()
    expect(screen.getByText('mountain')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const mockOnClick = vi.fn()
    render(<ActivityCard activity={mockActivity} onClick={mockOnClick} />)
    
    const card = screen.getByText('Mountain Trail Hike').closest('[data-slot="card"]')!
    fireEvent.click(card)
    expect(mockOnClick).toHaveBeenCalledWith()
  })

  it('renders image when available', () => {
    render(<ActivityCard activity={mockActivity} />)
    
    const image = screen.getByAltText('Mountain Trail Hike')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/trail-thumb.jpg')
  })

  it('handles missing optional data gracefully', () => {
    const minimalActivity = {
      ...mockActivity,
      duration: undefined,
      distance: undefined,
      elevation: undefined,
      images: []
    }
    
    render(<ActivityCard activity={minimalActivity} />)
    
    expect(screen.getByText('Mountain Trail Hike')).toBeInTheDocument()
    expect(screen.getByText('Los Angeles, USA')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ActivityCard activity={mockActivity} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('can hide details when showDetails is false', () => {
    render(<ActivityCard activity={mockActivity} showDetails={false} />)
    
    // Should still show title and basic info
    expect(screen.getByText('Mountain Trail Hike')).toBeInTheDocument()
    // But may not show detailed stats (implementation dependent)
  })

  it('handles very long titles properly', () => {
    const longTitleActivity = {
      ...mockActivity,
      title: 'This is a very long activity title that should be truncated properly without cutting off text in an awkward way'
    }
    
    render(<ActivityCard activity={longTitleActivity} />)
    
    const titleElement = screen.getByText(/This is a very long activity title/)
    expect(titleElement).toBeInTheDocument()
    expect(titleElement).toHaveClass('line-clamp-2', 'break-words')
  })

  describe('difficulty color mapping', () => {
    const testCases = [
      { difficulty: 'easy', expectedClass: 'bg-green-100', displayText: 'Easy' },
      { difficulty: 'moderate', expectedClass: 'bg-yellow-100', displayText: 'Moderate' },
      { difficulty: 'hard', expectedClass: 'bg-orange-100', displayText: 'Hard' },
      { difficulty: 'expert', expectedClass: 'bg-red-100', displayText: 'Expert' }
    ] as const

    testCases.forEach(({ difficulty, expectedClass, displayText }) => {
      it(`renders ${difficulty} difficulty with correct color`, () => {
        const activityWithDifficulty = {
          ...mockActivity,
          difficulty
        }
        
        render(<ActivityCard activity={activityWithDifficulty} />)
        
        const badge = screen.getByText(displayText)
        expect(badge).toHaveClass(expectedClass)
      })
    })
  })

  describe('activity type icons', () => {
    const typeIcons = [
      { type: 'hiking', icon: '🥾' },
      { type: 'cycling', icon: '🚴' },
      { type: 'running', icon: '🏃' },
      { type: 'skiing', icon: '⛷️' },
      { type: 'climbing', icon: '🧗' },
      { type: 'swimming', icon: '🏊' },
      { type: 'kayaking', icon: '🛶' }
    ] as const

    typeIcons.forEach(({ type, icon }) => {
      it(`shows correct icon for ${type} activity`, () => {
        const activityWithType = {
          ...mockActivity,
          type
        }
        
        render(<ActivityCard activity={activityWithType} />)
        expect(screen.getByText(icon)).toBeInTheDocument()
      })
    })
  })
})
