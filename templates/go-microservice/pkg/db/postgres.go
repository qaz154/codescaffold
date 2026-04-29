package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"{{PROJECT_NAME}}/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

var pool *pgxpool.Pool

func InitDB() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgresql://CHANGE_ME@localhost:5432/{{PROJECT_NAME}}"
	}

	var err error
	pool, err = pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("Unable to ping database: %v", err)
	}

	log.Println("Connected to database")
}

func CloseDB() {
	if pool != nil {
		pool.Close()
	}
}

func CreateUser(user *models.User) error {
	query := `
		INSERT INTO users (id, email, username, hashed_password, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := pool.Exec(context.Background(), query,
		user.ID, user.Email, user.Username, user.HashedPassword,
		user.IsActive, time.Now(), time.Now())
	return err
}

func GetUser(id string) (*models.User, error) {
	query := `
		SELECT id, email, username, hashed_password, is_active, created_at, updated_at
		FROM users WHERE id = $1
	`
	user := &models.User{}
	err := pool.QueryRow(context.Background(), query, id).Scan(
		&user.ID, &user.Email, &user.Username, &user.HashedPassword,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}
	return user, nil
}

func ListUsers(limit, offset int) ([]models.User, error) {
	query := `
		SELECT id, email, username, hashed_password, is_active, created_at, updated_at
		FROM users LIMIT $1 OFFSET $2
	`
	rows, err := pool.Query(context.Background(), query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		err := rows.Scan(&user.ID, &user.Email, &user.Username, &user.HashedPassword,
			&user.IsActive, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func UpdateUser(user *models.User) error {
	query := `
		UPDATE users SET email = $1, username = $2, updated_at = $3 WHERE id = $4
	`
	_, err := pool.Exec(context.Background(), query, user.Email, user.Username, time.Now(), user.ID)
	return err
}

func DeleteUser(id string) error {
	query := `DELETE FROM users WHERE id = $1`
	result, err := pool.Exec(context.Background(), query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("user not found")
	}
	return nil
}
