# main.py

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import timedelta
import logging
import os

# --- FIXED IMPORTS ---
# All routers are assumed to be inside the 'backend' package
from admin import router as admin_router
from assessment import router as assessment_router
from payments import router as payments_router
from content import router as content_router
from gamification import router as gamification_router
from community import router as community_router

# Import DB Tables (User) and connection functions (get_db, init_db)
from database import get_db, User, init_db

# --- FIX 1: Consolidated all schema imports to 'models.py' ---
# Removed the duplicate import from 'schemas.py'
from models import (
    UserCreate,
    UserLogin,
    TokenResponse,
    UserResponse,
    PasswordResetRequest,
    PasswordReset as PasswordResetModel,
    UserProfile
)
# (TokenPayload is not used in main.py, so it's not imported here)
# --- End of Fix 1 ---

from auth import (
    AuthService,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="MindfulPath API",
    description="Production-ready wellness & mindfulness platform",
    version="1.0.0",
)

# CORS Configuration
# CORS Configuration
# CORS Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:8000,http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware for request logging


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log incoming requests."""
    logger.info("%s %s", request.method, request.url.path)
    response = await call_next(request)
    return response

# Include all routers
app.include_router(admin_router)
app.include_router(assessment_router)
app.include_router(payments_router)
app.include_router(content_router)
app.include_router(gamification_router)
app.include_router(community_router)

# Exception handlers


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    logger.error("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )

# ====== AUTHENTICATION ENDPOINTS ======


@app.post(
    "/api/v1/auth/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    """
    Register a new user (UM-01, UM-02).
    """
    logger.info("Registration attempt: %s", user_data.email)

    if not (
        user_data.terms_accepted
        and user_data.privacy_accepted
        and user_data.consent_accepted
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must accept all terms and policies to register",
        )

    new_user, error = AuthService.create_user(db, user_data)
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error,
        )

    access_token, _ = AuthService.create_access_token(
        new_user,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    logger.info("User registered successfully: %s", new_user.email)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        # --- FIX 2: Use .model_validate() for Pydantic v2 ---
        user=UserResponse.model_validate(new_user),
    )


@app.post("/api/v1/auth/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Login user with email and password (UM-01).
    """
    logger.info("Login attempt: %s", credentials.email)

    user, error = AuthService.authenticate_user(
        db, credentials.email, credentials.password
    )
    if error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error,
        )

    access_token, _ = AuthService.create_access_token(
        user,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    logger.info("User logged in successfully: %s", user.email)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        # --- FIX 2: Use .model_validate() for Pydantic v2 ---
        user=UserResponse.model_validate(user),
    )


@app.post("/api/v1/auth/password-reset-request")
async def request_password_reset(
    request_data: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    """
    Request password reset (UM-03).
    """
    logger.info("Password reset request: %s", request_data.email)
    user = AuthService.get_user_by_email(db, request_data.email)

    if user:
        token = AuthService.generate_password_reset_token(db, user.id)
        if token:
            logger.info("Reset token generated for user: %s", user.email)
            # TODO: Send email
            pass
    return {
        "message": "If the email exists, a password reset link has been sent."
    }


@app.post("/api/v1/auth/password-reset")
async def reset_password(
    reset_data: PasswordResetModel,
    db: Session = Depends(get_db),
):
    """
    Reset password using token (UM-03).
    """
    logger.info("Password reset attempt")
    success, message = AuthService.reset_password(
        db, reset_data.token, reset_data.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )
    return {"message": message}


# ====== USER PROFILE ENDPOINTS ======

@app.get("/api/v1/auth/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Get current authenticated user profile.
    """
    # --- FIX 2: Use .model_validate() for Pydantic v2 ---
    return UserResponse.model_validate(current_user)


@app.put("/api/v1/auth/profile", response_model=UserResponse)
async def update_user_profile(
    profile_data: UserProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update user profile (UM-03).
    """
    logger.info("Profile update request for user: %s", current_user.email)

    # Get a dictionary of only the fields the user actually sent
    update_data = profile_data.model_dump(exclude_unset=True)

    try:
        for key, value in update_data.items():
            setattr(current_user, key, value)

        db.commit()
        db.refresh(current_user)
        logger.info("Profile updated for user: %s", current_user.email)

        # --- FIX 2: Use .model_validate() for Pydantic v2 ---
        return UserResponse.model_validate(current_user)

    except Exception as e:
        db.rollback()
        logger.error("Error updating profile: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile",
        ) from e


# ====== HEALTH CHECK ======

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "MindfulPath API"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "MindfulPath API - Production Ready",
        "version": "1.0.0",
    }


# ====== STARTUP & SHUTDOWN EVENTS ======

@app.on_event("startup")
async def startup_event():
    """Startup tasks."""
    logger.info("MindfulPath API starting up...")
    # Initialize DB tables (will log but not raise on failure)
    init_db()


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown tasks."""
    logger.info("MindfulPath API shutting down...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000,
                reload=True)
