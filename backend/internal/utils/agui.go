package utils

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// AGUIEvent represents an AG-UI compatible event for streaming
type AGUIEvent struct {
	Type      string      `json:"type"`
	ID        string      `json:"id"`
	Data      interface{} `json:"data,omitempty"`
	Timestamp int64       `json:"timestamp"`
}

// AG-UI Event Types as defined in the documentation
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

// Event Data Structures for different event types
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

// NewAGUIEvent creates a new AG-UI event with auto-generated ID and timestamp
func NewAGUIEvent(eventType string, data interface{}) AGUIEvent {
	return AGUIEvent{
		Type:      eventType,
		ID:        generateEventID(),
		Data:      data,
		Timestamp: time.Now().Unix(),
	}
}

// ToSSE converts the event to Server-Sent Event format
func (e AGUIEvent) ToSSE() []byte {
	data, _ := json.Marshal(e)
	return []byte("data: " + string(data) + "\n\n")
}

// generateEventID creates a unique ID for events
func generateEventID() string {
	return fmt.Sprintf("evt_%s", uuid.New().String()[:8])
}

