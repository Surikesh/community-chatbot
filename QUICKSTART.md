# 🚀 Quick Start Guide
## Community Chatbot Development

## 📁 Project Structure Overview

```
community-chatbot/
├── 📖 docs/                           # Documentation & AI Instructions
│   ├── instructions_frontend.md       # AI coding rules for frontend
│   ├── instructions_backend.md        # AI coding rules for backend  
│   ├── PLANNING_FRONTEND.md           # Frontend architecture
│   ├── PLANNING_BACKEND.md            # Backend architecture
│   ├── TASK_FRONTEND.md               # Frontend task tracking
│   └── TASK_BACKEND.md                # Backend task tracking
│
├── 🎨 frontend/                       # Next.js Application
│   ├── src/app/                       # Next.js App Router
│   ├── src/components/                # React components
│   ├── src/hooks/                     # Custom hooks (AG-UI integration)
│   ├── src/lib/                       # Utilities and configurations
│   └── package.json                   # Dependencies
│
├── 🔧 backend/                        # Go Application
│   ├── cmd/server/                    # Application entry point
│   ├── internal/                      # Private application code
│   │   ├── handlers/                  # HTTP request handlers
│   │   ├── services/                  # Business logic
│   │   ├── repositories/              # Data access layer
│   │   ├── models/                    # GORM database models
│   │   └── utils/                     # Shared utilities
│   ├── migrations/                    # Database migrations
│   ├── tests/                         # Test files
│   └── go.mod                         # Go dependencies
│
├── 🐳 docker-compose.yml              # Local development environment
├── 🔐 .env.example                    # Environment variables template
├── ⚙️ setup.sh                        # Automated setup script
└── 📋 README.md                       # This file
```

## 🏃‍♂️ Getting Started (2 Minutes)

### Option A: Automated Setup (Recommended)
```bash
# 1. Clone and navigate to project
cd /Users/dmitrysurkov/Developer/Personal/community-chatbot

# 2. Run setup script
./setup.sh

# 3. Add your API keys to .env file
# Required: OPENAI_API_KEY, CLOUDINARY_URL, NEXT_PUBLIC_MAPBOX_TOKEN
```

### Option B: Manual Setup
```bash
# 1. Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# 2. Start services
docker-compose up -d

# 3. Access applications
# Frontend: http://localhost:3000
# Backend: http://localhost:8080/health
```

## 🔑 Required API Keys

1. **OpenAI API Key** - [Get from OpenAI](https://platform.openai.com/api-keys)
2. **Cloudinary Account** - [Sign up](https://cloudinary.com/) for image storage
3. **Mapbox Token** - [Get from Mapbox](https://account.mapbox.com/) for maps
4. **Supabase Project** - [Create project](https://supabase.com/) for database

## 🧠 AI Development Workflow

### For Frontend Work:
```bash
# 1. Always start AI conversations with:
"Read docs/instructions_frontend.md and docs/PLANNING_FRONTEND.md"

# 2. Check current tasks:
"Check docs/TASK_FRONTEND.md for current priorities"

# 3. Update tasks as you work:
"Update TASK_FRONTEND.md to mark component XYZ as done and add ABC as new task"
```

### For Backend Work:
```bash
# 1. Always start AI conversations with:
"Read docs/instructions_backend.md and docs/PLANNING_BACKEND.md"

# 2. Check current tasks:
"Check docs/TASK_BACKEND.md for current priorities"

# 3. Update tasks as you work:
"Update TASK_BACKEND.md to mark endpoint XYZ as done and add ABC as new task"
```

## 🛠️ Development Commands

### Docker Management
```bash
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs backend   # View backend logs
docker-compose logs frontend  # View frontend logs
docker-compose restart backend # Restart backend only
```

### Frontend Development
```bash
cd frontend
npm run dev                   # Start development server
npm run test                  # Run tests
npm run test:watch            # Run tests in watch mode
npm run build                 # Build for production
npm run lint                  # Check code style
```

### Backend Development
```bash
cd backend
go run cmd/server/main.go     # Start development server
go test ./...                 # Run all tests
go test -v ./...              # Run tests with verbose output
go test -cover ./...          # Run tests with coverage
go mod tidy                   # Clean up dependencies
```

## 🧪 Testing Strategy

### Frontend Testing
- **Unit Tests**: Every component needs tests
- **Integration Tests**: AG-UI streaming flows
- **Testing Tools**: Vitest + Testing Library
- **Coverage Target**: >80%

### Backend Testing
- **Unit Tests**: Every function/service needs tests
- **Integration Tests**: Database operations, API endpoints
- **Testing Tools**: Go testing + testify + mocks
- **Coverage Target**: >80%

## 📦 Key Technologies

### Frontend Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Strict typing for reliability
- **Tailwind CSS**: Utility-first styling
- **AG-UI**: Real-time streaming protocol
- **Zustand**: Global state management
- **TanStack Query**: Server state management

### Backend Stack
- **Go + Fiber**: High-performance web framework
- **GORM**: ORM for database operations
- **PostgreSQL + PostGIS**: Database with geospatial support
- **AG-UI Protocol**: Real-time streaming implementation
- **OpenAI API**: LLM integration for chat responses

## 🎯 Development Principles

### Code Quality Rules
1. **Keep files small**: <200 lines (frontend), <500 lines (backend)
2. **Test everything**: Every component/function needs tests
3. **Type everything**: Strict TypeScript, proper Go types
4. **Document as you go**: JSDoc/godoc for public APIs
5. **Handle errors gracefully**: Proper error boundaries and handling

### AI Assistant Rules
1. **One task at a time**: Don't overwhelm the AI with multiple requests
2. **Always read context**: Start with planning and instruction files
3. **Update documentation**: Keep task and planning files current
4. **Test immediately**: Write tests for every new feature
5. **Ask for clarification**: When requirements are unclear

## 🔗 Useful URLs

### Development
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Database**: localhost:5432 (postgres/password)

### Documentation
- **AG-UI Protocol**: https://docs.ag-ui.com/
- **Next.js 14**: https://nextjs.org/docs
- **Fiber Framework**: https://docs.gofiber.io/
- **GORM**: https://gorm.io/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs

## 🚨 Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check if ports are in use
lsof -i :3000  # Frontend port
lsof -i :8080  # Backend port
lsof -i :5432  # Database port

# Reset Docker
docker-compose down
docker system prune
docker-compose up -d
```

**Database connection issues:**
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Reset database
docker-compose down
docker volume rm community-chatbot_postgres_data
docker-compose up -d
```

**Missing API keys:**
```bash
# Check .env file exists and has required keys
cat .env | grep -E "(OPENAI|CLOUDINARY|MAPBOX)"
```

## 📋 Development Checklist

### Before Starting Development
- [ ] All services running (`docker-compose ps`)
- [ ] API keys configured in `.env`
- [ ] Read relevant instruction files
- [ ] Check current tasks in task tracking files

### Before Committing Code
- [ ] Tests pass (`npm test` or `go test ./...`)
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Task tracking files updated
- [ ] No sensitive data in commit

### Before Deploying
- [ ] All tests pass in CI/CD
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Performance tested
- [ ] Security review completed

---

**Happy coding! 🎉**

Remember: This project uses AI-assisted development with specific instruction files. Always start AI conversations by reading the relevant documentation files for consistent, high-quality results.
