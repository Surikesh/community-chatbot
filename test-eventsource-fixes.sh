#!/bin/bash

# Test script to verify EventSource fixes and request logging
# This script tests the chatbot's ability to handle multiple requests
# without creating message loops

echo "🧪 Testing Community Chatbot EventSource Fixes"
echo "=============================================="

# Check if backend is running
echo "📡 Checking if backend is running on port 8080..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running. Please start it first with:"
    echo "   cd backend && go run cmd/server/main.go"
    exit 1
fi

# Test 1: Single message request
echo ""
echo "🧪 Test 1: Single message request"
echo "Sending single chat message..."
RESPONSE=$(curl -s -w "%{http_code}" \
    "http://localhost:8080/api/v1/chat/stream?message=Hello%20there" \
    -H "Accept: text/event-stream" \
    -H "User-Agent: TestScript/1.0" \
    --max-time 10)

HTTP_CODE="${RESPONSE: -3}"
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Single message test passed (HTTP $HTTP_CODE)"
else
    echo "❌ Single message test failed (HTTP $HTTP_CODE)"
fi

sleep 2

# Test 2: Duplicate message prevention
echo ""
echo "🧪 Test 2: Duplicate message prevention"
echo "Sending same message twice quickly..."

# Send first message
curl -s "http://localhost:8080/api/v1/chat/stream?message=Test%20duplicate" \
    -H "Accept: text/event-stream" \
    -H "User-Agent: TestScript/1.0" \
    --max-time 3 > /dev/null &

# Immediately send duplicate
RESPONSE2=$(curl -s -w "%{http_code}" \
    "http://localhost:8080/api/v1/chat/stream?message=Test%20duplicate" \
    -H "Accept: text/event-stream" \
    -H "User-Agent: TestScript/1.0" \
    --max-time 3)

HTTP_CODE2="${RESPONSE2: -3}"
if [ "$HTTP_CODE2" = "429" ]; then
    echo "✅ Duplicate prevention test passed (HTTP $HTTP_CODE2 - Too Many Requests)"
else
    echo "❌ Duplicate prevention test failed (HTTP $HTTP_CODE2)"
fi

sleep 5

# Test 3: Multiple clients simulation
echo ""
echo "🧪 Test 3: Multiple clients simulation"
echo "Simulating 3 different clients..."

for i in {1..3}; do
    echo "Sending request from client $i..."
    curl -s "http://localhost:8080/api/v1/chat/stream?message=Client%20$i%20message" \
        -H "Accept: text/event-stream" \
        -H "User-Agent: TestClient$i/1.0" \
        -H "X-Forwarded-For: 192.168.1.$((10+i))" \
        --max-time 5 > /dev/null &
    sleep 1
done

wait
echo "✅ Multiple clients test completed"

# Test 4: Check server logs for request logging
echo ""
echo "🧪 Test 4: Checking server logs for request logging"
echo "Last 10 log entries from backend:"
if [ -f "../backend/server.log" ]; then
    tail -10 ../backend/server.log | grep -E "\[REQUEST\]|\[CHAT\]|\[DUPLICATE\]" || echo "No request logs found"
else
    echo "Server log file not found. Logs may be going to stdout."
fi

echo ""
echo "🎉 Test script completed!"
echo ""
echo "📋 Expected behaviors:"
echo "   ✓ Single messages should work (HTTP 200)"
echo "   ✓ Duplicate messages should be blocked (HTTP 429)"
echo "   ✓ Each client should be logged with IP and User-Agent"
echo "   ✓ No automatic reconnection loops should occur"
echo ""
echo "📝 Check the backend logs to verify request logging is working:"
echo "   - Look for [REQUEST] entries with client IPs"
echo "   - Look for [DUPLICATE] entries for repeated messages"
echo "   - Look for [CHAT] entries for successful message processing"
