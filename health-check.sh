#!/bin/sh

# Health Check Script für Coolify Monitoring
# Überprüft ob die App verfügbar und funktionsfähig ist

set -e

# Konfiguration
HOST="localhost"
PORT="8080"
TIMEOUT="10"

# Basis Health Check
echo "🔍 Checking application health..."

# 1. Port-Check
if ! nc -z $HOST $PORT 2>/dev/null; then
    echo "❌ Port $PORT is not accessible"
    exit 1
fi

# 2. HTTP Response Check
HTTP_CODE=$(wget --no-check-certificate --quiet \
  --method=GET \
  --timeout=$TIMEOUT \
  --output-document=/dev/null \
  --server-response \
  "http://$HOST:$PORT/health" 2>&1 | awk '/^  HTTP/{print $2}' | tail -1)

if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ Health endpoint returned HTTP $HTTP_CODE"
    exit 1
fi

# 3. Content Check
RESPONSE=$(wget --no-check-certificate --quiet \
  --timeout=$TIMEOUT \
  --output-document=- \
  "http://$HOST:$PORT/health" 2>/dev/null)

if [ "$RESPONSE" != "healthy" ]; then
    echo "❌ Health endpoint returned unexpected content: $RESPONSE"
    exit 1
fi

# 4. Main App Check
MAIN_HTTP_CODE=$(wget --no-check-certificate --quiet \
  --method=GET \
  --timeout=$TIMEOUT \
  --output-document=/dev/null \
  --server-response \
  "http://$HOST:$PORT/" 2>&1 | awk '/^  HTTP/{print $2}' | tail -1)

if [ "$MAIN_HTTP_CODE" != "200" ]; then
    echo "❌ Main app returned HTTP $MAIN_HTTP_CODE"
    exit 1
fi

# 5. Memory Check (optional)
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
MEMORY_LIMIT="90.0"

if [ "$(echo "$MEMORY_USAGE > $MEMORY_LIMIT" | bc -l 2>/dev/null || echo 0)" = "1" ]; then
    echo "⚠️  High memory usage: ${MEMORY_USAGE}%"
    # Don't fail on memory, just warn
fi

# 6. Disk Space Check
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
DISK_LIMIT="95"

if [ "$DISK_USAGE" -gt "$DISK_LIMIT" ]; then
    echo "⚠️  High disk usage: ${DISK_USAGE}%"
    # Don't fail on disk space, just warn
fi

echo "✅ Application is healthy"
echo "📊 Memory usage: ${MEMORY_USAGE}%"
echo "💾 Disk usage: ${DISK_USAGE}%"
exit 0