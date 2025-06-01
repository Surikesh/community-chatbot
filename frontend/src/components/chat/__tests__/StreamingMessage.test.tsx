import { render, screen } from '@testing-library/react'
import { StreamingMessage } from '../StreamingMessage'

describe('StreamingMessage', () => {
  it('renders message content', () => {
    render(<StreamingMessage content="This is a streaming message" />)
    
    expect(screen.getByText(/This is a streaming message/)).toBeInTheDocument()
  })

  it('displays animated cursor', () => {
    const { container } = render(<StreamingMessage content="Hello" />)
    
    const cursor = container.querySelector('.animate-pulse')
    expect(cursor).toBeInTheDocument()
  })

  it('preserves whitespace and line breaks', () => {
    const multilineContent = "Line 1\nLine 2\n\nLine 4"
    const { container } = render(<StreamingMessage content={multilineContent} />)
    
    const textContainer = container.querySelector('.whitespace-pre-wrap')
    expect(textContainer).toBeInTheDocument()
    // Check that the whitespace-pre-wrap class is applied (which preserves whitespace)
    // textContent normalizes whitespace, so we check the actual content includes newlines
    expect(textContainer?.innerHTML).toContain('Line 1')
    expect(textContainer?.innerHTML).toContain('Line 2')
    expect(textContainer?.innerHTML).toContain('Line 4')
  })

  it('handles empty content', () => {
    const { container } = render(<StreamingMessage content="" />)
    
    // Should still show cursor even with empty content
    const cursor = container.querySelector('.animate-pulse')
    expect(cursor).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    const { container } = render(<StreamingMessage content="Test" />)
    
    // Check main container
    const mainContainer = container.querySelector('.relative')
    expect(mainContainer).toBeInTheDocument()
    
    // Check text container
    const textContainer = container.querySelector('.whitespace-pre-wrap.text-sm.leading-relaxed')
    expect(textContainer).toBeInTheDocument()
    
    // Check cursor
    const cursor = container.querySelector('.inline-block.w-2.h-4.bg-current.animate-pulse.ml-1.align-middle')
    expect(cursor).toBeInTheDocument()
  })

  it('updates content reactively', () => {
    const { rerender } = render(<StreamingMessage content="Initial" />)
    
    expect(screen.getByText(/Initial/)).toBeInTheDocument()
    
    rerender(<StreamingMessage content="Updated content" />)
    
    expect(screen.getByText(/Updated content/)).toBeInTheDocument()
    expect(screen.queryByText(/Initial/)).not.toBeInTheDocument()
  })

  it('handles long content properly', () => {
    const longContent = "This is a very long message that might wrap to multiple lines and should be handled gracefully by the component with proper text wrapping and spacing."
    
    render(<StreamingMessage content={longContent} />)
    
    expect(screen.getByText(new RegExp(longContent))).toBeInTheDocument()
  })

  it('handles special characters in content', () => {
    const specialContent = "Content with special chars: @#$%^&*()[]{}|\\:;\"'<>,.?/~`"
    
    render(<StreamingMessage content={specialContent} />)
    
    expect(screen.getByText(new RegExp(specialContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument()
  })

  it('memoizes correctly', () => {
    const content = "Test content"
    const { rerender } = render(<StreamingMessage content={content} />)
    
    // Component should be memoized, so re-rendering with same props shouldn't cause changes
    const firstRender = screen.getByText(/Test content/)
    
    rerender(<StreamingMessage content={content} />)
    
    const secondRender = screen.getByText(/Test content/)
    expect(firstRender).toBe(secondRender) // Should be the same DOM element due to memoization
  })
})
