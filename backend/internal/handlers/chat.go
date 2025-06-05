package handlers

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
)

// ChatHandler handles chat streaming endpoints
type ChatHandler struct {
	// Add message deduplication to prevent loops
	recentMessages map[string]time.Time
	messagesMutex  sync.RWMutex
}

// NewChatHandler creates a new chat handler
func NewChatHandler() *ChatHandler {
	handler := &ChatHandler{
		recentMessages: make(map[string]time.Time),
	}
	
	// Start cleanup goroutine to remove old messages
	go handler.cleanupOldMessages()
	
	return handler
}

// cleanupOldMessages removes messages older than 10 seconds to prevent memory leaks
func (h *ChatHandler) cleanupOldMessages() {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()
	
	for range ticker.C {
		h.messagesMutex.Lock()
		cutoff := time.Now().Add(-10 * time.Second)
		for message, timestamp := range h.recentMessages {
			if timestamp.Before(cutoff) {
				delete(h.recentMessages, message)
			}
		}
		h.messagesMutex.Unlock()
	}
}

// isRecentMessage checks if the same message was sent recently (within 10 seconds)
func (h *ChatHandler) isRecentMessage(message string) bool {
	h.messagesMutex.RLock()
	defer h.messagesMutex.RUnlock()
	
	if lastTime, exists := h.recentMessages[message]; exists {
		return time.Since(lastTime) < 10*time.Second
	}
	return false
}

// recordMessage records a message with current timestamp
func (h *ChatHandler) recordMessage(message string) {
	h.messagesMutex.Lock()
	defer h.messagesMutex.Unlock()
	h.recentMessages[message] = time.Now()
}



// AGUIEvent represents an AG-UI protocol event
type AGUIEvent struct {
	Type string `json:"type"`
}

// StreamingStartEvent represents the start of streaming
type StreamingStartEvent struct {
	Type      string `json:"type"`
	MessageID string `json:"messageId"`
}

// TextMessageEvent represents a text message chunk
type TextMessageEvent struct {
	Type       string `json:"type"`
	Content    string `json:"content"`
	IsComplete bool   `json:"isComplete"`
}

// StreamingEndEvent represents the end of streaming
type StreamingEndEvent struct {
	Type string `json:"type"`
}

// ErrorEvent represents an error
type ErrorEvent struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}
// StreamChat handles the AG-UI streaming chat endpoint
func (h *ChatHandler) StreamChat(c *fiber.Ctx) error {
	// Extract client information for logging
	clientIP := c.IP()
	userAgent := c.Get("User-Agent", "Unknown")
	xForwardedFor := c.Get("X-Forwarded-For")
	
	// Log request details with client information
	log.Printf("[REQUEST] Client: %s (X-Forwarded-For: %s) | User-Agent: %s | Endpoint: %s", 
		clientIP, xForwardedFor, userAgent, c.OriginalURL())

	// Get message from query parameter and decode it properly
	message := c.Query("message")
	if message == "" {
		log.Printf("[ERROR] Client %s: missing message parameter", clientIP)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "message parameter is required",
		})
	}

	// Decode URL-encoded message
	decodedMessage, err := url.QueryUnescape(message)
	if err != nil {
		log.Printf("[ERROR] Client %s: Failed to decode message: %v", clientIP, err)
		decodedMessage = message // fallback to original
	}

	// Check for duplicate messages to prevent loops
	if h.isRecentMessage(decodedMessage) {
		log.Printf("[DUPLICATE] Client %s: Duplicate message detected and ignored: %s", clientIP, decodedMessage)
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
			"error": "Duplicate message sent too quickly. Please wait before sending the same message again.",
		})
	}

	// Record this message
	h.recordMessage(decodedMessage)

	log.Printf("[CHAT] Client %s: Received message: %s (decoded: %s)", clientIP, message, decodedMessage)

	// Set headers for Server-Sent Events with proper CORS
	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Access-Control-Allow-Origin", "*")
	c.Set("Access-Control-Allow-Headers", "Cache-Control")
	c.Set("Access-Control-Expose-Headers", "Content-Type,Cache-Control,Connection")

	// Send immediate response to establish connection
	c.Context().SetBodyStreamWriter(func(w *bufio.Writer) {
		clientIP := c.IP() // Capture client IP for logging in stream
		
		defer func() {
			if r := recover(); r != nil {
				log.Printf("[PANIC] Client %s: Panic in stream writer: %v", clientIP, r)
			}
			log.Printf("[STREAM] Client %s: Stream writer ended", clientIP)
		}()

		messageID := fmt.Sprintf("msg-%d", time.Now().UnixNano())
		log.Printf("[STREAM] Client %s: Starting stream for message ID: %s", clientIP, messageID)

		// Send streaming start event
		if err := h.writeEvent(w, StreamingStartEvent{
			Type:      "STREAMING_START",
			MessageID: messageID,
		}); err != nil {
			log.Printf("[ERROR] Client %s: Error writing start event: %v", clientIP, err)
			return
		}
		w.Flush()

		// Small delay to simulate processing
		time.Sleep(200 * time.Millisecond)

		// Generate response using decoded message
		response := h.generateResponse(decodedMessage)
		log.Printf("[RESPONSE] Client %s: Generated response: %s", clientIP, response)
		
		// Stream the response word by word with better error handling
		words := strings.Fields(response)
		for i, word := range words {
			content := word
			if i < len(words)-1 {
				content += " "
			}
			
			if err := h.writeEvent(w, TextMessageEvent{
				Type:       "TEXT_MESSAGE_CONTENT",
				Content:    content,
				IsComplete: i == len(words)-1,
			}); err != nil {
				log.Printf("[ERROR] Client %s: Error writing text event: %v", clientIP, err)
				break
			}

			// Flush after each word
			w.Flush()
			
			// Add small delay between words
			time.Sleep(50 * time.Millisecond)
		}

		// Always send streaming end event to ensure connection closes
		if err := h.writeEvent(w, StreamingEndEvent{
			Type: "STREAMING_END",
		}); err != nil {
			log.Printf("[ERROR] Client %s: Error writing end event: %v", clientIP, err)
		}
		
		w.Flush()
		log.Printf("[STREAM] Client %s: Stream completed for message ID: %s", clientIP, messageID)
		
		// Force close the connection by sending a close signal
		time.Sleep(100 * time.Millisecond)
	})

	return nil
}

// generateResponse creates a simple response (will be replaced with OpenAI integration)
func (h *ChatHandler) generateResponse(message string) string {
	message = strings.ToLower(message)
	
	if strings.Contains(message, "hiking") || strings.Contains(message, "trail") {
		return "I found some great hiking trails in your area! Here are a few popular options: Bear Mountain Trail (moderate difficulty, 3.2 miles), Sunset Ridge Loop (easy, 1.8 miles), and Eagle Peak Summit (challenging, 5.7 miles). Would you like more details about any of these trails?"
	}
	
	if strings.Contains(message, "cycling") || strings.Contains(message, "bike") {
		return "There are several excellent cycling routes nearby! I recommend the Riverside Path (easy, 8 miles of paved trail), Mountain Loop Road (moderate, 12 miles with scenic views), and the Advanced Hill Circuit (challenging, 15 miles with steep climbs). Which type of cycling experience are you looking for?"
	}
	
	if strings.Contains(message, "restaurant") || strings.Contains(message, "food") || strings.Contains(message, "eat") {
		return "Here are some great local restaurants: The Mountain View Café (farm-to-table, outdoor seating), Trailhead Grill (burgers and craft beer), and Summit Bistro (fine dining with valley views). What type of cuisine are you in the mood for?"
	}
	
	// Default response
	return "Thanks for your message! I'm here to help you discover outdoor activities, restaurants, and local attractions. You can ask me about hiking trails, cycling routes, places to eat, or any other activities you're interested in. What would you like to explore today?"
}

// writeEvent writes an AG-UI event to the stream
func (h *ChatHandler) writeEvent(w *bufio.Writer, event interface{}) error {
	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Error marshaling event: %v", err)
		return err
	}

	_, err = fmt.Fprintf(w, "data: %s\n\n", data)
	if err != nil {
		log.Printf("Error writing event: %v", err)
		return err
	}
	
	return nil
}
