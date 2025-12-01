# /backend/content.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from datetime import datetime

# --- Corrected Imports ---
from database import (
    get_db,
    User,
    Content,
    ContentType,
    AssessmentResult,
    PaymentLog,
    UserTracking,
)
# Import Pydantic schemas from models.py (your schema file)
from models import ContentResponse
from auth import get_current_user
# Import from your assessment_data.py file
from assessment_data import DOMAIN_FEEDBACK, LIFE_DOMAINS

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/content", tags=["Content Delivery"])

# ====== HELPER FUNCTIONS ======


def check_level_access(db: Session, user_id: int, level: int) -> bool:
    """Check if user has paid for a level."""
    if level == 1:
        return True

    payment = db.query(PaymentLog).filter(
        PaymentLog.user_id == user_id,
        PaymentLog.service_type == f"level_{level}",
        PaymentLog.status == "completed",
    ).first()

    return payment is not None


def get_user_domain_scores(db: Session, user_id: int) -> dict:
    """Get cumulative domain scores for user."""
    domain_scores = {}

    for domain in LIFE_DOMAINS:
        results = db.query(AssessmentResult).filter(
            AssessmentResult.user_id == user_id,
            AssessmentResult.domain == domain,
        ).all()

        points_map = {"A": 4, "B": 3, "C": 2, "D": 1}
        cumulative_score = sum([points_map.get(r.answer, 0) for r in results])
        domain_scores[domain] = cumulative_score

    return domain_scores


def get_domain_feedback_category(score: int) -> str:
    """Get feedback category for domain score (3-12)."""
    if score <= 5:
        return "low"
    elif score <= 8:
        return "moderate"
    else:
        return "high"


# ====== CONTENT RECOMMENDATIONS (PR-01, PR-02, PR-03) ======

@router.get("/recommendations", response_model=List[ContentResponse])
async def get_personalized_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get personalized NLP/Yoga/Meditation recommendations based on user's assessment.
    Returns a simple list of recommended content.
    """
    logger.info(f"Recommendations requested by user {current_user.id}")

    try:
        # 1. Get user's domain scores
        domain_scores = get_user_domain_scores(db, current_user.id)

        if not any(domain_scores.values()):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complete Level 1 assessment to get recommendations.",
            )

        # 2. Find the top 3 lowest-scoring domains
        assessed_domains = {d: s for d, s in domain_scores.items() if s > 0}
        lowest_domains = sorted(assessed_domains, key=assessed_domains.get)[:3]

        # 3. Get content for those domains
        recommended_content = db.query(Content).filter(
            Content.target_domain.in_(lowest_domains),
            Content.is_published == True,
        ).order_by(Content.difficulty_level).limit(9).all()  # Get 9 recommendations max

        # 4. Log event
        tracking = UserTracking(
            user_id=current_user.id,
            event_type="recommendations_viewed",
            event_data={"lowest_domains": lowest_domains},
        )
        db.add(tracking)
        db.commit()

        # --- FIX: Return the list of content directly ---
        return [ContentResponse.model_validate(c) for c in recommended_content]

    except Exception as e:
        db.rollback()  # Rollback in case of error
        logger.error(f"Error fetching recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recommendations",
        )


# ====== CONTENT BROWSING ======

@router.get("/media", response_model=List[ContentResponse])
async def list_all_content(
    content_type: Optional[ContentType] = None,
    difficulty: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all available published content (PR-03).
    """
    logger.info(f"Content list requested by user {current_user.id}")

    try:
        query = db.query(Content).filter(Content.is_published == True)

        if content_type:
            query = query.filter(Content.content_type == content_type)

        if difficulty:
            query = query.filter(Content.difficulty_level == difficulty)

        content_list = query.order_by(
            Content.created_at.desc()).offset(skip).limit(limit).all()

        # Log event
        tracking = UserTracking(
            user_id=current_user.id,
            event_type="content_browsed",
            event_data={"type": content_type.value if content_type else "all", "count": len(
                content_list)},
        )
        db.add(tracking)
        db.commit()

        # --- FIX: Return the list directly ---
        return [ContentResponse.model_validate(c) for c in content_list]

    except Exception as e:
        db.rollback()  # Rollback in case of error
        logger.error(f"Error listing content: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch content",
        )


@router.get("/media/{content_id}", response_model=ContentResponse)
async def get_content_details(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get specific content details (video/audio URL, transcript, etc.) (PR-03).
    """
    logger.info(
        f"Content details requested: {content_id} by user {current_user.id}")

    try:
        content = db.query(Content).filter(
            Content.id == content_id,
            Content.is_published == True,
        ).first()

        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found",
            )

        # Increment view count
        content.view_count = (content.view_count or 0) + 1

        # Log event
        tracking = UserTracking(
            user_id=current_user.id,
            event_type="content_viewed",
            event_data={"content_id": content_id,
                        "type": content.content_type.value},
        )
        db.add(tracking)

        # Commit both changes at once
        db.commit()

        return ContentResponse.model_validate(content)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()  # Rollback in case of error
        logger.error(f"Error fetching content: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch content",
        )


@router.get("/media/by-type/{content_type}", response_model=List[ContentResponse])
async def get_content_by_type(
    content_type: ContentType,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all content of a specific type (NLP, Yoga, Meditation).
    """
    logger.info(
        f"Content by type requested: {content_type} by user {current_user.id}")

    try:
        query = db.query(Content).filter(
            Content.content_type == content_type,
            Content.is_published == True,
        )

        content_list = query.order_by(
            Content.created_at.desc()).offset(skip).limit(limit).all()

        # --- FIX: Return the list directly ---
        return [ContentResponse.model_validate(c) for c in content_list]

    except Exception as e:
        logger.error(f"Error fetching content by type: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch content",
        )


@router.post("/media/{content_id}/rate")
async def rate_content(
    content_id: int,
    rating: float = Query(..., ge=0.5, le=5.0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Rate content (1-5 stars).
    """
    logger.info(f"Content rated: {content_id} by user {current_user.id}")

    try:
        content = db.query(Content).filter(Content.id == content_id).first()

        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found",
            )

        # Update rating (simple average)
        if content.rating == 0 or content.rating is None:
            content.rating = rating
        else:
            # A more robust average: (old_rating * (view_count - 1) + new_rating) / view_count
            # For simplicity, we'll stick to a simple running average
            content.rating = (content.rating + rating) / 2

        db.commit()

        return {
            "message": "Thank you for rating!",
            "content_id": content_id,
            "new_rating": content.rating,
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error rating content: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to rate content",
        )
