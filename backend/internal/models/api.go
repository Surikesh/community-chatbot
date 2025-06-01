package models

// APIResponse represents the standard API response format
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
	Meta    *MetaData   `json:"meta,omitempty"`
}

// MetaData contains pagination and additional metadata
type MetaData struct {
	TotalCount int `json:"total_count,omitempty"`
	Page       int `json:"page,omitempty"`
	PageSize   int `json:"page_size,omitempty"`
}

// CreateSuccessResponse creates a successful API response
func CreateSuccessResponse(data interface{}) APIResponse {
	return APIResponse{
		Success: true,
		Data:    data,
	}
}

// CreateSuccessResponseWithMeta creates a successful API response with metadata
func CreateSuccessResponseWithMeta(data interface{}, meta *MetaData) APIResponse {
	return APIResponse{
		Success: true,
		Data:    data,
		Meta:    meta,
	}
}

// CreateErrorResponse creates an error API response
func CreateErrorResponse(message string) APIResponse {
	return APIResponse{
		Success: false,
		Error:   message,
	}
}

// CreateMessageResponse creates a message-only API response
func CreateMessageResponse(message string) APIResponse {
	return APIResponse{
		Success: true,
		Message: message,
	}
}
