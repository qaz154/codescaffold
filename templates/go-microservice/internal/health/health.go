package health

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type HealthChecker interface {
	Health(ctx context.Context) error
}

type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp string            `json:"timestamp"`
	Checks    map[string]Check `json:"checks,omitempty"`
}

type Check struct {
	Status   string `json:"status"`
	Duration string `json:"duration,omitempty"`
	Error    string `json:"error,omitempty"`
}

type DatabaseChecker struct {
	db *sql.DB
}

func NewDatabaseChecker(db *sql.DB) *DatabaseChecker {
	return &DatabaseChecker{db: db}
}

func (dc *DatabaseChecker) Health(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return dc.db.PingContext(ctx)
}

// Liveness probe handler - K8s uses this to know when to restart the container
func LivenessHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, HealthResponse{
			Status:    "ok",
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		})
	}
}

// Readiness probe handler - K8s uses this to know when the container is ready to receive traffic
func ReadinessHandler(checkers ...HealthChecker) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		checks := make(map[string]Check)
		allHealthy := true

		for i, checker := range checkers {
			checkName := "checker"
			if len(checkers) > 1 {
				checkName = "checker_" + string(rune('a'+i))
			}

			start := time.Now()
			err := checker.Health(ctx)
			duration := time.Since(start)

			if err != nil {
				checks[checkName] = Check{
					Status:   "unhealthy",
					Duration: duration.String(),
					Error:    err.Error(),
				}
				allHealthy = false
			} else {
				checks[checkName] = Check{
					Status:   "healthy",
					Duration: duration.String(),
				}
			}
		}

		status := "ok"
		httpStatus := http.StatusOK
		if !allHealthy {
			status = "degraded"
			httpStatus = http.StatusServiceUnavailable
		}

		c.JSON(httpStatus, HealthResponse{
			Status:    status,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			Checks:    checks,
		})
	}
}
