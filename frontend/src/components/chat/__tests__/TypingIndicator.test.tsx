import { render, screen } from '@testing-library/react'
import { TypingIndicator } from '../TypingIndicator'

describe('TypingIndicator', () => {
  it('renders typing indicator with AI avatar', () => {
    render(<TypingIndicator />)
    
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('displays animated dots', () => {
    const { container } = render(<TypingIndicator />)
    
    // Check for three animated dots
    const animatedDots = container.querySelectorAll('.animate-bounce')
    expect(animatedDots).toHaveLength(3)
  })

  it('has correct animation delays', () => {
    const { container } = render(<TypingIndicator />)
    
    const dots = container.querySelectorAll('.animate-bounce')
    
    // First dot should not have delay class
    expect(dots[0]).not.toHaveClass('delay-100', 'delay-200')
    
    // Second dot should have delay-100
    expect(dots[1]).toHaveClass('delay-100')
    
    // Third dot should have delay-200
    expect(dots[2]).toHaveClass('delay-200')
  })

  it('has proper styling classes', () => {
    const { container } = render(<TypingIndicator />)
    
    // Check main container
    const mainContainer = container.querySelector('.flex.items-center.gap-3.mt-4')
    expect(mainContainer).toBeInTheDocument()
    
    // Check avatar container
    const avatarContainer = container.querySelector('.w-8.h-8.rounded-full.bg-secondary')
    expect(avatarContainer).toBeInTheDocument()
    
    // Check message bubble
    const messageBubble = container.querySelector('.bg-muted.rounded-lg.px-4.py-3')
    expect(messageBubble).toBeInTheDocument()
    
    // Check dots container
    const dotsContainer = container.querySelector('.flex.items-center.gap-1')
    expect(dotsContainer).toBeInTheDocument()
  })

  it('dots have correct size and styling', () => {
    const { container } = render(<TypingIndicator />)
    
    const dots = container.querySelectorAll('.w-2.h-2.bg-muted-foreground\\/60.rounded-full')
    expect(dots).toHaveLength(3)
    
    dots.forEach(dot => {
      expect(dot).toHaveClass('w-2', 'h-2', 'rounded-full', 'animate-bounce')
    })
  })

  it('renders consistently on multiple renders', () => {
    const { rerender } = render(<TypingIndicator />)
    
    expect(screen.getByText('AI')).toBeInTheDocument()
    
    rerender(<TypingIndicator />)
    
    expect(screen.getByText('AI')).toBeInTheDocument()
  })
})
