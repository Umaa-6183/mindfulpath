# /backend/tests/test_auth.py

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db, User, RoleEnum
from auth import AuthService

# --- FIX 1: Corrected Imports ---
# Import only the Pydantic schemas *used in this file* from models.py
from models import UserCreate, TokenPayload

# --- End of Fix ---


# Test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL,
                       connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db():
    """Create a test database session."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


class TestPasswordHashing:
    """Test password hashing and verification."""

    def test_hash_password(self):
        """Test that passwords are hashed correctly."""
        password = "TestPassword123!"
        hashed = AuthService.hash_password(password)
        assert hashed != password
        assert AuthService.verify_password(password, hashed)

    def test_verify_password_fails_with_wrong_password(self):
        """Test that verification fails with wrong password."""
        password = "TestPassword123!"
        hashed = AuthService.hash_password(password)
        assert not AuthService.verify_password("WrongPassword123!", hashed)


class TestUserCreation:
    """Test user creation and validation."""

    def test_create_user_success(self, db):
        """Test successful user creation."""
        user_data = UserCreate(
            email="test@example.com",
            password="TestPassword123!",
            first_name="John",
            last_name="Doe",
            terms_accepted=True,
            privacy_accepted=True,
            consent_accepted=True,
        )

        user, error = AuthService.create_user(db, user_data)
        assert error is None
        assert user is not None
        assert user.email == "test@example.com"
        assert user.first_name == "John"

    def test_create_user_duplicate_email(self, db):
        """Test that duplicate emails are rejected."""
        user_data = UserCreate(
            email="test@example.com",
            password="TestPassword123!",
            terms_accepted=True,
            privacy_accepted=True,
            consent_accepted=True,
        )

        # Create first user
        AuthService.create_user(db, user_data)

        # Try to create duplicate
        user, error = AuthService.create_user(db, user_data)
        assert error is not None
        assert "already registered" in error

    def test_create_user_missing_consent(self, db):
        """Test that missing consent is rejected."""
        user_data = UserCreate(
            email="test@example.com",
            password="TestPassword123!",
            terms_accepted=False,
            privacy_accepted=True,
            consent_accepted=True,
        )

        user, error = AuthService.create_user(db, user_data)
        assert error is not None
        assert "consent" in error.lower()


class TestUserAuthentication:
    """Test user authentication."""

    def test_authenticate_user_success(self, db):
        """Test successful authentication."""
        # Create user
        user_data = UserCreate(
            email="test@example.com",
            password="TestPassword123!",
            terms_accepted=True,
            privacy_accepted=True,
            consent_accepted=True,
        )
        AuthService.create_user(db, user_data)

        # Authenticate
        user, error = AuthService.authenticate_user(
            db, "test@example.com", "TestPassword123!")
        assert error is None
        assert user is not None
        assert user.email == "test@example.com"

    def test_authenticate_user_wrong_password(self, db):
        """Test authentication with wrong password."""
        user_data = UserCreate(
            email="test@example.com",
            password="TestPassword123!",
            terms_accepted=True,
            privacy_accepted=True,
            consent_accepted=True,
        )
        AuthService.create_user(db, user_data)

        user, error = AuthService.authenticate_user(
            db, "test@example.com", "WrongPassword123!")
        assert error is not None
        assert user is None


class TestTokenManagement:
    """Test JWT token creation and verification."""

    def test_create_access_token(self, db):
        """Test JWT token creation."""
        user_data = UserCreate(
            email="test@example.com",
            password="TestPassword123!",
            terms_accepted=True,
            privacy_accepted=True,
            consent_accepted=True,
        )
        user, _ = AuthService.create_user(db, user_data)

        token, expire = AuthService.create_access_token(user)
        assert token is not None
        assert expire is not None

    def test_verify_token_success(self, db):
        """Test JWT token verification."""
        user_data = UserCreate(
            email="test@example.com",
            password="TestPassword123!",
            terms_accepted=True,
            privacy_accepted=True,
            consent_accepted=True,
        )
        user, _ = AuthService.create_user(db, user_data)

        token, _ = AuthService.create_access_token(user)
        payload = AuthService.verify_token(token)
        assert payload is not None
        assert payload.sub == user.id
        assert payload.email == user.email
