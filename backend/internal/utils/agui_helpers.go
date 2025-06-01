package utils

// Helper functions for creating common AG-UI events

// CreateTextEvent creates a text message event
func CreateTextEvent(text string, delta bool) AGUIEvent {
	return NewAGUIEvent(EventTextMessageContent, TextMessageData{
		Text:  text,
		Delta: delta,
	})
}

// CreateErrorEvent creates an error event
func CreateErrorEvent(message, code string) AGUIEvent {
	return NewAGUIEvent(EventError, ErrorData{
		Message: message,
		Code:    code,
	})
}

// CreateStateUpdateEvent creates a state update event
func CreateStateUpdateEvent(activities []interface{}, images []string, mapData interface{}) AGUIEvent {
	return NewAGUIEvent(EventStateUpdate, StateUpdateData{
		Activities: activities,
		Images:     images,
		MapData:    mapData,
	})
}

// CreateToolCallStartEvent creates a tool call start event
func CreateToolCallStartEvent(name string, args map[string]interface{}) AGUIEvent {
	return NewAGUIEvent(EventToolCallStart, ToolCallData{
		Name: name,
		Args: args,
	})
}

// CreateToolCallCompleteEvent creates a tool call complete event
func CreateToolCallCompleteEvent(name string, args map[string]interface{}) AGUIEvent {
	return NewAGUIEvent(EventToolCallComplete, ToolCallData{
		Name: name,
		Args: args,
	})
}
