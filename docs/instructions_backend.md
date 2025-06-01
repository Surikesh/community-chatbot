# 🧠 Backend AI Coding Assistant Instructions
## Community Chatbot - Go + Fiber + GORM + AG-UI

### 🔑 Golden Rules for Backend Development

1. **Use markdown files to manage the backend** (`README_BACKEND.md`, `PLANNING_BACKEND.md`, `TASK_BACKEND.md`)
2. **Keep files under 500 lines**. Split into modules when needed
3. **Start fresh conversations often**. Long threads degrade response quality
4. **One feature/endpoint per message**. Don't overload the model
5. **Test every function with Go testing + testify**. Write tests as you build
6. **Be specific about API requirements**. Provide examples and error cases
7. **Use proper error handling**. Always return appropriate HTTP status codes
8. **Write comprehensive documentation**. Document all APIs and functions
9. **Implement environment variables yourself**. Don't trust LLM with sensitive data

---

## 🧠 Backend Planning & Task Management

### PLANNING_BACKEND.md
- **Purpose**: API architecture, database schema, service patterns, deployment strategy
- **Prompt to AI**: "Use the structure and decisions outlined in PLANNING_BACKEND.md"
- **Update when**: Adding new endpoints, changing database schema, or updating dependencies

### TASK_BACKEND.md
- **Purpose**: Current backend tasks, API endpoints backlog, database migrations
- **Format**: Bullet list of active work, endpoint milestones, discovered issues
- **Prompt to AI**: "Update TASK_BACKEND.md to mark endpoint XYZ as done and add ABC as new task"

---

## ⚙️ Global Rules for Backend AI Assistant

### 🔄 Project Awareness & Context
- **Always read `PLANNING_BACKEND.md`** at start of new conversations to understand API architecture, database patterns, and service organization
- **Check `TASK_BACKEND.md`** before starting new endpoint work. Add missing tasks with brief description and date
- **Use consistent naming conventions**: PascalCase for structs, camelCase for functions, snake_case for database columns
- **Follow the established project structure** in `internal/` as defined in planning

### 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines**. Split into separate services or handlers
- **Organize code by domain/feature**, following clean architecture:
  ```
  backend/
  ├── cmd/server/main.go
  ├── internal/
  │   ├── handlers/        # HTTP handlers (Fiber routes)
  │   ├── services/        # Business logic
  │   ├── models/          # GORM models
  │   ├── repositories/    # Data access layer
  │   ├── middleware/      # Custom middleware
  │   ├── utils/           # Helper functions
  │   └── config/          # Configuration
  ├── migrations/          # Database migrations
  ├── tests/              # Test files
  └── scripts/            # Utility scripts
  ```
- **Use dependency injection** pattern for services
- **Separate concerns**: HTTP handling, business logic, and data access
 middleware** for protected endpoints
- **Sanitize database queries** to prevent injection attacks

### ✅ Task Completion
- **Mark completed tasks in `TASK_BACKEND.md`** immediately after finishing
- **Add new endpoint requirements** discovered during development
- **Update API documentation** in README_BACKEND.md when adding endpoints

### 📚 Documentation & Code Quality
- **Write godoc comments** for all exported functions and types:
  ```go
  // CreateActivity creates a new activity in the database with the provided details.
  // It validates the input, processes any uploaded images, and returns the created activity.
  //
  // Parameters:
  //   - ctx: Fiber context containing the request data
  //
  // Returns:
  //   - 201: Successfully created activity
  //   - 400: Invalid input data
  //   - 500: Internal server error
  func CreateActivity(ctx *fiber.Ctx) error {
  ```
- **Use proper error wrapping** with context information
- **Log important operations** with structured logging
- **Include examples** in API documentation

### 🧠 AI Behavior Rules
- **Never assume database schema exists** - always check GORM models first
- **Never use deprecated Fiber patterns** - always use v2 syntax
- **Always confirm Go module dependencies** exist before importing
- **Never overwrite existing handlers** unless explicitly instructed
- **Ask for clarification** on business logic requirements if ambiguous
- **Always validate that struct tags** are correct for GORM and JSON

---

## 🧪 Backend Testing Standards

### Handler Testing Template:
```go
// tests/handlers/chat_test.go
package handlers_test

import (
    "bytes"
    "encoding/json"
    "net/http/httptest"
    "testing"

    "github.com/gofiber/fiber/v2"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "community-chatbot/internal/handlers"
    "community-chatbot/internal/services/mocks"
)

func TestHandleChatStream(t *testing.T) {
    tests := []struct {
        name           string
        requestBody    map[string]interface{}
        setupMock      func(*mocks.ChatService)
        expectedStatus int
        expectStream   bool
    }{
        {
            name: "successful chat stream",
            requestBody: map[string]interface{}{
                "message": "What hiking trails are nearby?",
                "location": map[string]float64{"lat": 40.7128, "lng": -74.0060},
            },
            setupMock: func(m *mocks.ChatService) {
                m.On("ProcessMessage", mock.Anything, mock.Anything).Return(nil)
            },
            expectedStatus: 200,
            expectStream:   true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Setup
            app := fiber.New()
            mockService := new(mocks.ChatService)
            tt.setupMock(mockService)
            
            handler := handlers.NewChatHandler(mockService)
            app.Post("/chat/stream", handler.HandleChatStream)

            // Create request
            body, _ := json.Marshal(tt.requestBody)
            req := httptest.NewRequest("POST", "/chat/stream", bytes.NewReader(body))
            req.Header.Set("Content-Type", "application/json")

            // Execute
            resp, err := app.Test(req)

            // Assert
            assert.NoError(t, err)
            assert.Equal(t, tt.expectedStatus, resp.StatusCode)
            
            if tt.expectStream {
                assert.Equal(t, "text/event-stream", resp.Header.Get("Content-Type"))
            }
            
            mockService.AssertExpectations(t)
        })
    }
}
```
### Service Testing Template:
```go
// tests/services/activity_service_test.go
package services_test

import (
    "context"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "community-chatbot/internal/models"
    "community-chatbot/internal/repositories/mocks"
    "community-chatbot/internal/services"
)

func TestActivityService_SearchActivities(t *testing.T) {
    tests := []struct {
        name          string
        query         string
        location      models.Location
        setupMock     func(*mocks.ActivityRepository)
        expectedCount int
        expectError   bool
    }{
        {
            name:     "successful search with results",
            query:    "hiking",
            location: models.Location{Lat: 40.7128, Lng: -74.0060},
            setupMock: func(m *mocks.ActivityRepository) {
                activities := []models.Activity{
                    {ID: 1, Name: "Central Park Hiking", Description: "Great hiking spot"},
                    {ID: 2, Name: "Hudson River Trail", Description: "Scenic hiking trail"},
                }
                m.On("SearchByQueryAndLocation", mock.Anything, "hiking", mock.Anything).Return(activities, nil)
            },
            expectedCount: 2,
            expectError:   false,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Setup
            mockRepo := new(mocks.ActivityRepository)
            tt.setupMock(mockRepo)
            service := services.NewActivityService(mockRepo)

            // Execute
            activities, err := service.SearchActivities(context.Background(), tt.query, tt.location)

            // Assert
            if tt.expectError {
                assert.Error(t, err)
                assert.Nil(t, activities)
            } else {
                assert.NoError(t, err)
                assert.Len(t, activities, tt.expectedCount)
            }
            
            mockRepo.AssertExpectations(t)
        })
    }
}
```

---

## 🗄️ Database Schema & GORM Models

### Core Models Template:
```go
// internal/models/activity.go
package models

import (
    "time"
    "gorm.io/gorm"
)

type Activity struct {
    ID          uint           `gorm:"primaryKey" json:"id"`
    Name        string         `gorm:"size:255;not null;index" json:"name" validate:"required,min=3,max=255"`
    Description string         `gorm:"type:text" json:"description"`
    Category    string         `gorm:"size:100;index" json:"category"`
    Latitude    float64        `gorm:"type:decimal(10,8)" json:"latitude" validate:"latitude"`
    Longitude   float64        `gorm:"type:decimal(11,8)" json:"longitude" validate:"longitude"`
    Difficulty  string         `gorm:"size:50" json:"difficulty"`
    Duration    int            `json:"duration"` // minutes
    BestSeason  string         `gorm:"size:100" json:"best_season"`
    UserID      uint           `json:"user_id"`
    Images      []Image        `gorm:"foreignKey:ActivityID" json:"images,omitempty"`
    Routes      []Route        `gorm:"foreignKey:ActivityID" json:"routes,omitempty"`
    Approved    bool           `gorm:"default:false" json:"approved"`
    CreatedAt   time.Time      `json:"created_at"`
    UpdatedAt   time.Time      `json:"updated_at"`
    DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
```
## 🔌 AG-UI Event Types & Implementation

### AG-UI Event Definitions:
```go
// internal/utils/agui.go
package utils

import (
    "encoding/json"
    "time"
)

type AGUIEvent struct {
    Type      string      `json:"type"`
    ID        string      `json:"id"`
    Data      interface{} `json:"data,omitempty"`
    Timestamp int64       `json:"timestamp"`
}

// AG-UI Event Types
const (
    EventTextMessageStart    = "TEXT_MESSAGE_CONTENT_START"
    EventTextMessageContent  = "TEXT_MESSAGE_CONTENT"
    EventTextMessageComplete = "TEXT_MESSAGE_CONTENT_COMPLETE"
    EventToolCallStart       = "TOOL_CALL_START"
    EventToolCallComplete    = "TOOL_CALL_COMPLETE"
    EventStateUpdate         = "STATE_UPDATE"
    EventError              = "ERROR"
    EventActivitiesFound    = "ACTIVITIES_FOUND"
    EventImagesLoaded       = "IMAGES_LOADED"
    EventMapDataReady       = "MAP_DATA_READY"
)

// Event Data Structures
type TextMessageData struct {
    Text  string `json:"text"`
    Delta bool   `json:"delta,omitempty"`
}

type ToolCallData struct {
    Name string                 `json:"name"`
    Args map[string]interface{} `json:"args"`
}

type StateUpdateData struct {
    Activities []interface{} `json:"activities,omitempty"`
    Images     []string      `json:"images,omitempty"`
    MapData    interface{}   `json:"map_data,omitempty"`
}

type ErrorData struct {
    Message string `json:"message"`
    Code    string `json:"code,omitempty"`
}

// Helper Functions
func NewAGUIEvent(eventType string, data interface{}) AGUIEvent {
    return AGUIEvent{
        Type:      eventType,
        ID:        generateEventID(),
        Data:      data,
        Timestamp: time.Now().Unix(),
    }
}

func (e AGUIEvent) ToSSE() []byte {
    data, _ := json.Marshal(e)
    return []byte("data: " + string(data) + "\n\n")
}

func generateEventID() string {
    return fmt.Sprintf("evt_%d", time.Now().UnixNano())
}
```
