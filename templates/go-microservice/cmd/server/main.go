package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"{{PROJECT_NAME}}/internal/handlers"
	"{{PROJECT_NAME}}/internal/health"
	"{{PROJECT_NAME}}/internal/logger"
	"{{PROJECT_NAME}}/internal/middleware"
	"{{PROJECT_NAME}}/pkg/db"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Initialize logger
	appLogger := logger.New("{{PROJECT_NAME}}")

	if err := godotenv.Load(); err != nil {
		appLogger.Warn("No .env file found, using environment variables", nil)
	}

	// Initialize database
	db.InitDB()
	defer db.CloseDB()
	appLogger.Info("Database connection established", nil)

	// Setup Gin
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()

	// Use structured logging middleware
	r.Use(middleware.StructuredLogging(appLogger))
	r.Use(gin.Recovery())

	// CORS
	r.Use(middleware.CORS())

	// Health check endpoints (for K8s probes)
	r.GET("/health/live", health.LivenessHandler())
	r.GET("/health/ready", health.ReadinessHandler())

	// API routes
	api := r.Group("/api/v1")
	{
		api.POST("/users", handlers.CreateUser)
		api.GET("/users", handlers.ListUsers)
		api.GET("/users/:id", handlers.GetUser)
		api.PUT("/users/:id", handlers.UpdateUser)
		api.DELETE("/users/:id", handlers.DeleteUser)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Create HTTP server
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	// Start server in goroutine
	go func() {
		appLogger.Info("Server starting", map[string]interface{}{"port": port})
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			appLogger.Error("Server failed to start", map[string]interface{}{"error": err.Error()})
			os.Exit(1)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	appLogger.Info("Shutting down server...", nil)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		appLogger.Error("Server forced to shutdown", map[string]interface{}{"error": err.Error()})
	}

	appLogger.Info("Server exited gracefully", nil)
}
