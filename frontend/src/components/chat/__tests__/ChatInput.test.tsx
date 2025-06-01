import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { ChatInput } from '../ChatInput'

describe('ChatInput', () => {
  const mockOnSendMessage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders input field and send button', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('calls onSendMessage when form is submitted with text', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByRole('textbox')
    const sendButton = screen.getByRole('button', { name: /send message/i })

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('does not send empty messages', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const sendButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(sendButton)

    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })

  it('clears input after sending message', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByRole('textbox') as HTMLTextAreaElement
    const sendButton = screen.getByRole('button', { name: /send message/i })

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    expect(input.value).toBe('')
  })

  it('sends message on Enter key press', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
  })

  it('does not send message on Shift+Enter (allows new line)', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true })

    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })

  it('disables input when disabled prop is true', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={true} />)
    
    const input = screen.getByRole('textbox')
    const sendButton = screen.getByRole('button', { name: /send message/i })

    expect(input).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })

  it('shows character count when approaching limit', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByRole('textbox')
    const longMessage = 'a'.repeat(850) // Over 80% of 1000 char limit

    fireEvent.change(input, { target: { value: longMessage } })

    expect(screen.getByText('850/1000')).toBeInTheDocument()
  })

  it('shows helper text about keyboard shortcuts', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    expect(screen.getByText(/press enter to send/i)).toBeInTheDocument()
    expect(screen.getByText(/shift\+enter for new line/i)).toBeInTheDocument()
  })
})
