# 🧠 Project Context Guide
## Community Chatbot - AI Assistant Quick Reference

**🎯 Purpose**: This file provides AI coding assistants with immediate context about the Community Chatbot project structure, current state, and development patterns.

---

## 📋 Project Overview

### **What This Project Is**
A **real-time community chatbot** that helps users discover local outdoor activities through AI-powered conversations. Users chat with the bot to find hiking trails, cycling routes, restaurants, events, etc., with visual responses including activity cards, images, and interactive maps.

### **Key Technologies**
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + AG-UI Protocol
- **Backend**: Go + Fiber + GORM + PostGIS + OpenAI API
- **Database**: Supabase PostgreSQL with geospatial extensions
- **Storage**: Cloudinary (images) + Supabase Storage (GPX files)
- **Maps**: Mapbox GL JS for interactive route visualization

### **Core User Journey**
1. User asks: *"Find hiking trails near me"*
2. Bot streams response while showing: *"🔍 Searching for trails..."*
3. Bot returns activity cards with images, difficulty, duration, etc.
4. User clicks activity → sees detailed view with map and route
5. User can download GPX files, save favorites, etc.

---

## 🏗️ Project Structure Overview

**Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
**Backend**: Go with Fiber framework, GORM for database, PostGIS for geospatial
**Key Folders**: 
- `frontend/src/components/` - React components
- `frontend/src/hooks/` - Custom React hooks
- `backend/internal/` - Go application code
- `docs/` - AI instructions and planning documents


## 🔄 Development Workflow for AI Assistants

### **Starting a New Conversation**
1. **Read PROJECT_CONTEXT.md first** to understand project context
2. **Check the appropriate instruction file**:
   - Frontend work: `docs/instructions_frontend.md`
   - Backend work: `docs/instructions_backend.md`
3. **Review current planning**:
   - Frontend: `docs/PLANNING_FRONTEND.md`
   - Backend: `docs/PLANNING_BACKEND.md`
4. **Check active tasks**:
   - Frontend: `docs/TASK_FRONTEND.md`
   - Backend: `docs/TASK_BACKEND.md`

### **Working on Features**
- **One component/feature per conversation** for best results
- **Always write tests** for new functionality
- **Update task files** when completing work
- **Follow established patterns** shown in existing code

### **Code Quality Standards**
- **Frontend**: Components <200 lines, comprehensive tests, TypeScript strict mode
- **Backend**: Files <500 lines, proper error handling, godoc comments
- **Both**: Mobile-first design, proper error handling, security considerations

---

## 🎨 Current State Assessment

### **Frontend Status** *(as of latest update)*
- ✅ **Foundation**: Next.js 14 setup with TypeScript, Tailwind CSS
- ✅ **Core Chat**: ChatInterface, MessageBubble, ChatInput components
- ✅ **Activity Display**: ActivityCard with responsive design (recent text cutoff fix)
- ✅ **Testing**: Vitest setup with comprehensive test coverage
- ✅ **AG-UI Integration**: Custom hooks for streaming events
- 🔄 **In Progress**: Map integration, image handling optimization
- ❌ **Missing**: User authentication, activity creation, offline support

### **Backend Status** *(check TASK_BACKEND.md for latest)*
- ✅ **Foundation**: Go + Fiber setup with proper project structure
- ✅ **Database**: GORM models with PostGIS for geospatial data
- ✅ **AG-UI Streaming**: Real-time event streaming to frontend
- 🔄 **In Progress**: Activity search optimization, image upload handling
- ❌ **Missing**: User management, activity moderation, analytics

### **Integration Status**
- ✅ **Basic Flow**: Frontend ↔ Backend communication working
- ✅ **Real-time Chat**: AG-UI protocol implementation functional
- 🔄 **Activity Data**: Working but needs performance optimization
- ❌ **Missing**: Map data integration, GPX route handling


## 🛠️ Common Development Tasks

### **Frontend Tasks**
```bash
# Start development server
cd frontend && npm run dev

# Run tests  
npm test                    # All tests
npm test ActivityCard       # Specific component
npm run test:watch         # Watch mode

# Check code quality
npm run lint               # ESLint
npm run type-check         # TypeScript validation
```

### **Backend Tasks**
```bash
# Start backend server
cd backend && go run cmd/server/main.go

# Run tests
go test ./...              # All tests
go test -v ./internal/handlers  # Specific package
go test -cover ./...       # With coverage
```

### **Common Issues & Solutions**

#### **Frontend Issues**
- **AG-UI connection fails**: Check backend server is running on correct port
- **Component tests fail**: Ensure mocks are properly setup for AG-UI hooks
- **TypeScript errors**: Check type definitions in `src/types/`
- **Styling issues**: Verify Tailwind classes and responsive breakpoints

#### **Backend Issues**
- **Database connection**: Check Supabase connection string in .env
- **CORS errors**: Verify middleware configuration in main.go
- **AG-UI streaming**: Check Server-Sent Events headers and event formatting

---

## 🧩 Key Patterns & Conventions

### **Frontend Patterns**
```typescript
// Component structure
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks and state
  // 2. Event handlers  
  // 3. Effects
  // 4. Render logic
}

// AG-UI event handling
const { messages, sendMessage, isStreaming } = useAGUIChat({
  endpoint: '/api/chat/stream',
  onError: handleError,
  onToolExecution: handleToolUpdate
})
```


### **Backend Patterns**
```go
// Handler structure
func HandlerName(c *fiber.Ctx) error {
    // 1. Parse request
    // 2. Validate input
    // 3. Call service
    // 4. Return response
}

// Service structure
func (s *ServiceName) MethodName(ctx context.Context, input Input) (Output, error) {
    // 1. Business logic
    // 2. Repository calls
    // 3. Error handling
}
```

---

## 🎯 Current Focus Areas

### **Immediate Priorities**
1. **Text cutoff fixes** in ActivityCard (recently completed ✅)
2. **Map integration** with Mapbox for activity locations
3. **Image optimization** with proper loading states
4. **Performance optimization** for large activity lists

### **Next Sprint Goals**
1. **User location detection** for nearby activity search
2. **Activity filtering** by category, difficulty, distance
3. **Route visualization** with GPX file support
4. **Offline support** with service workers

### **Technical Debt**
- **Frontend**: Need better error boundaries, loading states
- **Backend**: API rate limiting, input validation improvements
- **Both**: Security audit, performance monitoring setup

---

## 📚 Reference Links

### **Key Files to Reference**
- **Type Definitions**: `frontend/src/types/index.ts`
- **Database Models**: `backend/internal/models/`
- **API Handlers**: `backend/internal/handlers/`
- **Main Components**: `frontend/src/components/`

### **Environment Setup**
- **Frontend**: Copy `.env.example` to `.env.local`
- **Backend**: Copy `.env.example` to `.env`
- **Database**: Supabase project with PostGIS extension
- **Storage**: Cloudinary account for image optimization

---

**💡 Pro Tip for AI Assistants**: When in doubt, check the test files! They often show the expected behavior and usage patterns for components and functions.

**🚨 Important**: Always update the relevant TASK_*.md file when completing work, and update this file if major architectural changes are made.
