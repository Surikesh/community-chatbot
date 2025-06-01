package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Email     string         `gorm:"size:255;unique" json:"email" validate:"email"`
	Name      string         `gorm:"size:255" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName returns the table name for User
func (User) TableName() string {
	return "users"
}

// UserPreferences represents user preferences and settings
type UserPreferences struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	UserID              uint      `gorm:"unique;not null;index" json:"user_id"`
	LocationLat         float64   `gorm:"type:decimal(10,8)" json:"location_lat"`
	LocationLng         float64   `gorm:"type:decimal(11,8)" json:"location_lng"`
	SearchRadiusKM      int       `gorm:"default:50" json:"search_radius_km"`
	PreferredActivities []string  `gorm:"type:text[]" json:"preferred_activities"`
	DifficultyLevel     string    `gorm:"size:50" json:"difficulty_level"`
	TransportMode       string    `gorm:"size:50;default:car" json:"transport_mode"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
	User                User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName returns the table name for UserPreferences
func (UserPreferences) TableName() string {
	return "user_preferences"
}

// GetLocation returns the user's location as a Location struct
func (up *UserPreferences) GetLocation() Location {
	return Location{
		Lat: up.LocationLat,
		Lng: up.LocationLng,
	}
}

// SetLocation sets the user's location from a Location struct
func (up *UserPreferences) SetLocation(loc Location) {
	up.LocationLat = loc.Lat
	up.LocationLng = loc.Lng
}

// HasValidLocation checks if the user has set a valid location
func (up *UserPreferences) HasValidLocation() bool {
	return up.LocationLat != 0 && up.LocationLng != 0
}
