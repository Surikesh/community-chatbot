package models

import (
	"time"

	"gorm.io/gorm"
)

// Image represents an image associated with an activity
type Image struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	ActivityID uint           `gorm:"not null;index" json:"activity_id"`
	URL        string         `gorm:"size:500;not null" json:"url" validate:"required,url"`
	Caption    string         `gorm:"size:255" json:"caption"`
	Approved   bool           `gorm:"default:false" json:"approved"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName returns the table name for Image
func (Image) TableName() string {
	return "images"
}

// Route represents a GPX route associated with an activity
type Route struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	ActivityID     uint           `gorm:"not null;index" json:"activity_id"`
	GPXFileURL     string         `gorm:"size:500" json:"gpx_file_url"`
	Name           string         `gorm:"size:255" json:"name"`
	DistanceKM     float64        `gorm:"type:decimal(8,2)" json:"distance_km"`
	ElevationGainM int            `json:"elevation_gain_m"`
	RouteType      string         `gorm:"size:50" json:"route_type"` // hiking, cycling, driving
	Difficulty     string         `gorm:"size:50" json:"difficulty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName returns the table name for Route
func (Route) TableName() string {
	return "routes"
}
