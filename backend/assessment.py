# assessment.py (FIXED)

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
import logging
from database import (
    get_db,
    User,
    AssessmentResult,
    PaymentLog,
    UserTracking,
)
# <-- FIX 1: Import schemas from your 'models.py' file, not 'schemas.py'
from models import AssessmentResultResponse, AnswersBody
from assessment_data import (
    ASSESSMENT_QUESTIONS,
    DOMAIN_FEEDBACK,
    OVERALL_SCORE_STAGES,
    LIFE_DOMAINS,
)
from auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/assessment", tags=["Assessment & Scoring"])

# ====== CONSTANTS ======

POINT_VALUES = {"A": 4, "B": 3, "C": 2, "D": 1}
LEVEL_PRICES = {
    1: {"INR": 0, "GBP": 0, "USD": 0},  # Level 1 is free
    2: {"INR": 500, "GBP": 5, "USD": 5},
    3: {"INR": 1000, "GBP": 10, "USD": 10},
}


# ====== HELPER FUNCTIONS ======

def get_domain_score_interpretation(score: int) -> dict:
    """Get interpretation for per-domain score (3-12)."""
    if score <= 5:
        return DOMAIN_FEEDBACK["low"]
    elif score <= 8:
        return DOMAIN_FEEDBACK["moderate"]
    else:
        return DOMAIN_FEEDBACK["high"]


def get_overall_stage(overall_score: int) -> dict:
    """Get stage interpretation for overall score (36-144)."""
    if overall_score <= 71:
        return OVERALL_SCORE_STAGES["foundation"]
    elif overall_score <= 107:
        return OVERALL_SCORE_STAGES["growth"]
    else:
        return OVERALL_SCORE_STAGES["transformation"]


def calculate_cumulative_domain_scores(db: Session, user_id: int) -> dict:
    """
    Calculate per-domain scores across all completed levels.

    Returns: {
        "domain_name": cumulative_score,
        ...
    }
    """
    domain_scores = {}

    for domain in LIFE_DOMAINS:
        results = db.query(AssessmentResult).filter(
            AssessmentResult.user_id == user_id,
            AssessmentResult.domain == domain,
        ).all()

        cumulative_score = sum([POINT_VALUES.get(r.answer, 0)
                               for r in results])
        domain_scores[domain] = cumulative_score

    return domain_scores


def check_level_access(db: Session, user_id: int, level: int) -> bool:
    """
    Check if user has paid for and unlocked a level.
    Level 1 is always free, levels 2-3 require payment.
    """
    if level == 1:
        return True

    # Check if user has completed payment for this level
    payment = db.query(PaymentLog).filter(
        PaymentLog.user_id == user_id,
        PaymentLog.service_type == f"level_{level}",
        PaymentLog.status == "completed",
    ).first()

    return payment is not None


# ====== ASSESSMENT ENDPOINTS ======

@router.get("/questions/{level}")
async def get_assessment_questions(
    level: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the 12 assessment questions for a given level (AS-01).

    Returns:
    - All 12 questions with their domains and options
    - User must have paid for level 2 and 3
    """
    logger.info(
        f"Assessment questions requested: Level {level} by user {current_user.id}")

    # Check access
    if not check_level_access(db, current_user.id, level):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Level {level} requires payment. Please complete payment first.",
        )

    if level not in ASSESSMENT_QUESTIONS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid level",
        )

    questions = ASSESSMENT_QUESTIONS[level]

    return {
        "level": level,
        "total_questions": len(questions),
        "questions": questions,
    }


@router.post("/submit/{level}")
async def submit_assessment_answers(
    level: int,
    body: AnswersBody,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit assessment answers for a level (AS-02).

    Accepts: {
        "answers": {
            "0": "A",
            "1": "B",
            ...
        }
    }

    Calculates and stores scores.
    """
    logger.info(
        f"Assessment submission: Level {level} by user {current_user.id}")

    # Check access
    if not check_level_access(db, current_user.id, level):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Level {level} requires payment.",
        )

    if level not in ASSESSMENT_QUESTIONS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid level",
        )

    try:
        user_answers = body.answers
        questions = ASSESSMENT_QUESTIONS[level]

        # Validate all 12 answers are provided
        if len(user_answers) != 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Expected 12 answers, got {len(user_answers)}",
            )

        # Store each answer
        for idx, question in enumerate(questions):
            domain = question["domain"]
            # Answers are keyed by index as a string
            answer = user_answers.get(str(idx), "").upper()

            # Validate answer
            if answer not in ["A", "B", "C", "D"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid answer for question {idx}: {answer}",
                )

            # Calculate points
            points = POINT_VALUES[answer]

            # Store result
            result = AssessmentResult(
                user_id=current_user.id,
                level=level,
                domain=domain,
                # This is the score (1-4) for this specific question
                domain_score=points,
                answer=answer,
                question_text=question["question"],
                completed_at=datetime.utcnow(),
            )

            db.add(result)

        # Log event
        tracking = UserTracking(
            user_id=current_user.id,
            event_type="assessment_completed",
            event_data={"level": level,
                        "timestamp": datetime.utcnow().isoformat()},
        )
        db.add(tracking)

        db.commit()
        logger.info(
            f"Assessment answers stored: Level {level}, User {current_user.id}")

        return {
            "message": f"Level {level} assessment submitted successfully",
            "level": level,
            "status": "completed",
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error submitting assessment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit assessment",
        )


@router.get("/report")
async def get_assessment_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get personalized assessment report (AS-03).

    Calculates cumulative per-domain scores and overall life balance score.
    Returns feedback and stage recommendations.
    """
    logger.info(f"Assessment report requested by user {current_user.id}")

    try:
        # Check which levels are completed
        completed_levels = set()
        results = db.query(AssessmentResult).filter(
            AssessmentResult.user_id == current_user.id,
        ).all()

        for result in results:
            completed_levels.add(result.level)

        if not completed_levels:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No assessment data found. Please complete an assessment."
            )

        # Calculate cumulative domain scores
        domain_scores = calculate_cumulative_domain_scores(db, current_user.id)

        # Calculate overall score
        overall_score = sum(domain_scores.values())

        # Get stage
        overall_stage = get_overall_stage(overall_score)

        # Generate domain feedback
        domain_feedback = {}
        for domain, score in domain_scores.items():
            interpretation = get_domain_score_interpretation(score)
            domain_feedback[domain] = {
                "score": score,
                "label": interpretation["label"],
                "feedback": interpretation["general"],
                "recommendations": interpretation["recommendations"],
            }

        report = {
            "user_id": current_user.id,
            "report_generated_at": datetime.utcnow().isoformat(),
            "completed_levels": sorted(list(completed_levels)),
            "overall_score": overall_score,
            "overall_stage": {
                "stage": overall_stage["label"],
                "description": overall_stage["description"],
                "focus_areas": overall_stage["focus_areas"],
                "recommendation": overall_stage["recommendation"],
            },
            "domain_scores": domain_scores,
            "domain_feedback": domain_feedback,
            "is_complete": len(completed_levels) == 3,
        }

        logger.info(f"Assessment report generated for user {current_user.id}")
        return report

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate report",
        )


@router.get("/progress")
async def get_assessment_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's assessment progress across all levels."""
    logger.info(f"Assessment progress requested by user {current_user.id}")

    try:
        progress = {}

        for level in [1, 2, 3]:
            level_results = db.query(AssessmentResult).filter(
                AssessmentResult.user_id == current_user.id,
                AssessmentResult.level == level,
            ).all()

            completed = len(level_results) == 12
            progress[f"level_{level}"] = {
                "level": level,
                "completed": completed,
                "questions_answered": len(level_results),
                "unlocked": (check_level_access(db, current_user.id, level) or
                             current_user.role == "admin" or
                             current_user.role == "ADMIN"),
                "price": LEVEL_PRICES[level],
            }

        return progress

    except Exception as e:
        logger.error(f"Error fetching progress: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch progress",
        )


@router.get("/history", response_model=List[AssessmentResultResponse])
async def get_assessment_history(
    level: Optional[int] = None,
    domain: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's full assessment history with optional filters."""
    logger.info(f"Assessment history requested by user {current_user.id}")

    try:
        query = db.query(AssessmentResult).filter(
            AssessmentResult.user_id == current_user.id,
        )

        if level:
            query = query.filter(AssessmentResult.level == level)

        if domain:
            query = query.filter(AssessmentResult.domain == domain)

        results = query.order_by(AssessmentResult.completed_at).all()

        # <-- FIX 2: Use .model_validate() for Pydantic v2
        return [AssessmentResultResponse.model_validate(r) for r in results]

    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch history",
        )
