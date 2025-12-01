# admin.py (FIXED)

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional
import logging
import os
import uuid

# --- FIX 1: Corrected Imports ---

# Import all database TABLES from database.py
from database import (
    get_db,
    User,
    Content,
    ContentType,
    AssessmentResult,
    PaymentLog,
    UserTracking,
    AdminLog,
    RoleEnum,
    SessionLocal,
)

# Import all Pydantic SCHEMAS from models.py (as per your file structure)
from models import (
    ContentCreate,
    ContentUpdate,
    ContentResponse,
    AssessmentResultResponse,
    PaymentLogResponse,
    UserAnalyticsResponse,
    UserDetailedResponse,
    AdminActionCreate,
)

# Import auth dependencies
from auth import admin_required, coach_required, AuthService
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin", tags=["Admin & CMS"])

# ====== HELPER FUNCTIONS ======


def log_admin_action(
    db: Session,
    admin_id: int,
    action: str,
    resource_type: str,
    resource_id: Optional[int] = None,
    details: Optional[dict] = None,
    ip_address: Optional[str] = None,
):
    """Log admin actions for audit trail."""
    try:
        admin_log = AdminLog(
            admin_id=admin_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
        )
        db.add(admin_log)
        db.commit()
        logger.info("Admin action logged: %s by admin %s", action, admin_id)
    except (Exception,) as e:
        logger.error("Error logging admin action: %s", e)
        db.rollback()


def save_upload_file(upload_file: UploadFile) -> Optional[str]:
    """
    Save uploaded file and return URL.
    In production, integrate with AWS S3, Google Cloud Storage, etc.
    """
    try:
        # Generate unique filename
        file_extension = upload_file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"

        # Local storage (for development)
        upload_dir = os.getenv("UPLOAD_DIR", "uploads")
        os.makedirs(upload_dir, exist_ok=True)

        file_path = os.path.join(upload_dir, unique_filename)

        # Save file
        with open(file_path, "wb") as f:
            content = upload_file.file.read()
            f.write(content)

        # Return URL (adjust based on your deployment)
        file_url = f"/uploads/{unique_filename}"
        logger.info("File uploaded successfully: %s", file_url)
        return file_url

    except (OSError, IOError) as e:
        logger.error("Error saving upload file: %s", e)
        return None


# ====== CONTENT MANAGEMENT ENDPOINTS ======

@router.post("/content/{content_type}", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
async def create_content(
    content_type: ContentType,
    content_data: ContentCreate,
    file: Optional[UploadFile] = File(None),
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """
    Upload/create new content (AD-01).

    Requires admin role.
    Supports NLP, Yoga, and Meditation content.
    """
    logger.info(
        f"Content creation request: {content_type} by admin {current_admin.id}")

    try:
        # Save file if provided
        file_url = None
        if file:
            file_url = save_upload_file(file)
            if not file_url:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to upload file",
                )

        # Create content
        new_content = Content(
            content_type=content_type,
            title=content_data.title,
            description=content_data.description,
            instructor=content_data.instructor,
            duration_minutes=content_data.duration_minutes,
            difficulty_level=content_data.difficulty_level,
            file_url=file_url,
            tags=content_data.tags,
            target_domain=content_data.target_domain,
            recommended_score_range=content_data.recommended_score_range,
            created_by_admin_id=current_admin.id,
            is_published=False,
        )

        db.add(new_content)
        db.flush()

        # Log action
        log_admin_action(
            db,
            current_admin.id,
            "content_created",
            "content",
            new_content.id,
            {
                "title": content_data.title,
                "type": content_type.value,
            },
        )

        db.commit()
        logger.info(f"Content created successfully: {new_content.id}")

        # --- FIX 2: Use .model_validate() instead of .from_orm() ---
        return ContentResponse.model_validate(new_content)

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating content: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create content",
        )


@router.put("/content/{content_id}", response_model=ContentResponse)
async def update_content(
    content_id: int,
    update_data: ContentUpdate,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """
    Update existing content.

    Requires admin role.
    """
    logger.info(
        f"Content update request: {content_id} by admin {current_admin.id}")

    try:
        content = db.query(Content).filter(Content.id == content_id).first()

        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found",
            )

        # --- FIX 2: Use .model_dump() instead of .dict() ---
        update_dict = update_data.model_dump(exclude_unset=True)

        # Update fields
        for key, value in update_dict.items():
            setattr(content, key, value)

        content.updated_at = datetime.utcnow()
        db.commit()

        # Log action
        log_admin_action(
            db,
            current_admin.id,
            "content_updated",
            "content",
            content_id,
            {"updated_fields": list(update_dict.keys())},
        )

        logger.info(f"Content updated successfully: {content_id}")

        # --- FIX 2: Use .model_validate() instead of .from_orm() ---
        return ContentResponse.model_validate(content)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating content: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update content",
        )


@router.delete("/content/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(
    content_id: int,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """
    Delete content.

    Requires admin role.
    """
    logger.info(
        f"Content deletion request: {content_id} by admin {current_admin.id}")

    try:
        content = db.query(Content).filter(Content.id == content_id).first()

        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found",
            )

        db.delete(content)
        db.commit()

        # Log action
        log_admin_action(
            db,
            current_admin.id,
            "content_deleted",
            "content",
            content_id,
            {"title": content.title},
        )

        logger.info(f"Content deleted successfully: {content_id}")

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting content: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete content",
        )


@router.get("/content", response_model=List[ContentResponse])
async def list_content(
    content_type: Optional[ContentType] = None,
    is_published: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """
    List all content (paginated).
    FastAPI will handle the from_orm conversion automatically.
    """
    query = db.query(Content)

    if content_type:
        query = query.filter(Content.content_type == content_type)

    if is_published is not None:
        query = query.filter(Content.is_published == is_published)

    total = query.count()
    content_list = query.offset(skip).limit(limit).all()

    logger.info(f"Content list retrieved: {len(content_list)} items")
    return content_list


@router.get("/content/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: int,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """Get single content details."""
    content = db.query(Content).filter(Content.id == content_id).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found",
        )

    # --- FIX 2: Use .model_validate() instead of .from_orm() ---
    return ContentResponse.model_validate(content)


# ====== USER MANAGEMENT ENDPOINTS ======

@router.get("/users", response_model=List[UserDetailedResponse])
async def list_users(
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """
    Get list of all users (AD-02).
    FastAPI will handle the from_orm conversion automatically.
    """
    logger.info(f"User list request by admin {current_admin.id}")

    query = db.query(User)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    total = query.count()
    users = query.offset(skip).limit(limit).all()

    return users


@router.get("/users/{user_id}", response_model=UserDetailedResponse)
async def get_user(
    user_id: int,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """Get detailed user information."""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # --- FIX 2: Use .model_validate() instead of .from_orm() ---
    return UserDetailedResponse.model_validate(user)


@router.put("/users/{user_id}/suspend")
async def suspend_user(
    user_id: int,
    reason: Optional[str] = None,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """Suspend a user account."""
    logger.info(
        f"User suspension request: {user_id} by admin {current_admin.id}")

    try:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        user.is_active = False
        db.commit()

        log_admin_action(
            db,
            current_admin.id,
            "user_suspended",
            "user",
            user_id,
            {"reason": reason},
        )

        return {"message": f"User {user_id} suspended"}

    except Exception as e:
        db.rollback()
        logger.error(f"Error suspending user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to suspend user",
        )


@router.put("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """Activate a user account."""
    logger.info(
        f"User activation request: {user_id} by admin {current_admin.id}")

    try:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        user.is_active = True
        db.commit()

        log_admin_action(
            db,
            current_admin.id,
            "user_activated",
            "user",
            user_id,
        )

        return {"message": f"User {user_id} activated"}

    except Exception as e:
        db.rollback()
        logger.error(f"Error activating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to activate user",
        )


# ====== ASSESSMENT & SCORING ENDPOINTS ======

@router.get("/users/{user_id}/assessments", response_model=List[AssessmentResultResponse])
async def get_user_assessments(
    user_id: int,
    level: Optional[int] = None,
    domain: Optional[str] = None,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """
    Get assessment scoring details for a user.
    FastAPI will handle the from_orm conversion automatically.
    """
    logger.info(
        f"Assessment details request for user {user_id} by admin {current_admin.id}")

    query = db.query(AssessmentResult).filter(
        AssessmentResult.user_id == user_id)

    if level:
        query = query.filter(AssessmentResult.level == level)

    if domain:
        query = query.filter(AssessmentResult.domain == domain)

    results = query.all()

    return results


@router.get("/users/{user_id}/assessment-summary")
async def get_user_assessment_summary(
    user_id: int,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """Get overall assessment summary for a user."""
    logger.info(
        f"Assessment summary request for user {user_id} by admin {current_admin.id}")

    # Get all assessment results for user
    results = db.query(AssessmentResult).filter(
        AssessmentResult.user_id == user_id).all()

    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No assessments found for user",
        )

    # Group by domain
    domain_scores = {}
    for result in results:
        if result.domain not in domain_scores:
            domain_scores[result.domain] = []
        domain_scores[result.domain].append(result.domain_score)

    # Calculate cumulative scores per domain
    cumulative_scores = {
        domain: sum(scores) for domain, scores in domain_scores.items()
    }

    # Calculate overall score
    overall_score = sum(cumulative_scores.values())

    return {
        "user_id": user_id,
        "domain_scores": cumulative_scores,
        "overall_score": overall_score,
        "total_assessments": len(results),
    }


# ====== PAYMENT ENDPOINTS ======

@router.get("/users/{user_id}/payments", response_model=List[PaymentLogResponse])
async def get_user_payments(
    user_id: int,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """
    Get payment history for a user.
    FastAPI will handle the from_orm conversion automatically.
    """
    logger.info(
        f"Payment history request for user {user_id} by admin {current_admin.id}")

    query = db.query(PaymentLog).filter(PaymentLog.user_id == user_id)

    if status:
        query = query.filter(PaymentLog.status == status)

    total = query.count()
    payments = query.order_by(PaymentLog.created_at.desc()).offset(
        skip).limit(limit).all()

    return payments


@router.get("/payments", response_model=List[PaymentLogResponse])
async def list_all_payments(
    status: Optional[str] = None,
    payment_gateway: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """
    List all payments (admin analytics).
    FastAPI will handle the from_orm conversion automatically.
    """
    logger.info(f"All payments list request by admin {current_admin.id}")

    query = db.query(PaymentLog)

    if status:
        query = query.filter(PaymentLog.status == status)

    if payment_gateway:
        query = query.filter(PaymentLog.payment_gateway == payment_gateway)

    total = query.count()
    payments = query.order_by(PaymentLog.created_at.desc()).offset(
        skip).limit(limit).all()

    return payments


@router.post("/users/{user_id}/payments/{payment_id}/refund")
async def process_refund(
    user_id: int,
    payment_id: int,
    refund_reason: str,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """
    Process refund for a payment.

    Requires admin role.
    """
    logger.info(
        f"Refund request: payment {payment_id} by admin {current_admin.id}")

    try:
        payment = db.query(PaymentLog).filter(
            PaymentLog.id == payment_id,
            PaymentLog.user_id == user_id,
        ).first()

        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found",
            )

        if payment.is_refunded:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment already refunded",
            )

        # Mark as refunded (in production, integrate with payment gateway API)
        payment.is_refunded = True
        payment.refund_amount = payment.amount
        payment.refund_reason = refund_reason
        payment.refunded_at = datetime.utcnow()
        payment.status = "refunded"

        db.commit()

        log_admin_action(
            db,
            current_admin.id,
            "refund_processed",
            "payment",
            payment_id,
            {"user_id": user_id, "reason": refund_reason},
        )

        return {"message": "Refund processed successfully", "payment_id": payment_id}

    except Exception as e:
        db.rollback()
        logger.error(f"Error processing refund: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process refund",
        )


# ====== ANALYTICS & REPORTING ENDPOINTS ======

@router.get("/analytics/users")
async def get_user_analytics(
    days: int = Query(30, ge=1, le=365),
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """Get user engagement analytics for last N days."""
    logger.info(
        f"User analytics request for {days} days by admin {current_admin.id}")

    cutoff_date = datetime.utcnow() - timedelta(days=days)

    # Total active users
    active_users = db.query(User).filter(
        User.last_login >= cutoff_date,
        User.is_active == True,
    ).count()

    # Total new users
    new_users = db.query(User).filter(
        User.created_at >= cutoff_date,
    ).count()

    # Assessments completed
    assessments_completed = db.query(AssessmentResult).filter(
        AssessmentResult.completed_at >= cutoff_date,
    ).count()

    # Logins in period
    logins = db.query(UserTracking).filter(
        UserTracking.event_type == "login",
        UserTracking.created_at >= cutoff_date,
    ).count()

    return {
        "period_days": days,
        "active_users": active_users,
        "new_users": new_users,
        "assessments_completed": assessments_completed,
        "logins": logins,
    }


@router.get("/analytics/payments")
async def get_payment_analytics(
    days: int = Query(30, ge=1, le=365),
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """Get payment analytics for last N days."""
    logger.info(
        f"Payment analytics request for {days} days by admin {current_admin.id}")

    cutoff_date = datetime.utcnow() - timedelta(days=days)

    # Total revenue
    total_revenue = db.query(func.sum(PaymentLog.amount)).filter(
        PaymentLog.status == "completed",
        PaymentLog.completed_at >= cutoff_date,
    ).scalar() or 0

    # Total transactions
    total_transactions = db.query(PaymentLog).filter(
        PaymentLog.status == "completed",
        PaymentLog.completed_at >= cutoff_date,
    ).count()

    # Failed transactions
    failed_transactions = db.query(PaymentLog).filter(
        PaymentLog.status == "failed",
        PaymentLog.created_at >= cutoff_date,
    ).count()

    # Refunds
    refunds = db.query(func.sum(PaymentLog.refund_amount)).filter(
        PaymentLog.is_refunded == True,
        PaymentLog.refunded_at >= cutoff_date,
    ).scalar() or 0

    return {
        "period_days": days,
        "total_revenue": float(total_revenue),
        "total_transactions": total_transactions,
        "failed_transactions": failed_transactions,
        "total_refunds": float(refunds),
        "net_revenue": float(total_revenue) - float(refunds),
    }


@router.get("/analytics/content")
async def get_content_analytics(
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """Get content performance analytics."""
    logger.info(f"Content analytics request by admin {current_admin.id}")

    content_stats = []

    for content_type in ContentType:
        total = db.query(Content).filter(
            Content.content_type == content_type).count()
        published = db.query(Content).filter(
            Content.content_type == content_type,
            Content.is_published == True,
        ).count()
        total_views = db.query(func.sum(Content.view_count)).filter(
            Content.content_type == content_type,
        ).scalar() or 0

        content_stats.append({
            "type": content_type.value,
            "total_count": total,
            "published_count": published,
            "total_views": total_views,
        })

    return {"content_stats": content_stats}


# ====== AUDIT LOG ENDPOINTS ======

@router.get("/audit-logs")
async def get_audit_logs(
    action: Optional[str] = None,
    admin_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    """Get audit logs for admin actions."""
    logger.info(f"Audit logs request by admin {current_admin.id}")

    query = db.query(AdminLog)

    if action:
        query = query.filter(AdminLog.action == action)

    if admin_id:
        query = query.filter(AdminLog.admin_id == admin_id)

    logs = query.order_by(AdminLog.created_at.desc()
                          ).offset(skip).limit(limit).all()

    return [
        {
            "id": log.id,
            "admin_id": log.admin_id,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "details": log.details,
            "created_at": log.created_at,
        }
        for log in logs
    ]
