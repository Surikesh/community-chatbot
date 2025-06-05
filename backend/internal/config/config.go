package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	log "github.com/sirupsen/logrus"
)

// Config holds all configuration values for the application
type Config struct {
	Database DatabaseConfig
	Server   ServerConfig
	OpenAI   OpenAIConfig
	Storage  StorageConfig
	CORS     CORSConfig
}

// DatabaseConfig contains database connection settings
type DatabaseConfig struct {
	URL      string
	Host     string
	Port     int
	User     string
	Password string
	Name     string
	SSLMode  string
}

// ServerConfig contains server configuration
type ServerConfig struct {
	Port        int
	Environment string
	LogLevel    string
}

// OpenAIConfig contains OpenAI API settings
type OpenAIConfig struct {
	APIKey string
	Model  string
}

// StorageConfig contains storage settings (Cloudinary)
type StorageConfig struct {
	CloudinaryURL string
	CloudName     string
	APIKey        string
	APISecret     string
}

// CORSConfig contains CORS settings
type CORSConfig struct {
	AllowOrigins string
	AllowMethods string
	AllowHeaders string
}

// Load reads configuration from environment variables and .env file
func Load() (*Config, error) {
	// Try to load .env file from different locations
	envFiles := []string{
		".env",                    // Current directory
		"backend/.env",           // From project root
		"../.env",                // From backend subdirectory
		"../../.env",             // From deeper nested paths
	}
	
	loaded := false
	for _, envFile := range envFiles {
		if err := godotenv.Load(envFile); err == nil {
			log.Infof("Loaded environment from %s", envFile)
			loaded = true
			break
		}
	}
	
	if !loaded {
		log.Info("No .env file found, using environment variables")
	}

	config := &Config{
		Database: DatabaseConfig{
			URL:      getEnv("DATABASE_URL", ""),
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvAsInt("DB_PORT", 5432),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),
			Name:     getEnv("DB_NAME", "community_chatbot"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		Server: ServerConfig{
			Port:        getEnvAsInt("PORT", 8080),
			Environment: getEnv("ENVIRONMENT", "development"),
			LogLevel:    getEnv("LOG_LEVEL", "info"),
		},
		OpenAI: OpenAIConfig{
			APIKey: getEnv("OPENAI_API_KEY", ""),
			Model:  getEnv("OPENAI_MODEL", "gpt-4"),
		},
		Storage: StorageConfig{
			CloudinaryURL: getEnv("CLOUDINARY_URL", ""),
			CloudName:     getEnv("CLOUDINARY_CLOUD_NAME", ""),
			APIKey:        getEnv("CLOUDINARY_API_KEY", ""),
			APISecret:     getEnv("CLOUDINARY_API_SECRET", ""),
		},
		CORS: CORSConfig{
			AllowOrigins: getEnv("CORS_ALLOW_ORIGINS", "*"),
			AllowMethods: getEnv("CORS_ALLOW_METHODS", "GET,POST,PUT,DELETE,OPTIONS"),
			AllowHeaders: getEnv("CORS_ALLOW_HEADERS", "Origin,Content-Type,Accept,Authorization"),
		},
	}

	// Validate required configuration
	if err := config.validate(); err != nil {
		return nil, fmt.Errorf("configuration validation failed: %w", err)
	}

	return config, nil
}

// validate checks that required configuration values are present
func (c *Config) validate() error {
	// For development, allow running without database initially
	if c.Server.Environment == "production" {
		if c.Database.URL == "" && c.Database.Password == "" {
			return fmt.Errorf("database URL or password is required in production")
		}
		
		if c.OpenAI.APIKey == "" {
			return fmt.Errorf("OpenAI API key is required in production")
		}
	}

	return nil
}

// GetDatabaseDSN returns the database connection string
func (c *Config) GetDatabaseDSN() string {
	if c.Database.URL != "" {
		return c.Database.URL
	}

	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Database.Host,
		c.Database.Port,
		c.Database.User,
		c.Database.Password,
		c.Database.Name,
		c.Database.SSLMode,
	)
}

// getEnv gets an environment variable with a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvAsInt gets an environment variable as integer with a default value
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
