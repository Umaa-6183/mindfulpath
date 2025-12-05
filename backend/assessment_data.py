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

# --- From "Level 1,2,3 - Integrated questions.pdf" ---
# Added question_de and question_fr keys
ASSESSMENT_QUESTIONS = {
    1: [
        {
            "domain": "Career & Vocation",
            "question": "When you think about your career path, what resonates most with you right now?",
            "question_de": "Wenn Sie über Ihren Karriereweg nachdenken, was spricht Sie derzeit am meisten an?",
            "question_fr": "En pensant à votre parcours professionnel, qu'est-ce qui résonne le plus en vous en ce moment ?"
        },
        {
            "domain": "Financial Well-Being",
            "question": "How would you describe your current relationship with money?",
            "question_de": "Wie würden Sie Ihre aktuelle Beziehung zu Geld beschreiben?",
            "question_fr": "Comment décririez-vous votre relation actuelle avec l'argent ?"
        },
        {
            "domain": "Physical Health",
            "question": "When you check in with your body, how do you feel?",
            "question_de": "Wenn Sie in Ihren Körper hineinhören, wie fühlen Sie sich?",
            "question_fr": "Quand vous êtes à l'écoute de votre corps, comment vous sentez-vous ?"
        },
        {
            "domain": "Emotional Well-Being",
            "question": "How well do you manage stress and emotions?",
            "question_de": "Wie gut bewältigen Sie Stress und Emotionen?",
            "question_fr": "Comment gérez-vous le stress et vos émotions ?"
        },
        {
            "domain": "Family",
            "question": "How do you currently experience family relationships?",
            "question_de": "Wie erleben Sie derzeit Ihre familiären Beziehungen?",
            "question_fr": "Comment vivez-vous actuellement vos relations familiales ?"
        },
        {
            "domain": "Friends",
            "question": "Which best describes your friendships right now?",
            "question_de": "Was beschreibt Ihre Freundschaften derzeit am besten?",
            "question_fr": "Qu'est-ce qui décrit le mieux vos amitiés en ce moment ?"
        },
        {
            "domain": "Relationships & Love",
            "question": "How do you feel about intimacy and love in your life?",
            "question_de": "Wie denken Sie über Intimität und Liebe in Ihrem Leben?",
            "question_fr": "Que ressentez-vous concernant l'intimité et l'amour dans votre vie ?"
        },
        {
            "domain": "Community & Giving",
            "question": "How do you connect with your community?",
            "question_de": "Wie verbinden Sie sich mit Ihrer Gemeinschaft?",
            "question_fr": "Comment vous connectez-vous à votre communauté ?"
        },
        {
            "domain": "Fun & Recreation",
            "question": "How often do you allow yourself time for joy and hobbies?",
            "question_de": "Wie oft gönnen Sie sich Zeit für Freude und Hobbys?",
            "question_fr": "À quelle fréquence vous accordez-vous du temps pour la joie et les loisirs ?"
        },
        {
            "domain": "Physical Environment",
            "question": "How does your environment affect your well-being?",
            "question_de": "Wie beeinflusst Ihre Umgebung Ihr Wohlbefinden?",
            "question_fr": "Comment votre environnement affecte-t-il votre bien-être ?"
        },
        {
            "domain": "Personal Growth",
            "question": "How do you approach self-development?",
            "question_de": "Wie gehen Sie an Ihre Selbstentwicklung heran?",
            "question_fr": "Comment abordez-vous le développement personnel ?"
        },
        {
            "domain": "Spirituality",
            "question": "How do you connect with spirituality or higher meaning?",
            "question_de": "Wie verbinden Sie sich mit Spiritualität oder einem höheren Sinn?",
            "question_fr": "Comment vous connectez-vous à la spiritualité ou à un sens supérieur ?"
        }
    ],
    2: [
        {
            "domain": "Career & Vocation",
            "question": "When you visualize your ideal career path in meditation, what comes up most strongly?",
            "question_de": "Wenn Sie Ihren idealen Karriereweg in der Meditation visualisieren, was kommt am stärksten hoch?",
            "question_fr": "Lorsque vous visualisez votre carrière idéale en méditation, qu'est-ce qui ressort le plus ?"
        },
        {
            "domain": "Financial Well-Being",
            "question": "In yoga, balance poses mirror financial balance. Which best reflects your experience?",
            "question_de": "Im Yoga spiegeln Balancehaltungen finanzielle Ausgeglichenheit wider. Was trifft am besten auf Sie zu?",
            "question_fr": "En yoga, les poses d'équilibre reflètent l'équilibre financier. Qu'est-ce qui correspond le mieux à votre expérience ?"
        },
        {
            "domain": "Physical Health",
            "question": "During body scans or mindful breathing, how do you experience your physical health?",
            "question_de": "Wie erleben Sie Ihre körperliche Gesundheit während eines Bodyscans oder beim bewussten Atmen?",
            "question_fr": "Pendant les scans corporels ou la respiration consciente, comment ressentez-vous votre santé physique ?"
        },
        {
            "domain": "Emotional Well-Being",
            "question": "When stress arises, how do you typically respond?",
            "question_de": "Wie reagieren Sie typischerweise, wenn Stress aufkommt?",
            "question_fr": "Lorsque le stress survient, comment réagissez-vous habituellement ?"
        },
        {
            "domain": "Family",
            "question": "When you reflect on family in meditation, what emotion arises most often?",
            "question_de": "Welche Emotion kommt am häufigsten hoch, wenn Sie in der Meditation über Ihre Familie nachdenken?",
            "question_fr": "En réfléchissant à votre famille en méditation, quelle émotion surgit le plus souvent ?"
        },
        {
            "domain": "Friends",
            "question": "How do friendships influence your energy (as felt in yoga/meditation)?",
            "question_de": "Wie beeinflussen Freundschaften Ihre Energie (gefühlt in Yoga/Meditation)?",
            "question_fr": "Comment les amitiés influencent-elles votre énergie (ressentie en yoga/méditation) ?"
        },
        {
            "domain": "Relationships & Love",
            "question": "What pattern do you notice in your intimate relationships?",
            "question_de": "Welches Muster bemerken Sie in Ihren intimen Beziehungen?",
            "question_fr": "Quel schéma remarquez-vous dans vos relations intimes ?"
        },
        {
            "domain": "Community & Giving",
            "question": "When practicing Seva (service) or giving, how do you feel?",
            "question_de": "Wie fühlen Sie sich, wenn Sie Seva (Dienst) praktizieren oder geben?",
            "question_fr": "En pratiquant le Seva (service) ou le don, comment vous sentez-vous ?"
        },
        {
            "domain": "Fun & Recreation",
            "question": "When you give yourself space for play, what happens?",
            "question_de": "Was passiert, wenn Sie sich Raum zum Spielen geben?",
            "question_fr": "Que se passe-t-il lorsque vous vous accordez un espace de jeu ?"
        },
        {
            "domain": "Physical Environment",
            "question": "When practicing mindfulness at home or work, how does your environment feel?",
            "question_de": "Wie fühlt sich Ihre Umgebung an, wenn Sie zu Hause oder bei der Arbeit Achtsamkeit praktizieren?",
            "question_fr": "En pratiquant la pleine conscience à la maison ou au travail, comment ressentez-vous votre environnement ?"
        },
        {
            "domain": "Personal Growth",
            "question": "How do you engage with self-development practices (NLP, yoga, meditation)?",
            "question_de": "Wie beschäftigen Sie sich mit Selbstentwicklungspraktiken (NLP, Yoga, Meditation)?",
            "question_fr": "Comment vous engagez-vous dans les pratiques de développement personnel (PNL, yoga, méditation) ?"
        },
        {
            "domain": "Spirituality",
            "question": "When you meditate or pray, how do you sense connection?",
            "question_de": "Wie spüren Sie Verbindung, wenn Sie meditieren oder beten?",
            "question_fr": "Lorsque vous méditez ou priez, comment ressentez-vous la connexion ?"
        }
    ],
    3: [
        {
            "domain": "Career & Vocation",
            "question": "When aligning your career with higher purpose, what resonates most?",
            "question_de": "Was schwingt am meisten mit, wenn Sie Ihre Karriere mit einem höheren Zweck in Einklang bringen?",
            "question_fr": "En alignant votre carrière avec un but supérieur, qu'est-ce qui résonne le plus ?"
        },
        {
            "domain": "Financial Well-Being",
            "question": "In relation to money and security, what breakthrough feels true for you?",
            "question_de": "Welcher Durchbruch in Bezug auf Geld und Sicherheit fühlt sich für Sie wahr an?",
            "question_fr": "Par rapport à l'argent et à la sécurité, quelle percée vous semble vraie ?"
        },
        {
            "domain": "Physical Health",
            "question": "When connecting body and mind, how do you transform your health experience?",
            "question_de": "Wie transformieren Sie Ihre Gesundheitserfahrung, wenn Sie Körper und Geist verbinden?",
            "question_fr": "En connectant le corps et l'esprit, comment transformez-vous votre expérience de santé ?"
        },
        {
            "domain": "Emotional Well-Being",
            "question": "How do you consciously transform emotions into strength?",
            "question_de": "Wie wandeln Sie Emotionen bewusst in Stärke um?",
            "question_fr": "Comment transformez-vous consciemment les émotions en force ?"
        },
        {
            "domain": "Family",
            "question": "What shift best describes your family relationships now?",
            "question_de": "Welcher Wandel beschreibt Ihre familiären Beziehungen jetzt am besten?",
            "question_fr": "Quel changement décrit le mieux vos relations familiales maintenant ?"
        },
        {
            "domain": "Friends",
            "question": "How are your friendships evolving at this transformation stage?",
            "question_de": "Wie entwickeln sich Ihre Freundschaften in dieser Transformationsphase?",
            "question_fr": "Comment vos amitiés évoluent-elles à ce stade de transformation ?"
        },
        {
            "domain": "Relationships & Love",
            "question": "What transformation do you notice in love and intimacy?",
            "question_de": "Welche Transformation bemerken Sie in Liebe und Intimität?",
            "question_fr": "Quelle transformation remarquez-vous dans l'amour et l'intimité ?"
        },
        {
            "domain": "Community & Giving",
            "question": "How do you consciously embody service?",
            "question_de": "Wie verkörpern Sie bewusst Dienst am Nächsten?",
            "question_fr": "Comment incarnez-vous consciemment le service ?"
        },
        {
            "domain": "Fun & Recreation",
            "question": "What transformation have you experienced in joy and play?",
            "question_de": "Welche Transformation haben Sie in Freude und Spiel erlebt?",
            "question_fr": "Quelle transformation avez-vous vécue dans la joie et le jeu ?"
        },
        {
            "domain": "Physical Environment",
            "question": "How do you transform your environment into a mindful space?",
            "question_de": "Wie verwandeln Sie Ihre Umgebung in einen achtsamen Raum?",
            "question_fr": "Comment transformez-vous votre environnement en un espace conscient ?"
        },
        {
            "domain": "Personal Growth",
            "question": "What shift best reflects your growth at this stage?",
            "question_de": "Welcher Wandel spiegelt Ihr Wachstum in diesem Stadium am besten wider?",
            "question_fr": "Quel changement reflète le mieux votre croissance à ce stade ?"
        },
        {
            "domain": "Spirituality",
            "question": "What transformation describes your spiritual connection?",
            "question_de": "Welche Transformation beschreibt Ihre spirituelle Verbindung?",
            "question_fr": "Quelle transformation décrit votre connexion spirituelle ?"
        }
    ]
}

# --- From "Scoring Scale -Project1 V1.0.pdf" ---
DOMAIN_FEEDBACK = {
    "low": {
        "label": "Low Alignment",
        "label_de": "Geringe Ausrichtung",
        "label_fr": "Faible alignement",
        "general": "You may feel disconnected from purpose.",
        "general_de": "Sie fühlen sich möglicherweise von Ihrem Zweck getrennt.",
        "general_fr": "Vous pouvez vous sentir déconnecté de votre but.",
        "recommendations": "Try NLP journaling to uncover limiting beliefs and practice grounding yoga (Mountain Pose) with daily breathwork.",
        "recommendations_de": "Versuchen Sie NLP-Journaling, um einschränkende Glaubenssätze aufzudecken, und üben Sie erdendes Yoga (Berghaltung) mit täglicher Atemarbeit.",
        "recommendations_fr": "Essayez le journal PNL pour découvrir les croyances limitantes et pratiquez le yoga d'ancrage (Pose de la montagne) avec une respiration quotidienne."
    },
    "moderate": {
        "label": "Moderate Alignment",
        "label_de": "Mäßige Ausrichtung",
        "label_fr": "Alignement modéré",
        "general": "You're stable but seeking deeper fulfillment.",
        "general_de": "Sie sind stabil, suchen aber nach tieferer Erfüllung.",
        "general_fr": "Vous êtes stable mais cherchez un épanouissement plus profond.",
        "recommendations": "Use NLP reframing to align work with values and add heart-opening yoga poses (Camel Pose) with mindfulness breaks.",
        "recommendations_de": "Nutzen Sie NLP-Reframing, um Arbeit mit Werten in Einklang zu bringen, und fügen Sie herzöffnende Yoga-Posen (Kamelhaltung) mit Achtsamkeitspausen hinzu.",
        "recommendations_fr": "Utilisez le recadrage PNL pour aligner le travail avec les valeurs et ajoutez des poses de yoga d'ouverture du cœur (Pose du chameau) avec des pauses de pleine conscience."
    },
    "high": {
        "label": "High Alignment",
        "label_de": "Hohe Ausrichtung",
        "label_fr": "Alignement élevé",
        "general": "You're thriving in alignment with purpose.",
        "general_de": "Sie blühen im Einklang mit Ihrem Zweck auf.",
        "general_fr": "Vous vous épanouissez en alignement avec votre but.",
        "recommendations": "Deepen integration with visualization meditations and flow yoga sequences that reinforce clarity.",
        "recommendations_de": "Vertiefen Sie die Integration mit Visualisierungsmeditationen und Flow-Yoga-Sequenzen, die Klarheit stärken.",
        "recommendations_fr": "Approfondissez l'intégration avec des méditations de visualisation et des séquences de yoga flow qui renforcent la clarté."
    }
}

# --- From "Scoring Scale -Project1 V1.0.pdf" ---
OVERALL_SCORE_STAGES = {
    "foundation": {
        "label": "Foundation Stage (Awareness)",
        "label_de": "Grundlagenphase (Bewusstsein)",
        "label_fr": "Phase de Fondation (Conscience)",
        "description": "Score 36-71: Awareness Stage",
        "description_de": "Punktzahl 36-71: Bewusstseinsphase",
        "description_fr": "Score 36-71 : Phase de Conscience",
        "focus_areas": "Basic NLP journaling, beginner yoga, short meditations.",
        "focus_areas_de": "Grundlegendes NLP-Journaling, Anfänger-Yoga, kurze Meditationen.",
        "focus_areas_fr": "Journal PNL de base, yoga débutant, méditations courtes.",
        "recommendation": "Focus on building awareness with guided NLP journaling, beginner yoga flows, and short meditations.",
        "recommendation_de": "Konzentrieren Sie sich auf den Aufbau von Bewusstsein mit geführtem NLP-Journaling, Anfänger-Yoga-Flows und kurzen Meditationen.",
        "recommendation_fr": "Concentrez-vous sur le développement de la conscience avec un journal PNL guidé, des flux de yoga débutants et des méditations courtes."
    },
    "growth": {
        "label": "Growth Stage (Pattern Building)",
        "label_de": "Wachstumsphase (Musteraufbau)",
        "label_fr": "Phase de Croissance (Construction de Modèles)",
        "description": "Score 72-107: Growth Stage",
        "description_de": "Punktzahl 72-107: Wachstumsphase",
        "description_fr": "Score 72-107 : Phase de Croissance",
        "focus_areas": "Reframing beliefs, balancing yoga, structured mindfulness.",
        "focus_areas_de": "Glaubenssätze neu formulieren, ausgleichendes Yoga, strukturierte Achtsamkeit.",
        "focus_areas_fr": "Recadrage des croyances, yoga d'équilibre, pleine conscience structurée.",
        "recommendation": "Focus on building new patterns by reframing beliefs, practicing structured yoga sequences, and using breathwork meditations.",
        "recommendation_de": "Konzentrieren Sie sich auf den Aufbau neuer Muster durch Reframing von Glaubenssätzen, Üben strukturierter Yoga-Sequenzen und Nutzung von Atemmeditationen.",
        "recommendation_fr": "Concentrez-vous sur la construction de nouveaux modèles en recadrant les croyances, en pratiquant des séquences de yoga structurées et en utilisant des méditations respiratoires."
    },
    "transformation": {
        "label": "Transformation Stage (Integration)",
        "label_de": "Transformationsphase (Integration)",
        "label_fr": "Phase de Transformation (Intégration)",
        "description": "Score 108-144: Transformation Stage",
        "description_de": "Punktzahl 108-144: Transformationsphase",
        "description_fr": "Score 108-144 : Phase de Transformation",
        "focus_areas": "Anchoring identity, advanced yoga flows, transcendental meditations.",
        "focus_areas_de": "Identität verankern, fortgeschrittene Yoga-Flows, transzendentale Meditationen.",
        "focus_areas_fr": "Ancrage de l'identité, flux de yoga avancés, méditations transcendantales.",
        "recommendation": "Focus on deep integration with advanced NLP anchoring, meditative yoga flows, and deep mindfulness practices.",
        "recommendation_de": "Konzentrieren Sie sich auf tiefe Integration mit fortgeschrittenem NLP-Ankern, meditativen Yoga-Flows und tiefen Achtsamkeitspraktiken.",
        "recommendation_fr": "Concentrez-vous sur l'intégration profonde avec l'ancrage PNL avancé, les flux de yoga méditatifs et les pratiques de pleine conscience profonde."
    }
}
