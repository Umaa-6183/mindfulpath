# community.py (FIXED)

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List, Optional
import logging
import secrets

# --- FIX 1: Corrected Imports ---

# Import all database TABLES from database.py
from database import (
    get_db,
    User,
    ForumCategory,
    ForumThread,
    ForumPost,
    PostLike,
    ProgressShare,
    Mention,
)

# Import all Pydantic SCHEMAS from models.py
from models import (
    ForumCategoryResponse,
    ForumThreadCreate,
    ForumThreadResponse,
    ForumPostCreate,
    ForumPostResponse,
    ProgressShareResponse,
)
from auth import get_current_user

# --- End of Fix ---

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/community", tags=["Community & Support"])

# ====== INITIALIZATION ======


def initialize_categories(db: Session):
    """Initialize default forum categories."""
    default_categories = [
        {"name": "General Discussion", "description": "General discussions about mindfulness and wellness",
            "icon": "💬", "color": "#3B82F6"},
        {"name": "NLP & Mindset", "description": "Discuss NLP techniques and mindset shifts",
            "icon": "🧠", "color": "#F97316"},
        {"name": "Yoga & Movement", "description": "Share yoga practices and body awareness",
            "icon": "🧘", "color": "#10B981"},
        {"name": "Meditation & Breath", "description": "Meditation practices and breathwork",
            "icon": "🧘‍♀️", "color": "#8B5CF6"},
        {"name": "Achievements & Wins", "description": "Share your progress and celebrate wins",
            "icon": "🏆", "color": "#FBBF24"},
    ]

    for cat in default_categories:
        existing = db.query(ForumCategory).filter(
            ForumCategory.name == cat["name"]).first()
        if not existing:
            category = ForumCategory(
                name=cat["name"],
                description=cat["description"],
                icon=cat["icon"],
                color=cat["color"],
                display_order=default_categories.index(cat),
            )
            db.add(category)
    db.commit()


# ====== FORUM CATEGORY ENDPOINTS ======

@router.get("/categories", response_model=List[ForumCategoryResponse])
async def get_forum_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all active forum categories (CS-01)."""
    logger.info(f"Forum categories requested by user {current_user.id}")

    # This will run on every request, which is fine for a few categories.
    # For high performance, move this to a startup event in main.py.
    initialize_categories(db)

    categories = db.query(ForumCategory).filter(
        ForumCategory.is_active == True,
    ).order_by(ForumCategory.display_order).all()

    result = []
    for cat in categories:
        thread_count = db.query(ForumThread).filter(
            ForumThread.category_id == cat.id,
        ).count()

        # --- FIX 2: Use .model_validate() for Pydantic v2 ---
        response = ForumCategoryResponse.model_validate(cat)
        response.thread_count = thread_count
        result.append(response)

    return result


# ====== FORUM THREAD ENDPOINTS ======

@router.post("/threads", response_model=ForumThreadResponse, status_code=status.HTTP_201_CREATED)
async def create_forum_thread(
    thread_data: ForumThreadCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new forum thread (CS-01)."""
    logger.info(f"Thread creation request by user {current_user.id}")

    try:
        # Verify category exists
        category = db.query(ForumCategory).filter(
            ForumCategory.id == thread_data.category_id,
            ForumCategory.is_active == True,
        ).first()

        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )

        thread = ForumThread(
            category_id=thread_data.category_id,
            user_id=current_user.id,
            title=thread_data.title,
            description=thread_data.description,  # This is the first post's content
        )

        db.add(thread)
        db.commit()
        db.refresh(thread)  # Refresh to get DB-generated data

        logger.info(f"Thread created: {thread.id}")
        # --- FIX 2: Use .model_validate() for Pydantic v2 ---
        return ForumThreadResponse.model_validate(thread)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating thread: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create thread",
        )


@router.get("/threads/category/{category_id}", response_model=List[ForumThreadResponse])
async def get_category_threads(
    category_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("recent", pattern="^(recent|popular|replies)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get threads from a category (CS-01)."""
    logger.info(
        f"Threads requested: category {category_id} by user {current_user.id}")

    query = db.query(ForumThread).filter(
        ForumThread.category_id == category_id,
    )

    if sort_by == "popular":
        query = query.order_by(desc(ForumThread.view_count))
    elif sort_by == "replies":
        query = query.order_by(desc(ForumThread.reply_count))
    else:
        query = query.order_by(desc(ForumThread.created_at))

    threads = query.offset(skip).limit(limit).all()
    # --- FIX 2: Use .model_validate() for Pydantic v2 ---
    return [ForumThreadResponse.model_validate(t) for t in threads]


@router.get("/threads/{thread_id}", response_model=ForumThreadResponse)
async def get_thread(
    thread_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get thread details and increment view count (CS-01)."""
    logger.info(f"Thread requested: {thread_id} by user {current_user.id}")

    thread = db.query(ForumThread).filter(
        ForumThread.id == thread_id,
    ).first()

    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found",
        )

    # Increment view count
    thread.view_count = (thread.view_count or 0) + 1
    db.commit()
    db.refresh(thread)

    # --- FIX 2: Use .model_validate() for Pydantic v2 ---
    return ForumThreadResponse.model_validate(thread)


# ====== FORUM POST ENDPOINTS ======

@router.post("/posts", response_model=ForumPostResponse, status_code=status.HTTP_201_CREATED)
async def create_forum_post(
    post_data: ForumPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new forum post/reply (CS-01)."""
    logger.info(f"Post creation request by user {current_user.id}")

    try:
        # Verify thread exists
        thread = db.query(ForumThread).filter(
            ForumThread.id == post_data.thread_id,
            ForumThread.is_locked == False,
        ).first()

        if not thread:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Thread not found or locked",
            )

        post = ForumPost(
            thread_id=post_data.thread_id,
            user_id=current_user.id,
            parent_post_id=post_data.parent_post_id,
            content=post_data.content,
        )

        db.add(post)
        thread.reply_count = (thread.reply_count or 0) + 1
        thread.last_reply_at = datetime.utcnow()

        db.commit()
        db.refresh(post)

        logger.info(f"Post created: {post.id}")
        # --- FIX 2: Use .model_validate() for Pydantic v2 ---
        return ForumPostResponse.model_validate(post)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create post",
        )


@router.get("/threads/{thread_id}/posts", response_model=List[ForumPostResponse])
async def get_thread_posts(
    thread_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get posts for a thread (CS-01)."""
    logger.info(
        f"Posts requested: thread {thread_id} by user {current_user.id}")

    posts = db.query(ForumPost).filter(
        ForumPost.thread_id == thread_id,
        ForumPost.is_deleted == False,
    ).order_by(ForumPost.created_at).offset(skip).limit(limit).all()

    # --- FIX 2: Use .model_validate() for Pydantic v2 ---
    return [ForumPostResponse.model_validate(p) for p in posts]


@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Like or unlike a post (CS-01)."""
    logger.info(f"Like request: post {post_id} by user {current_user.id}")

    try:
        post = db.query(ForumPost).filter(ForumPost.id == post_id).first()

        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found",
            )

        existing_like = db.query(PostLike).filter(
            PostLike.post_id == post_id,
            PostLike.user_id == current_user.id,
        ).first()

        if existing_like:
            # Unlike
            db.delete(existing_like)
            post.like_count = max(0, (post.like_count or 1) - 1)
            message = "Post unliked"
        else:
            # Like
            like = PostLike(post_id=post_id, user_id=current_user.id)
            db.add(like)
            post.like_count = (post.like_count or 0) + 1
            message = "Post liked"

        db.commit()
        return {"message": message, "like_count": post.like_count}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error liking post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to like post",
        )


# ====== PROGRESS SHARING ENDPOINTS ======

@router.post("/share/badge", response_model=ProgressShareResponse, status_code=status.HTTP_201_CREATED)
async def share_badge(
    badge_id: int,
    is_public: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Share a badge achievement (CS-02)."""
    logger.info(f"Badge share request: {badge_id} by user {current_user.id}")

    try:
        share_token = secrets.token_urlsafe(32)

        share = ProgressShare(
            user_id=current_user.id,
            share_type="badge",
            share_data={"badge_id": badge_id},
            share_token=share_token,
            is_public=is_public,
        )

        db.add(share)
        db.commit()
        db.refresh(share)

        logger.info(f"Badge shared: {share.id}")
        # --- FIX 2: Use .model_validate() for Pydantic v2 ---
        return ProgressShareResponse.model_validate(share)

    except Exception as e:
        db.rollback()
        logger.error(f"Error sharing badge: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to share badge",
        )


@router.post("/share/streak", response_model=ProgressShareResponse, status_code=status.HTTP_201_CREATED)
async def share_streak(
    streak_days: int,
    is_public: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Share a streak achievement (CS-02)."""
    logger.info(
        f"Streak share request: {streak_days} days by user {current_user.id}")

    try:
        share_token = secrets.token_urlsafe(32)

        share = ProgressShare(
            user_id=current_user.id,
            share_type="streak",
            share_data={"streak_days": streak_days},
            share_token=share_token,
            is_public=is_public,
        )

        db.add(share)
        db.commit()
        db.refresh(share)

        logger.info(f"Streak shared: {share.id}")
        # --- FIX 2: Use .model_validate() for Pydantic v2 ---
        return ProgressShareResponse.model_validate(share)

    except Exception as e:
        db.rollback()
        logger.error(f"Error sharing streak: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to share streak",
        )


@router.get("/share/{share_token}")
async def get_shared_progress(
    share_token: str,
    db: Session = Depends(get_db),
):
    """Get shared progress (public endpoint, no auth required) (CS-02)."""
    logger.info(f"Shared progress accessed: {share_token}")

    share = db.query(ProgressShare).filter(
        ProgressShare.share_token == share_token,
        ProgressShare.is_public == True,
    ).first()

    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared progress not found or expired",
        )

    # Check if expired
    if share.expires_at and share.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared progress has expired",
        )

    # Increment view count
    share.view_count = (share.view_count or 0) + 1
    db.commit()

    user = db.query(User).filter(User.id == share.user_id).first()

    return {
        "shared_by": user.first_name if (user and user.first_name) else "Anonymous",
        "share_type": share.share_type,
        "share_data": share.share_data,
        "created_at": share.created_at,
        "view_count": share.view_count,
    }
