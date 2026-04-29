import pytest
from app.auth import verify_password, get_password_hash, create_access_token, decode_access_token


class TestPasswordHashing:
    """Tests for password hashing utilities."""

    def test_password_hash_is_different_from_plain(self):
        """Hashed password should be different from plain text."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert hashed != password

    def test_verify_correct_password(self):
        """verify_password should return True for correct password."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True

    def test_verify_incorrect_password(self):
        """verify_password should return False for incorrect password."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert verify_password("wrongpassword", hashed) is False

    def test_different_hashes_for_same_password(self):
        """Same password should produce different hashes (due to salt)."""
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        assert hash1 != hash2


class TestJWTTokens:
    """Tests for JWT token utilities."""

    def test_create_access_token(self):
        """Should create a valid access token."""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data)
        assert isinstance(token, str)
        assert len(token) > 0

    def test_decode_valid_token(self):
        """Should decode a valid access token."""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data)
        decoded = decode_access_token(token)
        assert decoded is not None
        assert decoded["sub"] == "user123"
        assert decoded["email"] == "test@example.com"

    def test_decode_invalid_token(self):
        """Should return None for invalid token."""
        decoded = decode_access_token("invalid.token.here")
        assert decoded is None

    def test_decode_empty_token(self):
        """Should return None for empty token."""
        decoded = decode_access_token("")
        assert decoded is None
