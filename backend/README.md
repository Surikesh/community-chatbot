# Community Chatbot Backend

Go-based backend API using Fiber web framework, GORM ORM, and PostgreSQL database.

## 🏗️ Architecture

- **Framework**: Go Fiber v2
- **Database**: PostgreSQL with PostGIS
- **ORM**: GORM v2
- **Streaming**: Server-Sent Events with AG-UI compatibility
- **Testing**: testify framework
- **Validation**: go-playground/validator

## 🚀 Quick Start

### Prerequisites

- Go 1.21+
- PostgreSQL 14+ with PostGIS extension
- OpenAI API key

### Installation

1. **Clone and navigate to backend**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   go mod download
   ```

3. **Setup environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the server**:
   ```bash
   go run cmd/server/main.go
   ```
### Development

```bash
# Run with live reload (install air first: go install github.com/cosmtrek/air@latest)
air

# Run tests
go test ./...

# Run tests with coverage
go test -v -race -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Format code
go fmt ./...

# Lint code (install golangci-lint first)
golangci-lint run
```

## 📋 API Endpoints

### Health Check
- `GET /health` - Application health status
- `GET /api/v1/health` - API health status

### Activities (Planned)
- `GET /api/v1/activities` - List activities with filters
- `POST /api/v1/activities` - Create new activity
- `GET /api/v1/activities/:id` - Get activity details
- `PUT /api/v1/activities/:id` - Update activity
- `DELETE /api/v1/activities/:id` - Delete activity

### Chat (Planned)
- `POST /api/v1/chat/stream` - AG-UI streaming chat endpoint

### Search (Planned)
- `GET /api/v1/activities/search` - Advanced search with location
- `GET /api/v1/activities/nearby` - Location-based discovery

## 🗄️ Database Schema

### Core Tables
- **activities** - Community activities and events
- **images** - Activity photos and media
- **routes** - GPX files and route data
- **users** - User accounts
- **user_preferences** - User settings and preferences

### Key Features
- **PostGIS** - Geospatial queries for location-based search
- **Full-text search** - Efficient text search across activities
- **GORM migrations** - Automatic schema management
- **Soft deletes** - Data preservation with deletion tracking

## 🔧 Configuration

All configuration is handled through environment variables. See `.env.example` for required settings.

### Required Variables
- `DATABASE_URL` or individual DB settings
- `OPENAI_API_KEY` - For AI chat functionality
- `PORT` - Server port (default: 8080)

### Optional Variables
- `CLOUDINARY_*` - For image upload and processing
- `CORS_*` - CORS configuration for frontend
- `LOG_LEVEL` - Logging verbosity

## 🧪 Testing

The project uses testify for testing with comprehensive coverage:

```bash
# Run all tests
go test ./...

# Run specific package tests
go test ./internal/handlers

# Run with verbose output
go test -v ./...

# Generate coverage report
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html
```
