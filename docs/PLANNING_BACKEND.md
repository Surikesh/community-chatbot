,
    deleted_at TIMESTAMP
);

-- Images table
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER REFERENCES activities(id),
    url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Routes table for GPX files
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER REFERENCES activities(id),
    gpx_file_url VARCHAR(500),
    name VARCHAR(255),
    distance_km DECIMAL(8,2),
    elevation_gain_m INTEGER,
    route_type VARCHAR(50),  -- hiking, cycling, driving
    difficulty VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- User preferences
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    search_radius_km INTEGER DEFAULT 50,
    preferred_activities TEXT[],
    difficulty_level VARCHAR(50),
    transport_mode VARCHAR(50) DEFAULT 'car',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Indexing Strategy**
```sql
-- Geospatial indexes for performance
CREATE INDEX idx_activities_geom ON activities USING GIST(geom);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_approved ON activities(approved);
CREATE INDEX idx_activities_name_gin ON activities USING GIN(to_tsvector('english', name));
CREATE INDEX idx_activities_description_gin ON activities USING GIN(to_tsvector('english', description));

-- Foreign key indexes
CREATE INDEX idx_images_activity_id ON images(activity_id);
CREATE INDEX idx_routes_activity_id ON routes(activity_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

## 🌐 API Design

### **RESTful Endpoints**
```go
// Core API routes
/api/v1/
├── /health                    # Health check
├── /chat/stream              # AG-UI streaming endpoint
├── /activities
│   ├── GET /                 # List activities with filters
│   ├── POST /                # Create activity
│   ├── GET /:id              # Get activity details
│   ├── PUT /:id              # Update activity
│   └── DELETE /:id           # Delete activity
├── /activities/search        # Advanced search with location
├── /activities/nearby        # Location-based discovery
├── /images
│   ├── POST /                # Upload image
│   └── DELETE /:id           # Delete image
├── /routes
│   ├── POST /                # Upload GPX file
│   └── GET /:id/download     # Download GPX
└── /users
    ├── GET /profile          # User profile
    ├── PUT /profile          # Update profile
    └── GET /preferences      # User preferences
```

### **Request/Response Patterns**
```go
// Standard API response format
type APIResponse struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Error   string      `json:"error,omitempty"`
    Message string      `json:"message,omitempty"`
    Meta    *MetaData   `json:"meta,omitempty"`
}

type MetaData struct {
    TotalCount int `json:"total_count,omitempty"`
    Page       int `json:"page,omitempty"`
    PageSize   int `json:"page_size,omitempty"`
}
```

## 🔧 Service Layer Architecture

### **Service Interfaces**
```go
type ActivityService interface {
    SearchActivities(ctx context.Context, query string, location *Location, filters ActivityFilters) ([]Activity, error)
    GetActivityByID(ctx context.Context, id uint) (*Activity, error)
    CreateActivity(ctx context.Context, activity *Activity) error
    UpdateActivity(ctx context.Context, id uint, updates ActivityUpdates) error
    DeleteActivity(ctx context.Context, id uint) error
    GetActivitiesNearLocation(ctx context.Context, lat, lng float64, radiusKM int) ([]Activity, error)
    ApproveActivity(ctx context.Context, id uint) error
}

type ChatService interface {
    ProcessMessage(ctx context.Context, message string, userContext UserContext) (<-chan AGUIEvent, error)
    GenerateResponse(ctx context.Context, message string, activities []Activity) (<-chan string, error)
}

type ImageService interface {
    UploadImage(ctx context.Context, activityID uint, imageData []byte, filename string) (*Image, error)
    DeleteImage(ctx context.Context, imageID uint) error
    ApproveImage(ctx context.Context, imageID uint) error
    OptimizeImage(ctx context.Context, imageURL string) (string, error)
}
```

### **Business Logic Patterns**
- **Validation**: Input validation using struct tags and custom validators
- **Authorization**: Role-based access control for content moderation
- **Caching**: Redis for frequently accessed data (future enhancement)
- **Rate Limiting**: Protect against abuse and ensure fair usage

## 🧪 Testing Strategy

### **Testing Pyramid**
1. **Unit Tests** (70%): Test individual functions and methods
2. **Integration Tests** (20%): Test service interactions and database operations
3. **E2E Tests** (10%): Test complete user workflows

### **Testing Tools & Patterns**
```go
// Example service test with mocks
func TestActivityService_SearchActivities(t *testing.T) {
    tests := []struct {
        name          string
        query         string
        location      *Location
        mockSetup     func(*mocks.ActivityRepository)
        expectedCount int
        expectError   bool
    }{
        {
            name:     "successful search with location",
            query:    "hiking",
            location: &Location{Lat: 40.7128, Lng: -74.0060},
            mockSetup: func(m *mocks.ActivityRepository) {
                activities := []Activity{
                    {ID: 1, Name: "Central Park Trail"},
                    {ID: 2, Name: "Hudson River Hike"},
                }
                m.On("SearchByQueryAndLocation", mock.Anything, "hiking", mock.Anything).Return(activities, nil)
            },
            expectedCount: 2,
            expectError:   false,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mockRepo := new(mocks.ActivityRepository)
            tt.mockSetup(mockRepo)
            service := services.NewActivityService(mockRepo)
            
            activities, err := service.SearchActivities(context.Background(), tt.query, tt.location, ActivityFilters{})
            
            if tt.expectError {
                assert.Error(t, err)
            } else {
                assert.NoError(t, err)
                assert.Len(t, activities, tt.expectedCount)
            }
            
            mockRepo.AssertExpectations(t)
        })
    }
}
```

### **Mock Generation**
```go
//go:generate mockery --name=ActivityRepository --output=mocks
//go:generate mockery --name=ActivityService --output=mocks
//go:generate mockery --name=ChatService --output=mocks
```

## 🔒 Security Architecture

### **Authentication & Authorization**
- **JWT Tokens**: For user authentication (future feature)
- **API Keys**: For external service access
- **Role-Based Access**: Admin, Moderator, User roles
- **Rate Limiting**: Per-IP and per-user limits

### **Input Validation & Sanitization**
```go
type CreateActivityRequest struct {
    Name        string  `json:"name" validate:"required,min=3,max=255"`
    Description string  `json:"description" validate:"max=2000"`
    Category    string  `json:"category" validate:"required,oneof=hiking cycling dining events"`
    Latitude    float64 `json:"latitude" validate:"required,latitude"`
    Longitude   float64 `json:"longitude" validate:"required,longitude"`
    Difficulty  string  `json:"difficulty" validate:"oneof=easy moderate hard expert"`
}
```

### **Security Middleware**
- **CORS**: Configured for frontend domain
- **Request Logging**: All requests logged for monitoring
- **Input Sanitization**: Prevent XSS and injection attacks
- **Request Size Limits**: Prevent DoS attacks

## 🚀 Performance Optimization

### **Database Performance**
- **Connection Pooling**: Optimized pool size for concurrent requests
- **Query Optimization**: Use EXPLAIN ANALYZE for slow queries
- **Indexing Strategy**: Geospatial and text search indexes
- **Read Replicas**: For scaling read operations (future)

### **Caching Strategy**
```go
// Redis caching for frequently accessed data
type CacheService interface {
    Get(ctx context.Context, key string) ([]byte, error)
    Set(ctx context.Context, key string, value []byte, ttl time.Duration) error
    Delete(ctx context.Context, key string) error
}

// Cache popular activities and search results
func (s *activityService) GetPopularActivities(ctx context.Context) ([]Activity, error) {
    cacheKey := "popular_activities"
    
    // Try cache first
    if cached, err := s.cache.Get(ctx, cacheKey); err == nil {
        var activities []Activity
        if err := json.Unmarshal(cached, &activities); err == nil {
            return activities, nil
        }
    }
    
    // Fallback to database
    activities, err := s.repo.GetPopularActivities(ctx)
    if err != nil {
        return nil, err
    }
    
    // Cache result
    if data, err := json.Marshal(activities); err == nil {
        s.cache.Set(ctx, cacheKey, data, 1*time.Hour)
    }
    
    return activities, nil
}
```

### **Concurrency Patterns**
- **Worker Pools**: For CPU-intensive operations
- **Context Cancellation**: Proper cleanup for cancelled requests
- **Goroutine Management**: Avoid goroutine leaks in streaming operations

## 🐳 Deployment Architecture

### **Container Strategy**
```dockerfile
# Multi-stage build for minimal production image
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
```

### **Cloud Run Configuration**
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: chatbot-backend
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/memory: "1Gi"
        run.googleapis.com/cpu: "1"
    spec:
      containers:
      - image: gcr.io/PROJECT_ID/chatbot-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: openai-api-key
        resources:
          limits:
            memory: "1Gi"
            cpu: "1"
```

## 📊 Monitoring & Observability

### **Logging Strategy**
```go
// Structured logging with fields
logger := log.WithFields(log.Fields{
    "user_id":    userID,
    "request_id": requestID,
    "operation":  "search_activities",
})

logger.WithField("query", query).Info("Starting activity search")
logger.WithError(err).Error("Activity search failed")
```

### **Metrics Collection**
- **Request Metrics**: Response times, status codes, throughput
- **Business Metrics**: Activities created, searches performed, user engagement
- **System Metrics**: Memory usage, CPU utilization, database connections

### **Health Checks**
```go
func (h *HealthHandler) GetHealth(c *fiber.Ctx) error {
    health := HealthStatus{
        Status:    "healthy",
        Timestamp: time.Now(),
        Version:   BuildVersion,
        Checks: map[string]interface{}{
            "database": h.checkDatabase(),
            "openai":   h.checkOpenAI(),
            "storage":  h.checkStorage(),
        },
    }
    
    return c.JSON(health)
}
```

## 🔄 Development Workflow

### **Code Quality Standards**
- **gofmt**: Consistent code formatting
- **golint**: Static code analysis
- **go vet**: Code correctness checks
- **golangci-lint**: Comprehensive linting suite

### **Git Workflow**
- **Feature Branches**: One feature per branch
- **PR Requirements**: Tests pass, code review, documentation updated
- **Commit Messages**: Conventional commit format

### **CI/CD Pipeline**
```yaml
# .github/workflows/backend.yml
name: Backend CI/CD
on:
  push:
    branches: [main]
    paths: ['backend/**']
  pull_request:
    paths: ['backend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v3
        with:
          go-version: '1.21'
      - run: go test -v -race -coverprofile=coverage.out ./...
      - run: go tool cover -html=coverage.out -o coverage.html
  
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Cloud Run
        run: |
          docker build -t gcr.io/$PROJECT_ID/chatbot-backend .
          docker push gcr.io/$PROJECT_ID/chatbot-backend
          gcloud run deploy --image gcr.io/$PROJECT_ID/chatbot-backend
```

## 🎯 Success Metrics

### **Performance Targets**
- **Response Time**: < 100ms for API endpoints (excluding streaming)
- **Throughput**: Handle 1000+ concurrent users
- **Availability**: 99.9% uptime
- **Database Query Time**: < 50ms for 95th percentile

### **Business Metrics**
- **API Usage**: Requests per minute, error rates
- **User Engagement**: Activities searched, created, viewed
- **Content Quality**: Approval rates for user-generated content

---

This planning document serves as the source of truth for backend architecture decisions. Update this document when making significant changes to the backend approach.
