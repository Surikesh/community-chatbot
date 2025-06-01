# 🚀 Community Chatbot Project
## AI-Powered Local Activity Assistant with AG-UI

This project implements a community-focused chatbot that helps users discover local activities, provides visual content, and offers real-time streaming responses using the AG-UI protocol.

## 🏗️ Architecture Overview

- **Frontend**: Next.js 14 + TypeScript + AG-UI + Tailwind CSS
- **Backend**: Go + Fiber + GORM + PostGIS + AG-UI Streaming
- **Database**: Supabase PostgreSQL with PostGIS extension
- **Storage**: Cloudinary (images) + Supabase Storage (GPX files)
- **AI**: OpenAI GPT-4o-mini with real-time streaming
- **Maps**: Mapbox GL JS for interactive route visualization
- **Deployment**: Vercel (frontend) + Google Cloud Run (backend)

## 📋 Project Structure

```
community-chatbot/
├── frontend/                    # Next.js application
├── backend/                     # Go application  
├── docs/                        # Documentation and AI instructions
│   ├── instructions_frontend.md # AI coding assistant rules for frontend
│   ├── instructions_backend.md  # AI coding assistant rules for backend
│   ├── PLANNING_FRONTEND.md     # Frontend architecture decisions
│   ├── PLANNING_BACKEND.md      # Backend architecture decisions
│   ├── TASK_FRONTEND.md         # Frontend task tracking
│   ├── TASK_BACKEND.md          # Backend task tracking
│   └── API.md                   # API documentation
├── .github/workflows/           # CI/CD pipelines
├── docker-compose.yml           # Local development setup
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Go 1.21+
- Docker & Docker Compose
- Supabase account
- OpenAI API key
- Cloudinary account

### 1. Clone and Setup
```bash
git clone <repository-url>
cd community-chatbot

# Copy environment templates
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 2. Environment Variables
**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

**Backend (.env):**
```env
DATABASE_URL=your_supabase_connection_string
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_URL=your_cloudinary_url
GO_ENV=development
PORT=8080
```

### 3. Development Setup
```bash
# Start with Docker Compose
docker-compose up -d

# Or run individually:

# Backend
cd backend
go mod download
go run cmd/server/main.go

# Frontend  
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- API Health Check: http://localhost:8080/health

## 🧠 AI Development Workflow

This project uses AI coding assistants with specific instruction files for consistent development:

### For Frontend Development:
1. Read `docs/instructions_frontend.md` 
2. Check `docs/PLANNING_FRONTEND.md` for architecture
3. Update `docs/TASK_FRONTEND.md` with progress

### For Backend Development:
1. Read `docs/instructions_backend.md`
2. Check `docs/PLANNING_BACKEND.md` for architecture  
3. Update `docs/TASK_BACKEND.md` with progress

### Key AI Rules:
- **Test everything**: Every component/function needs tests
- **Keep files small**: <200 lines (frontend), <500 lines (backend)
- **Document as you go**: JSDoc/godoc for all public APIs
- **Validate inputs**: Strict TypeScript + Go struct validation

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Backend Testing
```bash
cd backend
go test ./...                    # Run all tests
go test -v ./...                 # Verbose output
go test -cover ./...             # Coverage report
go test -tags=integration ./...  # Integration tests
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Google Cloud Run)
```bash
cd backend
docker build -t chatbot-backend .
docker tag chatbot-backend gcr.io/PROJECT_ID/chatbot-backend
docker push gcr.io/PROJECT_ID/chatbot-backend

gcloud run deploy chatbot-backend \
    --image gcr.io/PROJECT_ID/chatbot-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

## 📊 Key Features

### 🗣️ Real-time Chat with AG-UI
- Streaming responses with visual feedback
- Tool execution transparency (searching, fetching images)
- Error handling and reconnection

### 🏃‍♀️ Activity Discovery
- Location-based search with PostGIS
- Category filtering (hiking, restaurants, events)
- User preference learning

### 🖼️ Visual Content
- Activity images with Cloudinary optimization
- Interactive maps with Mapbox
- GPX route visualization and download

### 📱 User Experience
- Mobile-first responsive design
- Dark/light mode support
- Progressive loading with skeleton screens

## 💰 Cost Estimates (Monthly)

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| Vercel | 100GB bandwidth | $0 |
| Google Cloud Run | 2M requests | $5-15 |
| Supabase | 500MB + 1GB storage | $0 |
| OpenAI API | Pay per use | $20-50 |
| Cloudinary | 25GB storage/bandwidth | $0 |
| Mapbox | 50K map loads | $0 |
| **Total** | | **$25-65** |

## 🔧 Development Tips

### Using AI Assistants Effectively
1. **Start conversations with context**: Always reference the instruction files
2. **One feature at a time**: Don't overwhelm the AI with multiple tasks
3. **Test immediately**: Write tests for every new feature
4. **Update documentation**: Keep planning and task files current

### Common Commands
```bash
# Backend
go mod tidy                    # Clean dependencies
go generate ./...              # Generate mocks
docker-compose logs backend    # View logs

# Frontend  
npm run lint                   # Check code style
npm run type-check            # TypeScript validation
npm run build                 # Production build
```

## 📚 Additional Resources

- [AG-UI Protocol Documentation](https://docs.ag-ui.com/)
- [Fiber Web Framework](https://docs.gofiber.io/)
- [GORM Documentation](https://gorm.io/docs/)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)

## 🤝 Contributing

1. Read the appropriate instruction file (`docs/instructions_*.md`)
2. Check current tasks in `docs/TASK_*.md`
3. Create feature branch
4. Write tests for new functionality
5. Update documentation
6. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.
