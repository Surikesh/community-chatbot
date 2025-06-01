package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// HealthHandler handles health check endpoints
type HealthHandler struct {
	db *gorm.DB
}

// NewHealthHandler creates a new health handler
func NewHealthHandler(db *gorm.DB) *HealthHandler {
	return &HealthHandler{
		db: db,
	}
}

// HealthStatus represents the health status response
type HealthStatus struct {
	Status    string                 `json:"status"`
	Timestamp time.Time              `json:"timestamp"`
	Version   string                 `json:"version"`
	Checks    map[string]interface{} `json:"checks"`
}

// GetHealth returns the health status of the application
func (h *HealthHandler) GetHealth(c *fiber.Ctx) error {
	health := HealthStatus{
		Status:    "healthy",
		Timestamp: time.Now(),
		Version:   "1.0.0", // TODO: Get from build info
		Checks: map[string]interface{}{
			"database": h.checkDatabase(),
		},
	}

	return c.JSON(health)
}

// checkDatabase verifies database connectivity
func (h *HealthHandler) checkDatabase() map[string]interface{} {
	start := time.Now()
	
	sqlDB, err := h.db.DB()
	if err != nil {
		return map[string]interface{}{
			"status":      "unhealthy",
			"error":       err.Error(),
			"response_ms": time.Since(start).Milliseconds(),
		}
	}

	if err := sqlDB.Ping(); err != nil {
		return map[string]interface{}{
			"status":      "unhealthy",
			"error":       err.Error(),
			"response_ms": time.Since(start).Milliseconds(),
		}
	}

	return map[string]interface{}{
		"status":      "healthy",
		"response_ms": time.Since(start).Milliseconds(),
	}
}
