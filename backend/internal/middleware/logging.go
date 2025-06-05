package middleware

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
)

// RequestLoggingConfig holds configuration for request logging
type RequestLoggingConfig struct {
	// LogLevel controls how much detail to log
	LogLevel string
	// SkipPaths are paths to skip logging (useful for health checks)
	SkipPaths []string
}

// DefaultRequestLoggingConfig provides default configuration
var DefaultRequestLoggingConfig = RequestLoggingConfig{
	LogLevel:  "info",
	SkipPaths: []string{"/health", "/ping"},
}

// RequestLogging returns a middleware that logs detailed request information
// with client IP, user agent, and connection details to help identify
// which client is sending repeated requests
func RequestLogging(config ...RequestLoggingConfig) fiber.Handler {
	cfg := DefaultRequestLoggingConfig
	if len(config) > 0 {
		cfg = config[0]
	}

	return func(c *fiber.Ctx) error {
		start := time.Now()
		
		// Check if we should skip logging for this path
		path := c.Path()
		for _, skipPath := range cfg.SkipPaths {
			if path == skipPath {
				return c.Next()
			}
		}

		// Extract client information
		clientIP := c.IP()
		userAgent := c.Get("User-Agent", "Unknown")
		xForwardedFor := c.Get("X-Forwarded-For")
		referer := c.Get("Referer", "")
		origin := c.Get("Origin", "")
		method := c.Method()
		
		// Additional connection info for debugging loops
		connectionHeader := c.Get("Connection", "")
		cacheControl := c.Get("Cache-Control", "")
		accept := c.Get("Accept", "")

		// Log request start with detailed client information
		log.Printf("[REQUEST_START] %s %s | Client: %s | X-Forwarded-For: %s | User-Agent: %s | Origin: %s | Referer: %s | Connection: %s | Cache-Control: %s | Accept: %s",
			method, path, clientIP, xForwardedFor, userAgent, origin, referer, connectionHeader, cacheControl, accept)

		// Process the request
		err := c.Next()

		// Calculate processing time
		duration := time.Since(start)
		status := c.Response().StatusCode()
		responseSize := len(c.Response().Body())

		// Log request completion with performance metrics
		log.Printf("[REQUEST_END] %s %s | Client: %s | Status: %d | Duration: %v | Response Size: %d bytes | Error: %v",
			method, path, clientIP, status, duration, responseSize, err)

		// For specific problematic endpoints, log additional details
		if path == "/api/chat/stream" || path == "/chat/stream" {
			log.Printf("[CHAT_STREAM] Client: %s | Query: %s | Headers: Connection=%s, Cache-Control=%s",
				clientIP, c.Request().URI().QueryString(), connectionHeader, cacheControl)
		}

		return err
	}
}

// EventSourceLogging specifically logs EventSource/SSE connection details
// to help debug automatic reconnection issues
func EventSourceLogging() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Check if this is an EventSource request
		accept := c.Get("Accept", "")
		if accept == "text/event-stream" || c.Get("Cache-Control") == "no-cache" {
			clientIP := c.IP()
			userAgent := c.Get("User-Agent", "Unknown")
			
			log.Printf("[EVENTSOURCE] Client: %s connecting to %s %s | User-Agent: %s",
				clientIP, c.Method(), c.Path(), userAgent)
				
			// Log if this looks like an automatic reconnection
			lastEventID := c.Get("Last-Event-ID", "")
			if lastEventID != "" {
				log.Printf("[EVENTSOURCE_RECONNECT] Client: %s reconnecting with Last-Event-ID: %s",
					clientIP, lastEventID)
			}
		}

		return c.Next()
	}
}

// RateLimitLogging logs when rate limits are triggered
func RateLimitLogging() fiber.Handler {
	return func(c *fiber.Ctx) error {
		err := c.Next()
		
		// Log if rate limit was triggered
		if c.Response().StatusCode() == fiber.StatusTooManyRequests {
			clientIP := c.IP()
			userAgent := c.Get("User-Agent", "Unknown")
			
			log.Printf("[RATE_LIMIT] Client: %s hit rate limit on %s %s | User-Agent: %s",
				clientIP, c.Method(), c.Path(), userAgent)
		}
		
		return err
	}
}
