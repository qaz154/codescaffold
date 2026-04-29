package tests

import (
	"testing"

	"{{PROJECT_NAME}}/internal/auth"
)

func TestHashPassword(t *testing.T) {
	password := "testpassword123"

	hash, err := auth.HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	if hash == password {
		t.Error("Hash should be different from password")
	}

	if len(hash) == 0 {
		t.Error("Hash should not be empty")
	}
}

func TestVerifyPassword(t *testing.T) {
	password := "testpassword123"

	hash, err := auth.HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	if !auth.VerifyPassword(password, hash) {
		t.Error("VerifyPassword should return true for correct password")
	}

	if auth.VerifyPassword("wrongpassword", hash) {
		t.Error("VerifyPassword should return false for incorrect password")
	}
}

func TestGenerateAndValidateToken(t *testing.T) {
	userID := "user123"
	email := "test@example.com"
	role := "user"

	token, err := auth.GenerateToken(userID, email, role)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	if token == "" {
		t.Error("Token should not be empty")
	}

	claims, err := auth.ValidateToken(token)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("Expected UserID %s, got %s", userID, claims.UserID)
	}

	if claims.Email != email {
		t.Errorf("Expected Email %s, got %s", email, claims.Email)
	}

	if claims.Role != role {
		t.Errorf("Expected Role %s, got %s", role, claims.Role)
	}
}

func TestValidateInvalidToken(t *testing.T) {
	_, err := auth.ValidateToken("invalid.token.here")
	if err == nil {
		t.Error("Should return error for invalid token")
	}
}

func TestDifferentPasswordsProduceDifferentHashes(t *testing.T) {
	password := "testpassword123"

	hash1, _ := auth.HashPassword(password)
	hash2, _ := auth.HashPassword(password)

	if hash1 == hash2 {
		t.Error("Same password should produce different hashes due to salt")
	}
}
