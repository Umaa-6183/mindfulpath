# auth.py

from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, Tuple
import jwt
import os
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import secrets
import logging

# --- FIX 1: Cleaned up Imports ---

# Import DB Tables (SQLAlchemy) and get_db
from database import User, PasswordReset, ConsentLog, RoleEnum, get_db

# Import Pydantic Schemas this file *actually uses* from models.py
from models import TokenPayload, UserCreate

# --- End of Fix ---

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# JWT Configuration
SECRET_KEY = os.getenv(
    "SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours


class AuthService:
    """Authentication service for user operations."""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using Argon2."""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, password_hash: str) -> bool:
        """Verify password against hash."""
        try:
            return pwd_context.verify(plain_password, password_hash)
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False

    @staticmethod
    def create_access_token(user: User, expires_delta: Optional[timedelta] = None) -> Tuple[str, datetime]:
        """Create JWT access token."""
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        payload = {
            "sub": user.id,
            "email": user.email,
            "role": user.role.value,
            "iat": datetime.utcnow(),
            "exp": expire,
        }

        encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt, expire

    @staticmethod
    def verify_token(token: str) -> Optional[TokenPayload]:
        """Verify and decode JWT token."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            # --- FIX 2: Use .model_validate() for Pydantic v2 ---
            return TokenPayload.model_validate(payload)
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {e}")
            return None

    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> Tuple[Optional[User], Optional[str]]:
        """
        Create a new user with consent logging (UM-02 compliance).
        Returns: (User, None) on success, (None, error_message) on failure.
        """
        # Check consent flags
        if not (user_data.terms_accepted and user_data.privacy_accepted and user_data.consent_accepted):
            return None, "You must accept Terms, Privacy Policy, and Data Consent to register."

        # Check if user exists
        existing_user = db.query(User).filter(
            User.email == user_data.email).first()
        if existing_user:
            return None, "Email already registered."

        try:
            # Create user
            new_user = User(
                email=user_data.email,
                password_hash=AuthService.hash_password(user_data.password),
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                age=user_data.age,
                gender=user_data.gender,
                country=user_data.country,
                timezone=user_data.timezone,
                role=RoleEnum.USER,
                terms_accepted=True,
                privacy_accepted=True,
                consent_accepted=True,
                is_active=True,
                is_email_verified=False,
            )

            db.add(new_user)
            db.flush()  # Flush to get the user ID

            # Log consent (GDPR compliance - UM-02)
            consent_log = ConsentLog(
                user_id=new_user.id,
                terms_version="1.0",
                privacy_version="1.0",
                ip_address=None,  # Set by middleware if needed
                user_agent=None,  # Set by middleware if needed
            )
            db.add(consent_log)
            db.commit()

            logger.info(f"User created successfully: {new_user.email}")
            return new_user, None

        except Exception as e:
            db.rollback()
            logger.error(f"Error creating user: {e}")
            return None, "Registration failed. Please try again."

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Tuple[Optional[User], Optional[str]]:
        """
        Authenticate user with email and password.
        Returns: (User, None) on success, (None, error_message) on failure.
        """
        user = db.query(User).filter(User.email == email).first()

        if not user:
            logger.warning(f"Login attempt with non-existent email: {email}")
            return None, "Invalid email or password."

        if not user.is_active:
            return None, "User account is inactive."

        if not AuthService.verify_password(password, user.password_hash):
            logger.warning(f"Failed login attempt for user: {email}")
            return None, "Invalid email or password."

        # Update last login
        try:
            user.last_login = datetime.utcnow()
            db.commit()
        except Exception as e:
            logger.error(f"Error updating last login: {e}")

        return user, None

    @staticmethod
    def generate_password_reset_token(db: Session, user_id: int) -> Optional[str]:
        """Generate a secure password reset token."""
        try:
            token = secrets.token_urlsafe(32)
            expires_at = datetime.utcnow() + timedelta(hours=1)

            reset_record = PasswordReset(
                user_id=user_id,
                token=token,
                expires_at=expires_at,
            )

            db.add(reset_record)
            db.commit()

            return token

        except Exception as e:
            logger.error(f"Error generating reset token: {e}")
            db.rollback()
            return None

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str) -> Tuple[bool, str]:
        """
        Reset password using token.
        Returns: (success, message)
        """
        try:
            reset_record = db.query(PasswordReset).filter(
                PasswordReset.token == token,
                PasswordReset.used_at == None,
            ).first()

            if not reset_record:
                return False, "Invalid or expired reset token."

            if reset_record.expires_at < datetime.utcnow():
                return False, "Reset token has expired."

            user = db.query(User).filter(
                User.id == reset_record.user_id).first()
            if not user:
                return False, "User not found."

            # Update password
            user.password_hash = AuthService.hash_password(new_password)
            reset_record.used_at = datetime.utcnow()

            db.commit()
            logger.info(f"Password reset successful for user: {user.email}")
            return True, "Password reset successful."

        except Exception as e:
            logger.error(f"Error resetting password: {e}")
            db.rollback()
            return False, "Password reset failed."

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()

# --- Dependencies ---


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:

    token_payload = AuthService.verify_token(token)
    if not token_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = AuthService.get_user_by_id(db, token_payload.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


async def admin_required(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to ensure user is an admin.
    Must be used after get_current_user.
    """
    if current_user.role != RoleEnum.ADMIN:
        logger.warning(
            f"Unauthorized admin access attempt by user: {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


async def coach_required(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to ensure user is a coach.
    """
    if current_user.role not in [RoleEnum.ADMIN, RoleEnum.COACH]:
        logger.warning(
            f"Unauthorized coach access attempt by user: {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach access required",
        )
    return current_user
