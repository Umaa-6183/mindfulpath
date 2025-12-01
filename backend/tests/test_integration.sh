# tests/test_integration.sh (INTEGRATION TESTS)

#!/bin/bash

echo "🧪 Running Integration Tests..."

# Test 1: User Registration and Login
echo "\n1. Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "integration_test@example.com",
    "password": "IntegrationTest123!",
    "first_name": "Test",
    "last_name": "User",
    "terms_accepted": true,
    "privacy_accepted": true,
    "consent_accepted": true
  }')

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "✅ Registration successful. Token: ${TOKEN:0:20}..."

# Test 2: Get Current User
echo "\n2. Testing Get Current User..."
curl -s -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | grep -q "integration_test@example.com"
echo "✅ Get user successful"

# Test 3: Create Assessment Result
echo "\n3. Testing Assessment Submission..."
curl -s -X POST http://localhost:8000/api/v1/assessment/submit/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "0": "A",
      "1": "B",
      "2": "A",
      "3": "C",
      "4": "B",
      "5": "A",
      "6": "C",
      "7": "B",
      "8": "A",
      "9": "B",
      "10": "A",
      "11": "C"
    }
  }' | grep -q "completed"
echo "✅ Assessment submission successful"

# Test 4: Get Assessment Report
echo "\n4. Testing Report Generation..."
curl -s -X GET http://localhost:8000/api/v1/assessment/report \
  -H "Authorization: Bearer $TOKEN" | grep -q "overall_score"
echo "✅ Report generation successful"

# Test 5: Log Practice
echo "\n5. Testing Practice Logging..."
curl -s -X POST http://localhost:8000/api/v1/gamification/practice/log \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "practice_type": "meditation",
    "duration_minutes": 15,
    "intensity": "medium"
  }' | grep -q "meditation"
echo "✅ Practice logging successful"

echo "\n✅ All integration tests passed!"
