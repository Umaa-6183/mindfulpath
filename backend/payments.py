# /backend/payments.py

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
import logging
from decimal import Decimal
from typing import Optional, List
import os

import paypalrestsdk

# --- Import your project's files ---
# (Assumes 'database.py' has DB tables, 'models.py' has Pydantic schemas)
from database import get_db, User, PaymentLog
from auth import get_current_user
from models import PaymentLogResponse, PaymentCreateBody, PaymentExecuteBody

# --- Configuration ---
# This PRICING dict is based on your docs.
PRICING = {
    2: {"INR": 500, "GBP": 5, "USD": 5},
    3: {"INR": 1000, "GBP": 10, "USD": 10},
    4: {"INR": 1500, "GBP": 15, "USD": 15},  # For consultations
}
SUPPORTED_CURRENCIES = ["INR", "GBP", "USD"]
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/payments", tags=["Payments"])

# --- Configure PayPal SDK ---
# These values MUST be set in your .env file
try:
    paypalrestsdk.configure({
        "mode": os.getenv("PAYPAL_MODE", "sandbox"),  # "sandbox" or "live"
        "client_id": os.getenv("PAYPAL_CLIENT_ID"),
        "client_secret": os.getenv("PAYPAL_CLIENT_SECRET")
    })
    if not os.getenv("PAYPAL_CLIENT_ID") or not os.getenv("PAYPAL_CLIENT_SECRET"):
        logger.error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are not set.")
        # We don't raise here, but endpoints will fail
except Exception as e:
    logger.error(f"Failed to configure PayPal SDK: {e}")


# ====== HELPER FUNCTIONS ======

def validate_price(level: int, currency: str) -> Optional[Decimal]:
    """Validate level and currency, return price."""
    if level not in PRICING:
        return None
    if currency not in SUPPORTED_CURRENCIES:
        return None
    price_value = PRICING[level].get(currency)
    if price_value is None:
        return None
    return Decimal(price_value)

# ====== PAYMENT ENDPOINTS ======


@router.post("/create-order")
async def create_payment_order(
    body: PaymentCreateBody,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a PayPal payment order.

    Receives: {"level": 2, "currency": "USD"}
    Returns: {"approval_url": "https://paypal.com/..."}
    """
    level = body.level
    currency = body.currency

    logger.info(
        f"Create order request: Level {level} ({currency}) by user {current_user.id}")

    price = validate_price(level, currency)
    if not price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid level or currency combination",
        )

    # Check if user already paid
    existing_payment = db.query(PaymentLog).filter(
        PaymentLog.user_id == current_user.id,
        PaymentLog.service_type == f"level_{level}",
        PaymentLog.status == "completed",
    ).first()

    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Level {level} already purchased",
        )

    # Create PayPal Payment
    payment = paypalrestsdk.Payment({
        "intent": "sale",
        "payer": {"payment_method": "paypal"},
        "redirect_urls": {
            "return_url": f"{FRONTEND_URL}/payment/success",
            "cancel_url": f"{FRONTEND_URL}/payment/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": f"MindfulPath Level {level}",
                    "sku": f"L{level}",
                    "price": str(price),
                    "currency": currency,
                    "quantity": 1
                }]
            },
            "amount": {
                "total": str(price),
                "currency": currency
            },
            "description": f"Payment for MindfulPath Level {level} Access."
        }]
    })

    try:
        if not payment.create():
            logger.error("PayPal payment creation failed: %s", payment.error)
            raise HTTPException(
                status_code=500, detail=payment.error.get("message", "PayPal Error"))
    except Exception as e:
        logger.error(f"PayPal API error: {e}")
        raise HTTPException(status_code=500, detail="PayPal API error")

    # Log the pending payment to our database
    try:
        payment_log = PaymentLog(
            user_id=current_user.id,
            amount=price,
            currency=currency,
            payment_gateway="paypal",
            transaction_id=payment.id,  # This is the PayPal Payment ID
            service_type=f"level_{level}",
            service_details={"level": level},
            status="pending",
            initiated_at=datetime.utcnow(),
        )
        db.add(payment_log)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to log pending payment: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to save payment record")

    # Find the approval URL to send to the frontend
    approval_url = next(
        (link.href for link in payment.links if link.rel == "approval_url"), None)

    if not approval_url:
        logger.error("No approval_url found in PayPal response")
        raise HTTPException(
            status_code=500, detail="Could not get PayPal approval URL")

    return {
        "status": "order_created",
        "payment_id": payment.id,
        "approval_url": approval_url
    }


@router.post("/execute-payment")
async def execute_payment(
    body: PaymentExecuteBody,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Execute a PayPal payment after user approval.

    Receives: {"paymentId": "PAY-...", "PayerID": "..."}
    """
    payment_id = body.paymentId
    payer_id = body.PayerID

    logger.info(
        f"Execute payment request: {payment_id} by user {current_user.id}")

    # Find our pending payment log
    payment_log = db.query(PaymentLog).filter(
        PaymentLog.transaction_id == payment_id,
        PaymentLog.user_id == current_user.id,
        PaymentLog.status == "pending",
    ).first()

    if not payment_log:
        logger.error(f"No pending payment log found for ID: {payment_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found or already processed.",
        )

    try:
        # Find the payment on PayPal
        payment = paypalrestsdk.Payment.find(payment_id)

        # Execute the payment
        if not payment.execute({"payer_id": payer_id}):
            logger.error("PayPal payment execution failed: %s", payment.error)
            payment_log.status = "failed"
            payment_log.failure_reason = str(payment.error)
            db.commit()
            raise HTTPException(status_code=400, detail=payment.error.get(
                "message", "Payment failed"))

        # SUCCESS! Update our database
        payment_log.status = "completed"
        payment_log.completed_at = datetime.utcnow()
        db.commit()

        logger.info(
            "Payment verified and completed for user %s", current_user.id)

        return {
            "status": "payment_verified",
            "message": "Payment successful. Level unlocked.",
            "level": payment_log.service_details.get("level"),
            "transaction_id": payment_log.transaction_id,
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error executing payment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Payment execution failed",
        )


@router.get("/history", response_model=List[PaymentLogResponse])
async def get_payment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's payment history."""
    logger.info(f"Payment history requested by user {current_user.id}")

    try:
        payments = db.query(PaymentLog).filter(
            PaymentLog.user_id == current_user.id,
        ).order_by(PaymentLog.created_at.desc()).all()

        # Use .model_validate() for Pydantic v2
        return [PaymentLogResponse.model_validate(p) for p in payments]

    except Exception as e:
        logger.error(f"Error fetching payment history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch payment history",
        )


@router.get("/status/{payment_id}", response_model=PaymentLogResponse)
async def get_payment_status(
    payment_id: int,  # Assuming your PaymentLog id is an integer
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get status of a specific payment."""
    logger.info(
        f"Payment status requested: {payment_id} by user {current_user.id}")

    try:
        # Find by the primary key (id), not the transaction_id
        payment = db.query(PaymentLog).filter(
            PaymentLog.id == payment_id,
            PaymentLog.user_id == current_user.id,
        ).first()

        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found",
            )

        # Use .model_validate() for Pydantic v2
        return PaymentLogResponse.model_validate(payment)

    except Exception as e:
        logger.error(f"Error fetching payment status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch payment status",
        )
