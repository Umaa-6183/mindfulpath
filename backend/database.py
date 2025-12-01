# database.py
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    Text,
    Enum as SQLEnum,
    Float,
    JSON,
    DECIMAL,
    Date,
    UniqueConstraint,
    ForeignKey,
)
from datetime import datetime
from pathlib import Path
import logging
import enum
import os
from dotenv import load_dotenv
load_dotenv()


logger = logging.getLogger(__name__)

# --- 1. DATABASE CONNECTION LOGIC ---

# Prefer DATABASE_URL from environment. If not provided, fall back to a
# local SQLite DB for easy local development.
DEFAULT_PG_URL = "postgresql://postgres:Mindfulpath2025@localhost:5432/mindfulpath"
raw_db_url = os.environ.get("DATABASE_URL")

if not raw_db_url:
    # No DATABASE_URL set — use a local SQLite file for development
    base_dir = Path(__file__).resolve().parent
    sqlite_path = base_dir / "dev.db"
    DATABASE_URL = f"sqlite:///{sqlite_path}"
    connect_args = {"check_same_thread": False}
    logger.info(
        "No DATABASE_URL set — falling back to SQLite at %s", sqlite_path)
else:
    DATABASE_URL = raw_db_url
    connect_args = {}

# Create the engine
try:
    engine = create_engine(
        DATABASE_URL, connect_args=connect_args, pool_pre_ping=True
    )
except OperationalError as e:
    logger.error("Database connection failed: %s", e)
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Session:
    """Dependency for FastAPI to inject database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- 2. DATABASE MODELS ---

class RoleEnum(str, enum.Enum):
    """User roles."""
    USER = "user"
    ADMIN = "admin"
    COACH = "coach"


class User(Base):
    """User model with authentication and profile fields."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    role = Column(SQLEnum(RoleEnum), default=RoleEnum.USER, nullable=False)

    # Consent & T&C flags
    terms_accepted = Column(Boolean, default=False, nullable=False)
    privacy_accepted = Column(Boolean, default=False, nullable=False)
    consent_accepted = Column(Boolean, default=False, nullable=False)

    # Profile fields
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    timezone = Column(String(50), nullable=True)

    # Account status
    is_active = Column(Boolean, default=True, nullable=False)
    is_email_verified = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)

    # GDPR/Privacy
    data_retention_until = Column(DateTime, nullable=True)

    # --- Relationships ---
    results = relationship("AssessmentResult", back_populates="owner")
    payments = relationship("PaymentLog", back_populates="owner")
    logs = relationship("DailyPractice", back_populates="owner")
    badges = relationship("UserBadge", back_populates="owner")
    threads = relationship("ForumThread", back_populates="owner")
    posts = relationship("ForumPost", back_populates="owner")
    streaks = relationship("Streak", back_populates="owner", uselist=False)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"


class ConsentLog(Base):
    """Audit log for consent tracking (GDPR compliance)."""
    __tablename__ = "consent_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False)
    terms_version = Column(String(20), nullable=False)
    privacy_version = Column(String(20), nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    accepted_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class PasswordReset(Base):
    """Password reset tokens for secure reset flow."""
    __tablename__ = "password_resets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ContentType(str, enum.Enum):
    """Content types for CMS."""
    NLP = "nlp"
    YOGA = "yoga"
    MEDITATION = "meditation"


class Content(Base):
    """Content model for NLP, Yoga, and Meditation resources (AD-01)."""
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(SQLEnum(ContentType), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    instructor = Column(String(255), nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    difficulty_level = Column(String(50), nullable=True)
    file_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    transcript = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)
    target_domain = Column(String(100), nullable=True)
    recommended_score_range = Column(JSON, nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    rating = Column(Float, default=0.0, nullable=False)
    created_by_admin_id = Column(Integer, ForeignKey(
        "users.id"), index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return (
            f"<Content(id={self.id}, type={self.content_type}, "
            f"title={self.title})>"
        )


class AssessmentResult(Base):
    """Store user assessment scores and results (AS-02, AS-03)."""
    __tablename__ = "assessment_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False)
    level = Column(Integer, nullable=False)
    domain = Column(String(100), nullable=False)
    domain_score = Column(Integer, nullable=False)
    overall_score = Column(Integer, nullable=True)
    wellness_stage = Column(String(50), nullable=True)
    answer = Column(String(1), nullable=False)
    question_text = Column(Text, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    owner = relationship("User", back_populates="results")

    def __repr__(self):
        return (
            f"<AssessmentResult(user_id={self.user_id}, "
            f"level={self.level}, domain={self.domain})>"
        )


class PaymentLog(Base):
    """Track all payments and transactions (Payment tracking)."""
    __tablename__ = "payment_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    currency = Column(String(3), nullable=False)
    payment_gateway = Column(String(50), nullable=False)
    transaction_id = Column(String(255), unique=True,
                            index=True, nullable=False)
    service_type = Column(String(50), nullable=False)
    service_details = Column(JSON, nullable=True)
    status = Column(String(20), nullable=False)
    failure_reason = Column(Text, nullable=True)
    is_refunded = Column(Boolean, default=False, nullable=False)
    refund_amount = Column(DECIMAL(10, 2), nullable=True)
    refund_reason = Column(Text, nullable=True)
    initiated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    refunded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    owner = relationship("User", back_populates="payments")

    def __repr__(self):
        return (
            f"<PaymentLog(id={self.id}, user_id={self.user_id}, "
            f"status={self.status})>"
        )


class UserTracking(Base):
    """Track user engagement and analytics (TA-01, AD-02)."""
    __tablename__ = "user_tracking"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False)
    event_type = Column(String(50), nullable=False)
    event_data = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    session_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow,
                        nullable=False, index=True)

    def __repr__(self):
        return (
            f"<UserTracking(user_id={self.user_id}, "
            f"event_type={self.event_type})>"
        )


class Consultation(Base):
    """Coach consultation bookings (Level 4 - Premium)."""
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    scheduled_at = Column(DateTime, nullable=False, index=True)
    duration_minutes = Column(Integer, default=60, nullable=False)
    timezone = Column(String(50), nullable=True)
    status = Column(String(20), default="scheduled", nullable=False)
    notes = Column(Text, nullable=True)
    amount = Column(DECIMAL(10, 2), nullable=False)
    payment_id = Column(Integer, ForeignKey("payment_logs.id"), nullable=True)
    meeting_link = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return (
            f"<Consultation(id={self.id}, user_id={self.user_id}, "
            f"status={self.status})>"
        )


class AdminLog(Base):
    """Audit log for admin actions (Security & Compliance)."""
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"),
                      index=True, nullable=False)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow,
                        nullable=False, index=True)

    def __repr__(self):
        return (
            f"<AdminLog(id={self.id}, admin_id={self.admin_id}, "
            f"action={self.action})>"
        )


class DailyPractice(Base):
    """Track daily practice logs (TA-01, TA-03)."""
    __tablename__ = "daily_practice"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False)
    practice_type = Column(String(50), nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    intensity = Column(String(20), nullable=True)
    content_id = Column(Integer, ForeignKey("content.id"), nullable=True)
    logged_date = Column(Date, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    owner = relationship("User", back_populates="logs")
    content = relationship("Content")

    def __repr__(self):
        return (
            f"<DailyPractice(user_id={self.user_id}, "
            f"type={self.practice_type})>"
        )


class Badge(Base):
    """Achievement badges for gamification (TA-03)."""
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    icon_url = Column(String(500), nullable=True)
    criteria_type = Column(String(50), nullable=False)
    criteria_value = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user_badges = relationship("UserBadge", back_populates="badge")

    def __repr__(self):
        return f"<Badge(id={self.id}, name={self.name})>"


class UserBadge(Base):
    """Track badges earned by users (TA-03)."""
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id"),
                      index=True, nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    earned_value = Column(Integer, nullable=True)

    owner = relationship("User", back_populates="badges")
    badge = relationship("Badge", back_populates="user_badges")

    def __repr__(self):
        return f"<UserBadge(user_id={self.user_id}, badge_id={self.badge_id})>"


class Streak(Base):
    """Track user streaks (TA-03)."""
    __tablename__ = "streaks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False, unique=True)
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    practice_type = Column(String(50), default="all", nullable=False)
    last_practice_date = Column(Date, nullable=True)
    streak_started_at = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)

    owner = relationship("User", back_populates="streaks", uselist=False)

    def __repr__(self):
        return (
            f"<Streak(user_id={self.user_id}, "
            f"current={self.current_streak})>"
        )


class ForumCategory(Base):
    """Forum categories for discussions (CS-01)."""
    __tablename__ = "forum_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(50), nullable=True)
    color = Column(String(7), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    threads = relationship("ForumThread", back_populates="category")

    def __repr__(self):
        return f"<ForumCategory(id={self.id}, name={self.name})>"


class ForumThread(Base):
    """Forum threads/topics (CS-01)."""
    __tablename__ = "forum_threads"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey(
        "forum_categories.id"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    reply_count = Column(Integer, default=0, nullable=False)
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow,
                        nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)
    last_reply_at = Column(DateTime, nullable=True)

    category = relationship("ForumCategory", back_populates="threads")
    owner = relationship("User", back_populates="threads")
    posts = relationship("ForumPost", back_populates="thread",
                         cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ForumThread(id={self.id}, title={self.title[:30]})>"


class ForumPost(Base):
    """Forum posts/replies (CS-01)."""
    __tablename__ = "forum_posts"

    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey(
        "forum_threads.id"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False)
    parent_post_id = Column(Integer, ForeignKey(
        "forum_posts.id"), nullable=True)
    content = Column(Text, nullable=False)
    like_count = Column(Integer, default=0, nullable=False)
    is_marked_helpful = Column(Boolean, default=False, nullable=False)
    is_edited = Column(Boolean, default=False, nullable=False)
    edited_at = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow,
                        nullable=False, index=True)

    thread = relationship("ForumThread", back_populates="posts")
    owner = relationship("User", back_populates="posts")
    parent = relationship("ForumPost", remote_side=[
                          id], back_populates="children")
    children = relationship(
        "ForumPost", back_populates="parent", cascade="all, delete-orphan")
    likes = relationship("PostLike", back_populates="post",
                         cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ForumPost(id={self.id}, user_id={self.user_id})>"


class PostLike(Base):
    """Track likes on posts (CS-01)."""
    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("forum_posts.id"),
                     index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (UniqueConstraint(
        'post_id', 'user_id', name='unique_post_user_like'),)

    post = relationship("ForumPost", back_populates="likes")

    def __repr__(self):
        return f"<PostLike(post_id={self.post_id}, user_id={self.user_id})>"


class ProgressShare(Base):
    """Track shared achievements and progress (CS-02)."""
    __tablename__ = "progress_shares"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False)
    share_type = Column(String(50), nullable=False)
    share_data = Column(JSON, nullable=False)
    share_token = Column(String(255), unique=True, nullable=False)
    is_public = Column(Boolean, default=True, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow,
                        nullable=False, index=True)
    expires_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<ProgressShare(id={self.id}, type={self.share_type})>"


class Mention(Base):
    """Track mentions in forum posts (CS-01)."""
    __tablename__ = "mentions"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("forum_posts.id"),
                     index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), index=True,
                     nullable=False)  # User who made the post
    mentioned_user_id = Column(Integer, ForeignKey(
        "users.id"), index=True, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Mention(id={self.id}, post_id={self.post_id})>"


# --- 3. DATABASE INITIALIZATION FUNCTION ---

def init_db(create_tables: bool = True) -> None:
    """Initialize database schema.

    By default this will attempt to create tables. Call this from your
    application startup handler so import-time failures (for example
    wrong DB credentials) do not crash module import.
    """
    if not create_tables:
        return

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.error("Could not create database tables: %s", e)
