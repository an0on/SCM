#\!/bin/bash

echo "🧪 Testing Skateboard Contest App Deployment..."
echo "=============================================="

# Test Health Check
echo "1. Testing Health Check..."
curl -s https://skateboard.bamboy.de/health || echo "❌ Health check failed"

# Test Main Page
echo "2. Testing Main Page..."
curl -s -I https://skateboard.bamboy.de | head -1

# Test SSL Certificate
echo "3. Testing SSL Certificate..."
openssl s_client -connect skateboard.bamboy.de:443 -servername skateboard.bamboy.de 2>/dev/null | grep -E "(Verify return code|CN=)" || echo "❌ SSL test failed"

# Test Security Headers
echo "4. Testing Security Headers..."
curl -s -I https://skateboard.bamboy.de | grep -i security || echo "❌ No security headers found"

echo "✅ Deployment test complete\!"
