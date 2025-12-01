# payment_config.py (PayPal-Only Configuration)

import os
from decimal import Decimal

# --- PayPal Configuration ---
# These MUST be set in your .env file
PAYPAL_MODE = os.getenv("PAYPAL_MODE", "sandbox")  # 'sandbox' or 'live'
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")

# --- Frontend URL ---
# URL of your frontend. This is where PayPal sends the user back.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# --- Pricing (from project requirements) ---
# This defines the cost for each level in each currency
PRICING = {
    2: {
        "INR": Decimal("500"),
        "GBP": Decimal("5"),
        "USD": Decimal("5"),
        "description": "Level 2 Assessment - Extended Evaluation"
    },
    3: {
        "INR": Decimal("1000"),
        "GBP": Decimal("10"),
        "USD": Decimal("10"),
        "description": "Level 3 Assessment - Intensive Evaluation + 30-Day Roadmap"
    },
    4: {
        "INR": Decimal("1500"),
        "GBP": Decimal("15"),
        "USD": Decimal("15"),
        "description": "1:1 Premium Consultation with Coach"
    }
}

# --- Supported Currencies ---
SUPPORTED_CURRENCIES = ["INR", "GBP", "USD"]
