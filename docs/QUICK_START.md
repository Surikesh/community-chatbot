# 🚀 AI Assistant Quick Start
## Community Chatbot Project

**📍 Location**: `/Users/dmitrysurkov/Developer/Personal/community-chatbot`

## 🎯 What This Is
Real-time community chatbot for discovering local outdoor activities. Users chat to find hiking trails, cycling routes, etc. with visual responses.

**Stack**: Next.js 14 + Go + Supabase + AG-UI Protocol

## 📋 Before Starting Work

### **Read These First**
- `docs/PROJECT_CONTEXT.md` - Full project details
- Frontend: `docs/instructions_frontend.md` + `docs/PLANNING_FRONTEND.md`  
- Backend: `docs/instructions_backend.md` + `docs/PLANNING_BACKEND.md`

### **Check Current Tasks**
- Frontend: `docs/TASK_FRONTEND.md`
- Backend: `docs/TASK_BACKEND.md`

## 🏗️ Key Structure
```
├── frontend/src/components/chat/      # Chat interface
├── frontend/src/components/activities/ # Activity display
├── backend/internal/handlers/         # API endpoints
├── backend/internal/services/         # Business logic
└── docs/                             # Instructions & planning
```

## 🎨 Current Status
- ✅ Chat interface working, ActivityCard fixed (text cutoff)
- ✅ AG-UI streaming functional  
- 🔄 Next: Map integration, image optimization

## 🛠️ Quick Commands
```bash
# Frontend: cd frontend && npm run dev
# Backend: cd backend && go run cmd/server/main.go
```

**Key Rules**: Components <200 lines, always test, one feature per conversation

