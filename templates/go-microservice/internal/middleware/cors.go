package middleware

import (
	"time"

	"{{PROJECT_NAME}}/internal/logger"

	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func StructuredLogging(appLogger *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()

		fields := map[string]interface{}{
			"status":     status,
			"latency_ms": latency.Milliseconds(),
			"method":     c.Request.Method,
			"path":       path,
			"client_ip":  c.ClientIP(),
		}

		if userID, exists := c.Get("user_id"); exists {
			fields["user_id"] = userID
		}

		msg := "HTTP request"
		if status >= 500 {
			appLogger.Error(msg, fields)
		} else if status >= 400 {
			appLogger.Warn(msg, fields)
		} else {
			appLogger.Info(msg, fields)
		}
	}
}
