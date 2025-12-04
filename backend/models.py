# /backend/models.py
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date  # <--- FIX 1: Added 'date' import
from enum import Enum


class RoleEnum(str, Enum):
    """User roles."""
    USER = "user"
    ADMIN = "admin"
    COACH = "coach"


class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=255)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)

    # Consent flags (REQUIRED for UM-02)
    terms_accepted: bool = Field(..., description="User must accept T&C")
    privacy_accepted: bool = Field(...,
                                   description="User must accept Privacy Policy")
    consent_accepted: bool = Field(...,
                                   description="User must accept data handling consent")

    # Optional profile
    age: Optional[int] = Field(None, ge=13, le=120)
    gender: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    timezone: Optional[str] = Field(None, max_length=50)

    @field_validator('password')
    def validate_password(cls, v):
        """Enforce password strength."""
        if not any(c.isupper() for c in v):
            raise ValueError(
                'Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in '!@#$%^&*' for c in v):
            raise ValueError(
                'Password must contain at least one special character')
        return v

    @field_validator('terms_accepted', 'privacy_accepted', 'consent_accepted', mode='before')
    def check_consent(cls, v):
        """Ensure all consents are True."""
        if not v:
            raise ValueError('You must accept all terms to register')
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response (no password)."""
    id: int
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    role: RoleEnum
    is_active: bool
    is_email_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class TokenPayload(BaseModel):
    """Schema for JWT token payload."""
    sub: int  # user_id
    email: str
    role: RoleEnum
    iat: datetime
    exp: datetime


class PasswordResetRequest(BaseModel):
    """Schema for password reset request."""
    email: EmailStr


class PasswordReset(BaseModel):
    """Schema for password reset with token."""
    token: str
    new_password: str = Field(..., min_length=8, max_length=255)

    @field_validator('new_password')
    def validate_password(cls, v):
        """Enforce password strength."""
        if not any(c.isupper() for c in v):
            raise ValueError(
                'Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in '!@#$%^&*' for c in v):
            raise ValueError(
                'Password must contain at least one special character')
        return v


class UserProfile(BaseModel):
    """Schema for user profile update."""
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    age: Optional[int] = Field(None, ge=13, le=120)
    gender: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    timezone: Optional[str] = Field(None, max_length=50)


class ContentType(str, Enum):
    """Content types."""
    NLP = "nlp"
    YOGA = "yoga"
    MEDITATION = "meditation"


class ContentCreate(BaseModel):
    """Schema for creating content (AD-01)."""
    content_type: ContentType
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=20)
    instructor: Optional[str] = Field(None, max_length=255)
    duration_minutes: Optional[int] = Field(None, ge=1, le=600)
    difficulty_level: Optional[str] = Field(None, max_length=50)
    tags: Optional[List[str]] = None
    target_domain: Optional[str] = None
    recommended_score_range: Optional[Dict[str, int]] = None


class ContentUpdate(BaseModel):
    """Schema for updating content."""
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    description: Optional[str] = None
    instructor: Optional[str] = None
    duration_minutes: Optional[int] = None
    difficulty_level: Optional[str] = None
    tags: Optional[List[str]] = None
    target_domain: Optional[str] = None
    recommended_score_range: Optional[Dict[str, int]] = None
    is_published: Optional[bool] = None


class ContentResponse(BaseModel):
    """Schema for content response."""
    id: int
    content_type: ContentType
    title: str
    description: str
    instructor: Optional[str]
    duration_minutes: Optional[int]
    difficulty_level: Optional[str]
    file_url: Optional[str]
    thumbnail_url: Optional[str]
    tags: Optional[List[str]]
    target_domain: Optional[str]
    is_published: bool
    view_count: int
    rating: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AssessmentResultResponse(BaseModel):
    """Schema for assessment result response."""
    id: int
    user_id: int
    level: int
    domain: str
    domain_score: int
    overall_score: Optional[int]
    wellness_stage: Optional[str]
    answer: str
    completed_at: datetime

    class Config:
        from_attributes = True


class PaymentLogResponse(BaseModel):
    """Schema for payment log response."""
    id: int
    user_id: int
    amount: str  # Decimal is often returned as string in JSON
    currency: str
    payment_gateway: str
    transaction_id: str
    service_type: str
    status: str
    is_refunded: bool
    initiated_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class UserAnalyticsResponse(BaseModel):
    """Schema for user analytics."""
    user_id: int
    total_logins: int
    assessments_completed: int
    content_viewed: int
    last_active: Optional[datetime]
    total_time_minutes: int
    payment_history: List[PaymentLogResponse]


class AdminActionCreate(BaseModel):
    """Schema for creating admin action logs."""
    action: str
    resource_type: str
    resource_id: Optional[int] = None
    details: Optional[Dict[str, Any]] = None


class UserDetailedResponse(BaseModel):
    """Detailed user response for admin."""
    id: int
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    role: str
    is_active: bool
    is_email_verified: bool
    age: Optional[int]
    gender: Optional[str]
    country: Optional[str]
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True


class DailyPracticeCreate(BaseModel):
    """Schema for logging daily practice."""
    practice_type: str = Field(
        ..., pattern=r"^(meditation|yoga|nlp)$"
    )
    duration_minutes: Optional[int] = Field(None, ge=1, le=600)
    intensity: Optional[str] = Field(
        None, pattern=r"^(low|medium|high)$"
    )
    content_id: Optional[int] = None
    notes: Optional[str] = None


class DailyPracticeResponse(BaseModel):
    """Schema for practice log response."""
    id: int
    user_id: int
    practice_type: str
    duration_minutes: Optional[int]
    intensity: Optional[str]

    # --- FIX 2: Changed type from str to date to match Database ---
    logged_date: Union[date, str]
    # -------------------------------------------------------------

    created_at: datetime

    class Config:
        from_attributes = True


class BadgeResponse(BaseModel):
    """Schema for badge response."""
    id: int
    name: str
    description: str
    icon_url: Optional[str]
    criteria_type: str
    criteria_value: int


class UserBadgeResponse(BaseModel):
    """Schema for user badge (earned)."""
    badge: BadgeResponse
    earned_at: datetime

    class Config:
        from_attributes = True


class StreakResponse(BaseModel):
    """Schema for streak response."""
    user_id: int
    current_streak: int
    longest_streak: int
    practice_type: str

    # --- FIX 3: Changed types from Optional[str] to Optional[date] ---
    last_practice_date: Optional[date]
    streak_started_at: Optional[date]
    # -----------------------------------------------------------------

    class Config:
        from_attributes = True


class UserProgressResponse(BaseModel):
    """Schema for user progress with gamification."""
    current_streak: int
    longest_streak: int
    total_sessions: int
    badges_earned: int
    total_minutes: int
    weekly_progress: List[int]  # Monday-Sunday
    monthly_progress: List[int]  # Day 1-31


class LeaderboardEntryResponse(BaseModel):
    """Schema for leaderboard entry."""
    rank: int
    user_name: str
    current_streak: int
    total_sessions: int
    total_minutes: int


class ForumCategoryResponse(BaseModel):
    """Schema for forum category response."""
    id: int
    name: str
    description: str
    icon: Optional[str]
    color: Optional[str]
    thread_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ForumThreadCreate(BaseModel):
    """Schema for creating forum thread."""
    category_id: int
    title: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10)


class ForumThreadResponse(BaseModel):
    """Schema for forum thread response."""
    id: int
    category_id: int
    user_id: int
    title: str
    description: str
    view_count: int
    reply_count: int
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
    last_reply_at: Optional[datetime]

    class Config:
        from_attributes = True


class ForumPostCreate(BaseModel):
    """Schema for creating forum post."""
    thread_id: int
    content: str = Field(..., min_length=5)
    parent_post_id: Optional[int] = None


class ForumPostResponse(BaseModel):
    """Schema for forum post response."""
    id: int
    thread_id: int
    user_id: int
    content: str
    like_count: int
    is_marked_helpful: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProgressShareResponse(BaseModel):
    """Schema for progress share response."""
    id: int
    user_id: int
    share_type: str
    share_token: str
    is_public: bool
    view_count: int
    created_at: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True

# --- NEW PAYPAL SCHEMAS ---


class PaymentCreateBody(BaseModel):
    level: int
    currency: str  # e.g., "USD", "GBP", "INR"


class PaymentExecuteBody(BaseModel):
    paymentId: str
    PayerID: str

# This schema is used by assessment.py


class AnswersBody(BaseModel):
    answers: Dict[str, str]  # e.g., {"0": "A", "1": "C", ...}
