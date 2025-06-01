# 🧠 Frontend AI Coding Assistant Instructions
## Community Chatbot - Next.js + AG-UI + TypeScript

### 🔑 Golden Rules for Frontend Development

1. **Use markdown files to manage the frontend** (`README_FRONTEND.md`, `PLANNING_FRONTEND.md`, `TASK_FRONTEND.md`)
2. **Keep components under 200 lines**. Split into smaller components when needed
3. **Start fresh conversations often**. Long threads degrade response quality
4. **One component/feature per message**. Don't overload the model
5. **Test every component with Vitest + Testing Library**. Write tests as you build
6. **Be specific about UI requirements**. Provide examples and mockups when possible
7. **Write TypeScript strictly**. No `any` types unless absolutely necessary
8. **Document component props and usage**. Use JSDoc for complex components
9. **Implement environment variables yourself**. Don't trust LLM with API keys

---

## 🧠 Frontend Planning & Task Management

### PLANNING_FRONTEND.md
- **Purpose**: Frontend architecture, component structure, state management, styling approach
- **Prompt to AI**: "Use the structure and decisions outlined in PLANNING_FRONTEND.md"
- **Update when**: Adding new features, changing architecture, or updating dependencies

### TASK_FRONTEND.md  
- **Purpose**: Current frontend tasks, component backlog, UI/UX improvements
- **Format**: Bullet list of active work, component milestones, discovered issues
- **Prompt to AI**: "Update TASK_FRONTEND.md to mark component XYZ as done and add ABC as new task"

---

## ⚙️ Global Rules for Frontend AI Assistant

### 🔄 Project Awareness & Context
- **Always read `PLANNING_FRONTEND.md`** at the start of new conversations to understand component architecture, styling decisions, and state management patterns
- **Check `TASK_FRONTEND.md`** before starting new component work. Add missing tasks with brief description and date
- **Use consistent naming conventions**: PascalCase for components, camelCase for functions/variables, kebab-case for files
- **Follow the established folder structure** in `src/` as defined in planning

### 🧱 Component Structure & Modularity
- **Never create a component file longer than 200 lines**. Split into sub-components or custom hooks
- **Organize components by feature**, not by type:
  ```
  src/
  ├── components/
  │   ├── chat/
  │   │   ├── ChatInterface.tsx
  │   │   ├── MessageBubble.tsx
  │   │   └── __tests__/
  │   ├── activities/
  │   │   ├── ActivityCard.tsx
  │   │   ├── ActivityMap.tsx
  │   │   └── __tests__/
  │   └── ui/ (shadcn components)
  ```
- **Use barrel exports** (`index.ts`) for cleaner imports
- **Separate concerns**: Pure UI components, business logic hooks, and API calls
### 🧪 Testing & Reliability
- **Always create Vitest + Testing Library tests** for new components
- **Test files should live alongside components** in `__tests__/` folders
- **For each component, include at least**:
  - 1 test for default rendering
  - 1 test for user interactions
  - 1 test for error states
  - 1 test for loading states (if applicable)
- **Mock external dependencies**: API calls, AG-UI hooks, external services
- **Use data-testid attributes** for complex component testing

### 🎨 Styling & UI Conventions
- **Use Tailwind CSS** for styling with shadcn/ui components as base
- **Follow mobile-first approach**: Design for mobile, enhance for desktop
- **Use CSS custom properties** for theme values and consistent spacing
- **Implement dark mode support** using next-themes
- **Accessibility first**: Always include proper ARIA labels, keyboard navigation, and semantic HTML

### 🔌 AG-UI Integration Standards
- **Use custom hooks** for AG-UI event handling: `useAGUIChat`, `useAGUIStream`
- **Handle all AG-UI event types**: message content, tool calls, state updates, errors
- **Implement proper loading states** during streaming
- **Show visual feedback** for tool execution (searching, fetching images, etc.)
- **Handle reconnection** and error recovery gracefully

### 📱 State Management
- **Use React Server Components** when possible for data fetching
- **Client state**: useState for local component state, useReducer for complex state
- **Server state**: TanStack Query for API calls and caching
- **Global state**: Zustand for user preferences and chat history
- **Form state**: React Hook Form with Zod validation

### ✅ Task Completion
- **Mark completed tasks in `TASK_FRONTEND.md`** immediately after finishing
- **Add new component requirements** discovered during development
- **Update component documentation** in README_FRONTEND.md when adding features

### 📚 Documentation & TypeScript
- **Write JSDoc comments** for complex components and custom hooks:
  ```typescript
  /**
   * Chat interface component with AG-UI streaming support
   * 
   * @param apiEndpoint - Backend streaming endpoint URL
   * @param onActivitySelect - Callback when user selects an activity
   */
  ```
- **Use strict TypeScript**: Enable all strict flags, no implicit any
- **Define interfaces** for all props, API responses, and AG-UI events
- **Export types** from dedicated `types/` files for reuse

### 🔒 Security & Performance
- **Sanitize user input** before displaying (especially in chat)
- **Implement proper error boundaries** for graceful failure handling
- **Use React.memo** for expensive components that re-render frequently
- **Lazy load** non-critical components and routes
- **Optimize images** using Next.js Image component with proper sizing

### 🧠 AI Behavior Rules
- **Never assume component structure exists** - always check file paths
- **Never use deprecated React patterns** (class components, legacy lifecycle methods)
- **Always confirm shadcn/ui components** are properly installed before using
- **Never overwrite existing components** unless explicitly instructed
- **Ask for clarification** on UI/UX requirements if ambiguous

---

## 🧪 Frontend Testing Standards

### Component Testing Template:
```typescript
// __tests__/ChatInterface.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { ChatInterface } from '../ChatInterface'

// Mock AG-UI hook
vi.mock('@/hooks/useAGUIChat', () => ({
  useAGUIChat: vi.fn(() => ({
    messages: [],
    sendMessage: vi.fn(),
    isStreaming: false,
  }))
}))

describe('ChatInterface', () => {
  it('renders chat input and message area', () => {
    render(<ChatInterface />)
    expect(screen.getByRole('textbox', { name: /chat input/i })).toBeInTheDocument()
    expect(screen.getByTestId('message-area')).toBeInTheDocument()
  })

  it('sends message when form is submitted', async () => {
    const mockSendMessage = vi.fn()
    vi.mocked(useAGUIChat).mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      isStreaming: false,
    })

    render(<ChatInterface />)
    const input = screen.getByRole('textbox')
    const sendButton = screen.getByRole('button', { name: /send/i })

    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Hello')
    })
  })

  it('disables input when streaming', () => {
    vi.mocked(useAGUIChat).mockReturnValue({
      messages: [],
      sendMessage: vi.fn(),
      isStreaming: true,
    })

    render(<ChatInterface />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})
```

### Custom Hook Testing:
```typescript
// __tests__/useAGUIChat.test.ts
import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useAGUIChat } from '../useAGUIChat'

// Mock fetch
global.fetch = vi.fn()

describe('useAGUIChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends message and handles streaming response', async () => {
    const mockResponse = new Response(
      'data: {"type": "message", "content": "Hello"}\n\n',
      { status: 200 }
    )
    vi.mocked(fetch).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAGUIChat({ endpoint: '/api/chat' }))

    await act(async () => {
      await result.current.sendMessage('Hello')
    })

    expect(fetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' })
    })
  })
})
```

---

## 🚀 Initial Frontend Prompt Template

```
I'm building a community chatbot frontend with Next.js 14, TypeScript, Tailwind CSS, and AG-UI integration. 

Key requirements:
- Real-time chat interface with streaming responses
- Display activities with images and maps
- Mobile-first responsive design
- Comprehensive testing with Vitest
- Integration with Go backend via AG-UI protocol

Please:
1. Read PLANNING_FRONTEND.md for architecture decisions
2. Check TASK_FRONTEND.md for current priorities  
3. Set up the initial component structure following our conventions
4. Implement basic AG-UI streaming with proper TypeScript types
5. Create tests for all components
6. Update documentation files

Focus on creating a solid foundation that's easily testable and maintainable.
```
