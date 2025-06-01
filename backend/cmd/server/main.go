package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"community-chatbot/internal/config"
	"community-chatbot/internal/handlers"
	"community-chatbot/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize database
	db, err := initDatabase(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize Fiber app
	app := fiber.New(fiber.Config{
		AppName: "Community Chatbot API",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(models.CreateErrorResponse(err.Error()))
		},
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.CORS.AllowOrigins,
		AllowMethods: cfg.CORS.AllowMethods,
		AllowHeaders: cfg.CORS.AllowHeaders,
	}))

	// Setup routes
	setupRoutes(app, db)

	// Start server
	port := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Printf("Starting server on port %d", cfg.Server.Port)

	// Graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-c
		log.Println("Gracefully shutting down...")
		app.Shutdown()
	}()

	if err := app.Listen(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// initDatabase initializes the database connection and runs migrations
func initDatabase(cfg *config.Config) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(cfg.GetDatabaseDSN()), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto-migrate models
	if err := db.AutoMigrate(
		&models.Activity{},
		&models.Image{},
		&models.Route{},
		&models.User{},
		&models.UserPreferences{},
	); err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database connected and migrated successfully")
	return db, nil
}

// setupRoutes configures all API routes
func setupRoutes(app *fiber.App, db *gorm.DB) {
	// Health check
	healthHandler := handlers.NewHealthHandler(db)
	app.Get("/health", healthHandler.GetHealth)

	// API v1 routes
	v1 := app.Group("/api/v1")
	
	// Health check for API
	v1.Get("/health", healthHandler.GetHealth)
}
