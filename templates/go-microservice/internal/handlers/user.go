package handlers

import (
	"net/http"

	"{{PROJECT_NAME}}/internal/models"
	"{{PROJECT_NAME}}/pkg/db"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

type UpdateUserRequest struct {
	Email    *string `json:"email"`
	Username *string `json:"username"`
}

type UserResponse struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Username  string `json:"username"`
	IsActive  bool   `json:"is_active"`
	CreatedAt string `json:"created_at"`
}

func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "healthy"})
}

func CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := models.User{
		ID:           uuid.New().String(),
		Email:        req.Email,
		Username:     req.Username,
		HashedPassword: req.Password,
		IsActive:     true,
	}

	if err := db.CreateUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Username:  user.Username,
		IsActive:  user.IsActive,
		CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func ListUsers(c *gin.Context) {
	users, err := db.ListUsers(100, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list users"})
		return
	}

	response := make([]UserResponse, len(users))
	for i, user := range users {
		response[i] = UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Username:  user.Username,
			IsActive:  user.IsActive,
			CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	c.JSON(http.StatusOK, response)
}

func GetUser(c *gin.Context) {
	id := c.Param("id")

	user, err := db.GetUser(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Username:  user.Username,
		IsActive:  user.IsActive,
		CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := db.GetUser(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if req.Email != nil {
		user.Email = *req.Email
	}
	if req.Username != nil {
		user.Username = *req.Username
	}

	if err := db.UpdateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Username:  user.Username,
		IsActive:  user.IsActive,
		CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	if err := db.DeleteUser(id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.Status(http.StatusNoContent)
}
