#!/bin/bash

# Community Chatbot Development Setup Script
echo "🚀 Setting up Community Chatbot development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if required tools are installed
echo "🔍 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker Desktop."
    exit 1
fi
print_status "Docker found"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed."
    exit 1
fi
print_status "Docker Compose found"

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_warning "Please edit .env file with your API keys before continuing"
    print_warning "Required: OPENAI_API_KEY, CLOUDINARY_URL, NEXT_PUBLIC_MAPBOX_TOKEN"
    echo ""
    echo "Press any key to continue once you've added your API keys..."
    read -n 1 -s
fi

# Create necessary directories
echo ""
echo "📁 Creating project structure..."

mkdir -p backend/{cmd/server,internal/{handlers,services,models,repositories,middleware,utils,config},migrations,tests}
mkdir -p frontend/{src/{app,components/{chat,activities,ui,layout},hooks,lib,store,types},public}

print_status "Directory structure created"

# Backend setup
echo ""
echo "🔧 Setting up backend..."

cd backend

# Initialize Go module if it doesn't exist
if [ ! -f go.mod ]; then
    print_status "Initializing Go module..."
    go mod init community-chatbot
fi

# Install Go dependencies
print_status "Installing Go dependencies..."
go get github.com/gofiber/fiber/v2
go get github.com/gofiber/fiber/v2/middleware/cors
go get github.com/gofiber/fiber/v2/middleware/compress
go get gorm.io/gorm
go get gorm.io/driver/postgres
go get github.com/sashabaranov/go-openai
go get github.com/stretchr/testify
go get github.com/golang-migrate/migrate/v4

# Create basic main.go if it doesn't exist
if [ ! -f cmd/server/main.go ]; then
    cat > cmd/server/main.go << 'EOF'
package main

import (
    "log"
    "os"
    
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
    app := fiber.New()
    
    app.Use(cors.New())
    
    app.Get("/health", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{
            "status": "healthy",
            "service": "community-chatbot-backend",
        })
    })
    
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    
    log.Printf("Server starting on port %s", port)
    log.Fatal(app.Listen(":" + port))
}
EOF
    print_status "Created basic main.go"
fi

# Create Dockerfile if it doesn't exist
if [ ! -f Dockerfile ]; then
    cat > Dockerfile << 'EOF'
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/server

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
EOF
    print_status "Created Dockerfile"
fi

cd ..

# Frontend setup
echo ""
echo "🎨 Setting up frontend..."

cd frontend

# Initialize package.json if it doesn't exist
if [ ! -f package.json ]; then
    print_status "Initializing Next.js project..."
    npm init -y
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install next@latest react@latest react-dom@latest typescript @types/node @types/react @types/react-dom
    npm install tailwindcss postcss autoprefixer
    npm install @tanstack/react-query zustand react-hook-form zod
    npm install vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
    
    # Create basic package.json scripts
    npm pkg set scripts.dev="next dev"
    npm pkg set scripts.build="next build"
    npm pkg set scripts.start="next start"
    npm pkg set scripts.test="vitest"
    npm pkg set scripts.test:coverage="vitest --coverage"
fi

# Create basic Next.js files if they don't exist
if [ ! -f next.config.js ]; then
    cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
}

module.exports = nextConfig
EOF
    print_status "Created next.config.js"
fi

if [ ! -f tailwind.config.js ]; then
    npx tailwindcss init -p
    print_status "Created Tailwind config"
fi

# Create basic app structure
mkdir -p src/app
if [ ! -f src/app/page.tsx ]; then
    cat > src/app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Community Chatbot</h1>
        <p className="text-xl">AI-powered local activity discovery</p>
      </div>
    </main>
  )
}
EOF
    print_status "Created basic page.tsx"
fi

if [ ! -f src/app/layout.tsx ]; then
    cat > src/app/layout.tsx << 'EOF'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Community Chatbot',
  description: 'AI-powered local activity discovery',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
EOF
    print_status "Created layout.tsx"
fi

if [ ! -f src/app/globals.css ]; then
    cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF
    print_status "Created globals.css"
fi

cd ..

# Start services
echo ""
echo "🐳 Starting development environment..."

print_status "Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_status "Services are running!"
    echo ""
    echo "🎉 Setup complete! Your development environment is ready."
    echo ""
    echo "📍 Service URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:8080"
    echo "   Health:   http://localhost:8080/health"
    echo ""
    echo "📚 Next steps:"
    echo "   1. Check that all services are healthy"
    echo "   2. Read docs/instructions_frontend.md or docs/instructions_backend.md"
    echo "   3. Review docs/PLANNING_*.md for architecture decisions"
    echo "   4. Check docs/TASK_*.md for current development tasks"
    echo ""
    echo "🛠️  Development commands:"
    echo "   docker-compose logs backend    # View backend logs"
    echo "   docker-compose logs frontend   # View frontend logs"
    echo "   docker-compose down           # Stop all services"
    echo "   docker-compose up -d          # Start services in background"
else
    print_error "Some services failed to start. Check logs with: docker-compose logs"
fi
