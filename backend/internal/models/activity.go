package models

import (
	"time"

	"gorm.io/gorm"
)

// Location represents geographic coordinates
type Location struct {
	Lat float64 `json:"lat" validate:"latitude"`
	Lng float64 `json:"lng" validate:"longitude"`
}

// Activity represents an activity in the system
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

// TableName returns the table name for Activity
func (Activity) TableName() string {
	return "activities"
}

// GetLocation returns the activity's location as a Location struct
func (a *Activity) GetLocation() Location {
	return Location{
		Lat: a.Latitude,
		Lng: a.Longitude,
	}
}

// IsValid checks if the activity has required fields
func (a *Activity) IsValid() bool {
	return a.Name != "" && a.Category != "" && a.Latitude != 0 && a.Longitude != 0
}

// SetLocation sets the activity's location from a Location struct
func (a *Activity) SetLocation(loc Location) {
	a.Latitude = loc.Lat
	a.Longitude = loc.Lng
}
