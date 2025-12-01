# /backend/assessment_data.py

# --- From "Level 1,2,3 - Integrated questions.pdf" ---
LIFE_DOMAINS = [
    "Career & Vocation",
    "Financial Well-Being",
    "Physical Health",
    "Emotional Well-Being",
    "Family",
    "Friends",
    "Relationships & Love",
    "Community & Giving",
    "Fun & Recreation",
    "Physical Environment",
    "Personal Growth",
    "Spirituality"
]

# --- From "Level 1,2,3 - Integrated questions.pdf" [cite: 367-610] ---
ASSESSMENT_QUESTIONS = {
    1: [
        {"domain": "Career & Vocation",
            "question": "When you think about your career path, what resonates most with you right now?"},
        {"domain": "Financial Well-Being",
            "question": "How would you describe your current relationship with money?"},
        {"domain": "Physical Health",
            "question": "When you check in with your body, how do you feel?"},
        {"domain": "Emotional Well-Being",
            "question": "How well do you manage stress and emotions?"},
        {"domain": "Family",
            "question": "How do you currently experience family relationships?"},
        {"domain": "Friends", "question": "Which best describes your friendships right now?"},
        {"domain": "Relationships & Love",
            "question": "How do you feel about intimacy and love in your life?"},
        {"domain": "Community & Giving",
            "question": "How do you connect with your community?"},
        {"domain": "Fun & Recreation",
            "question": "How often do you allow yourself time for joy and hobbies?"},
        {"domain": "Physical Environment",
            "question": "How does your environment affect your well-being?"},
        {"domain": "Personal Growth",
            "question": "How do you approach self-development?"},
        {"domain": "Spirituality",
            "question": "How do you connect with spirituality or higher meaning?"}
    ],
    2: [
        {"domain": "Career & Vocation",
            "question": "When you visualize your ideal career path in meditation, what comes up most strongly?"},
        {"domain": "Financial Well-Being",
            "question": "In yoga, balance poses mirror financial balance. Which best reflects your experience?"},
        {"domain": "Physical Health",
            "question": "During body scans or mindful breathing, how do you experience your physical health?"},
        {"domain": "Emotional Well-Being",
            "question": "When stress arises, how do you typically respond?"},
        {"domain": "Family", "question": "When you reflect on family in meditation, what emotion arises most often?"},
        {"domain": "Friends",
            "question": "How do friendships influence your energy (as felt in yoga/meditation)?"},
        {"domain": "Relationships & Love",
            "question": "What pattern do you notice in your intimate relationships?"},
        {"domain": "Community & Giving",
            "question": "When practicing Seva (service) or giving, how do you feel?"},
        {"domain": "Fun & Recreation",
            "question": "When you give yourself space for play, what happens?"},
        {"domain": "Physical Environment",
            "question": "When practicing mindfulness at home or work, how does your environment feel?"},
        {"domain": "Personal Growth",
            "question": "How do you engage with self-development practices (NLP, yoga, meditation)?"},
        {"domain": "Spirituality",
            "question": "When you meditate or pray, how do you sense connection?"}
    ],
    3: [
        {"domain": "Career & Vocation",
            "question": "When aligning your career with higher purpose, what resonates most?"},
        {"domain": "Financial Well-Being",
            "question": "In relation to money and security, what breakthrough feels true for you?"},
        {"domain": "Physical Health",
            "question": "When connecting body and mind, how do you transform your health experience?"},
        {"domain": "Emotional Well-Being",
            "question": "How do you consciously transform emotions into strength?"},
        {"domain": "Family",
            "question": "What shift best describes your family relationships now?"},
        {"domain": "Friends",
            "question": "How are your friendships evolving at this transformation stage?"},
        {"domain": "Relationships & Love",
            "question": "What transformation do you notice in love and intimacy?"},
        {"domain": "Community & Giving",
            "question": "How do you consciously embody service?"},
        {"domain": "Fun & Recreation",
            "question": "What transformation have you experienced in joy and play?"},
        {"domain": "Physical Environment",
            "question": "How do you transform your environment into a mindful space?"},
        {"domain": "Personal Growth",
            "question": "What shift best reflects your growth at this stage?"},
        {"domain": "Spirituality",
            "question": "What transformation describes your spiritual connection?"}
    ]
}

# --- From "Scoring Scale -Project1 V1.0.pdf" [cite: 176-178, 189-195] ---
DOMAIN_FEEDBACK = {
    "low": {
        "label": "Low Alignment",
        "general": "You may feel disconnected from purpose.",
        "recommendations": "Try NLP journaling to uncover limiting beliefs and practice grounding yoga (Mountain Pose) with daily breathwork."
    },
    "moderate": {
        "label": "Moderate Alignment",
        "general": "You're stable but seeking deeper fulfillment.",
        "recommendations": "Use NLP reframing to align work with values and add heart-opening yoga poses (Camel Pose) with mindfulness breaks."
    },
    "high": {
        "label": "High Alignment",
        "general": "You're thriving in alignment with purpose.",
        "recommendations": "Deepen integration with visualization meditations and flow yoga sequences that reinforce clarity."
    }
}

# --- From "Scoring Scale -Project1 V1.0.pdf" [cite: 183-186, 222-224] ---
OVERALL_SCORE_STAGES = {
    "foundation": {
        "label": "Foundation Stage (Awareness)",
        "description": "Score 36-71: Awareness Stage",
        "focus_areas": "Basic NLP journaling, beginner yoga, short meditations.",
        "recommendation": "Focus on building awareness with guided NLP journaling, beginner yoga flows, and short meditations."
    },
    "growth": {
        "label": "Growth Stage (Pattern Building)",
        "description": "Score 72-107: Growth Stage",
        "focus_areas": "Reframing beliefs, balancing yoga, structured mindfulness.",
        "recommendation": "Focus on building new patterns by reframing beliefs, practicing structured yoga sequences, and using breathwork meditations."
    },
    "transformation": {
        "label": "Transformation Stage (Integration)",
        "description": "Score 108-144: Transformation Stage",
        "focus_areas": "Anchoring identity, advanced yoga flows, transcendental meditations.",
        "recommendation": "Focus on deep integration with advanced NLP anchoring, meditative yoga flows, and deep mindfulness practices."
    }
}
