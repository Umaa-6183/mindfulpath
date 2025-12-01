# gamification.py (FIXED)

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta, date
from typing import List, Optional
import logging

# --- FIX 1: Corrected Imports ---
from database import (
    get_db,
    User,
    DailyPractice,
    Badge,
    UserBadge,
    Streak,
)
# Import Pydantic schemas from models.py (your schema file)
from models import (
    DailyPracticeCreate,
    DailyPracticeResponse,
    BadgeResponse,
    UserBadgeResponse,
    StreakResponse,
    UserProgressResponse,
    LeaderboardEntryResponse,
)
from auth import get_current_user
# (Removed the unused import block from models.py)
# --- End of Fix ---

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/gamification",
                   tags=["Gamification & Progress"])

# ====== CONSTANTS ======

BADGES_CONFIG = [
    {"name": "First Step", "criteria_type": "sessions", "criteria_value": 1,
        "description": "Complete your first practice session"},
    {"name": "Week Warrior", "criteria_type": "streak", "criteria_value": 7,
        "description": "Maintain a 7-day practice streak"},
    {"name": "Month Master", "criteria_type": "streak", "criteria_value": 30,
        "description": "Maintain a 30-day practice streak"},
    {"name": "Century", "criteria_type": "sessions", "criteria_value": 100,
        "description": "Complete 100 practice sessions"},
    {"name": "Meditation Monk", "criteria_type": "sessions_meditation",
        "criteria_value": 50, "description": "Complete 50 meditation sessions"},
    {"name": "Yoga Yogi", "criteria_type": "sessions_yoga",
        "criteria_value": 50, "description": "Complete 50 yoga sessions"},
    {"name": "NLP Navigator", "criteria_type": "sessions_nlp",
        "criteria_value": 50, "description": "Complete 50 NLP sessions"},
]


# ====== HELPER FUNCTIONS ======

def initialize_badges(db: Session):
    """Initialize all badges in the database."""
    for badge_config in BADGES_CONFIG:
        existing = db.query(Badge).filter(
            Badge.name == badge_config["name"]).first()
        if not existing:
            badge = Badge(
                name=badge_config["name"],
                description=badge_config["description"],
                criteria_type=badge_config["criteria_type"],
                criteria_value=badge_config["criteria_value"],
            )
            db.add(badge)
    db.commit()


def check_and_award_badges(db: Session, user_id: int):
    """Check if user has earned any new badges."""
    # Initialize badges if not already done
    initialize_badges(db)

    # Get all badges
    all_badges = db.query(Badge).filter(Badge.is_active == True).all()

    for badge in all_badges:
        # Check if user already has this badge
        existing = db.query(UserBadge).filter(
            UserBadge.user_id == user_id,
            UserBadge.badge_id == badge.id,
        ).first()

        if existing:
            continue

        # Check criteria
        criteria_met = False
        criteria_value = badge.criteria_value

        if badge.criteria_type == "sessions":
            session_count = db.query(DailyPractice).filter(
                DailyPractice.user_id == user_id,
            ).count()
            if session_count >= criteria_value:
                criteria_met = True

        elif badge.criteria_type.startswith("sessions_"):
            practice_type = badge.criteria_type.split(
                "_")[1]  # e.g., "meditation"
            session_count = db.query(DailyPractice).filter(
                DailyPractice.user_id == user_id,
                DailyPractice.practice_type == practice_type
            ).count()
            if session_count >= criteria_value:
                criteria_met = True

        elif badge.criteria_type == "streak":
            streak = db.query(Streak).filter(
                Streak.user_id == user_id,
                Streak.practice_type == "all"
            ).first()
            if streak and streak.current_streak >= criteria_value:
                criteria_met = True

        if criteria_met:
            user_badge = UserBadge(
                user_id=user_id,
                badge_id=badge.id,
                earned_value=criteria_value,
            )
            db.add(user_badge)
            logger.info(f"Badge awarded: {badge.name} to user {user_id}")

    db.commit()


def update_streak(db: Session, user_id: int, practice_type: str = "all"):
    """Update user's streak based on recent practices."""
    today = date.today()
    yesterday = today - timedelta(days=1)

    # Get or create streak record
    streak = db.query(Streak).filter(
        Streak.user_id == user_id,
        Streak.practice_type == practice_type,
    ).first()

    if not streak:
        streak = Streak(
            user_id=user_id,
            practice_type=practice_type,
            current_streak=0,
            longest_streak=0
        )
        db.add(streak)

    # Check if a practice was already logged *today*
    if streak.last_practice_date == today:
        return  # Streak already updated for today

    # Check last practice was yesterday
    if streak.last_practice_date == yesterday:
        # Continue streak
        streak.current_streak += 1
    else:
        # Streak broken or first practice
        streak.current_streak = 1
        streak.streak_started_at = today

    streak.last_practice_date = today

    # Update longest streak
    if streak.current_streak > streak.longest_streak:
        streak.longest_streak = streak.current_streak

    db.commit()


# ====== PRACTICE LOGGING ENDPOINTS ======

@router.post("/practice/log", response_model=DailyPracticeResponse, status_code=status.HTTP_201_CREATED)
async def log_daily_practice(
    practice_data: DailyPracticeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Log a daily practice session (TA-01, TA-03).
    """
    logger.info(
        f"Practice logged: {practice_data.practice_type} by user {current_user.id}")

    try:
        today = date.today()

        # Check if this specific practice type was already logged today
        existing_practice = db.query(DailyPractice).filter(
            DailyPractice.user_id == current_user.id,
            DailyPractice.practice_type == practice_data.practice_type,
            DailyPractice.logged_date == today
        ).first()

        if existing_practice:
            # Update existing log
            existing_practice.duration_minutes = (
                existing_practice.duration_minutes or 0) + (practice_data.duration_minutes or 0)
            existing_practice.notes = (
                existing_practice.notes or "") + f"\n{practice_data.notes or ''}"
            practice = existing_practice
        else:
            # Create new log
            practice = DailyPractice(
                user_id=current_user.id,
                practice_type=practice_data.practice_type,
                duration_minutes=practice_data.duration_minutes,
                intensity=practice_data.intensity,
                content_id=practice_data.content_id,
                logged_date=today,
                notes=practice_data.notes,
            )
            db.add(practice)

        db.commit()

        # Update streaks (only once per day per type)
        if not existing_practice:
            update_streak(db, current_user.id, "all")
            update_streak(db, current_user.id, practice_data.practice_type)

        # Check for new badges
        check_and_award_badges(db, current_user.id)

        db.refresh(practice)
        # --- FIX 2: Use .model_validate() for Pydantic v2 ---
        return DailyPracticeResponse.model_validate(practice)

    except Exception as e:
        db.rollback()
        logger.error(f"Error logging practice: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to log practice",
        )


@router.get("/practice/history", response_model=List[DailyPracticeResponse])
async def get_practice_history(
    practice_type: Optional[str] = None,
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's practice history for last N days."""
    logger.info(f"Practice history requested by user {current_user.id}")

    cutoff_date = date.today() - timedelta(days=days)

    query = db.query(DailyPractice).filter(
        DailyPractice.user_id == current_user.id,
        DailyPractice.logged_date >= cutoff_date,
    )

    if practice_type:
        query = query.filter(DailyPractice.practice_type == practice_type)

    practices = query.order_by(DailyPractice.logged_date.desc()).all()

    # --- FIX 2: Use .model_validate() for Pydantic v2 ---
    return [DailyPracticeResponse.model_validate(p) for p in practices]


# ====== STREAK ENDPOINTS ======

@router.get("/streak", response_model=StreakResponse)
async def get_user_streak(
    practice_type: str = Query("all", pattern="^(all|meditation|yoga|nlp)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's current and longest streak."""
    logger.info(f"Streak requested: {practice_type} by user {current_user.id}")

    streak = db.query(Streak).filter(
        Streak.user_id == current_user.id,
        Streak.practice_type == practice_type,
    ).first()

    if not streak:
        # Create default streak
        streak = Streak(
            user_id=current_user.id,
            practice_type=practice_type,
            current_streak=0,
            longest_streak=0
        )
        db.add(streak)
        db.commit()
        db.refresh(streak)

    # --- FIX 2: Use .model_validate() for Pydantic v2 ---
    return StreakResponse.model_validate(streak)


# ====== BADGE ENDPOINTS ======

@router.get("/badges", response_model=List[UserBadgeResponse])
async def get_user_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all badges earned by user."""
    logger.info(f"Badges requested by user {current_user.id}")

    user_badges = db.query(UserBadge).filter(
        UserBadge.user_id == current_user.id,
    ).order_by(UserBadge.earned_at.desc()).all()

    result = []
    for ub in user_badges:
        badge = db.query(Badge).filter(Badge.id == ub.badge_id).first()
        if badge:
            result.append({
                # --- FIX 2: Use .model_validate() for Pydantic v2 ---
                "badge": BadgeResponse.model_validate(badge),
                "earned_at": ub.earned_at,
            })

    return result


@router.get("/badges/available", response_model=List[BadgeResponse])
async def get_available_badges(
    db: Session = Depends(get_db),
):
    """Get all available badges in the system."""
    initialize_badges(db)
    badges = db.query(Badge).filter(Badge.is_active == True).all()
    # --- FIX 2: Use .model_validate() for Pydantic v2 ---
    return [BadgeResponse.model_validate(b) for b in badges]


# ====== PROGRESS ENDPOINTS ======

@router.get("/progress", response_model=UserProgressResponse)
async def get_user_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get comprehensive user progress (TA-01, TA-03).
    """
    logger.info(f"Progress requested by user {current_user.id}")

    # Get streak
    streak = db.query(Streak).filter(
        Streak.user_id == current_user.id,
        Streak.practice_type == "all",
    ).first() or Streak(user_id=current_user.id, practice_type="all", current_streak=0, longest_streak=0)

    # Total sessions
    total_sessions = db.query(DailyPractice).filter(
        DailyPractice.user_id == current_user.id,
    ).count()

    # Total minutes
    total_minutes = db.query(func.sum(DailyPractice.duration_minutes)).filter(
        DailyPractice.user_id == current_user.id,
    ).scalar() or 0

    # Badges earned
    badges_earned = db.query(UserBadge).filter(
        UserBadge.user_id == current_user.id,
    ).count()

    # Weekly progress (last 7 days)
    weekly_progress = []
    for i in range(6, -1, -1):
        day = date.today() - timedelta(days=i)
        count = db.query(DailyPractice).filter(
            DailyPractice.user_id == current_user.id,
            DailyPractice.logged_date == day,
        ).count()
        weekly_progress.append(count)

    # Monthly progress (last 31 days)
    monthly_progress = []
    for i in range(30, -1, -1):
        day = date.today() - timedelta(days=i)
        count = db.query(DailyPractice).filter(
            DailyPractice.user_id == current_user.id,
            DailyPractice.logged_date == day,
        ).count()
        monthly_progress.append(count)

    return UserProgressResponse(
        current_streak=streak.current_streak,
        longest_streak=streak.longest_streak,
        total_sessions=total_sessions,
        badges_earned=badges_earned,
        total_minutes=int(total_minutes),
        weekly_progress=weekly_progress,
        monthly_progress=monthly_progress,
    )


# ====== LEADERBOARD ENDPOINTS ======

@router.get("/leaderboard", response_model=List[LeaderboardEntryResponse])
async def get_leaderboard(
    period: str = Query("all", pattern="^(all|week|month)$"),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get leaderboard based on streaks and sessions."""
    logger.info(f"Leaderboard requested: {period} by user {current_user.id}")

    cutoff = None
    if period == "week":
        cutoff = date.today() - timedelta(days=7)
    elif period == "month":
        cutoff = date.today() - timedelta(days=30)

    # Get top users by current streak
    query = db.query(Streak).filter(Streak.practice_type == "all").order_by(
        Streak.current_streak.desc(),
    ).limit(limit).all()

    leaderboard = []
    for rank, streak in enumerate(query, 1):
        user = db.query(User).filter(User.id == streak.user_id).first()
        if user:
            # Get total sessions
            sessions_query = db.query(DailyPractice).filter(
                DailyPractice.user_id == streak.user_id,
            )

            # Get total minutes
            minutes_query = db.query(func.sum(DailyPractice.duration_minutes)).filter(
                DailyPractice.user_id == streak.user_id,
            )

            if cutoff:
                sessions_query = sessions_query.filter(
                    DailyPractice.logged_date >= cutoff)
                minutes_query = minutes_query.filter(
                    DailyPractice.logged_date >= cutoff)

            session_count = sessions_query.count()
            total_minutes = minutes_query.scalar() or 0

            leaderboard.append(
                LeaderboardEntryResponse(
                    rank=rank,
                    user_name=user.first_name or user.email.split("@")[0],
                    current_streak=streak.current_streak,
                    total_sessions=session_count,
                    total_minutes=int(total_minutes),
                )
            )

    return leaderboard
