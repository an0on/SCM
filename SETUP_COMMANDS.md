# 🛠️ Setup Commands für Production Deployment

## Supabase Database Setup

### 1. SQL Commands für Database Setup

#### Extensions aktivieren:
```sql
-- Im Supabase SQL Editor ausführen:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

#### Schema Migration ausführen:
```sql
-- Kopiere den Inhalt von supabase/migrations/001_initial_schema.sql
-- Füge ihn in den Supabase SQL Editor ein und führe ihn aus

-- Dann kopiere den Inhalt von supabase/migrations/002_security_features.sql  
-- Füge ihn in den Supabase SQL Editor ein und führe ihn aus
```

### 2. Setup Token generieren

```bash
# Neuen sicheren Token generieren:
openssl rand -hex 32
# Beispiel Output: 7a8b9c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f

# Diesen Token für REACT_APP_SUPER_ADMIN_SETUP_TOKEN verwenden
```

### 3. Supabase Konfiguration abrufen

```bash
# Im Supabase Dashboard unter "Settings" > "API":
# 1. Project URL kopieren
# 2. anon/public Key kopieren  
# 3. service_role Key kopieren (für Admin-Operationen)
```

## Coolify Deployment Commands

### 1. Repository Setup

```bash
# Falls noch nicht geschehen:
git add .
git commit -m "Add Coolify deployment configuration"
git push origin main
```

### 2. Environment Variables für Coolify

```bash
# Diese Werte in Coolify eintragen:

# REQUIRED - Supabase
REACT_APP_SUPABASE_URL=https://[deine-project-id].supabase.co
REACT_APP_SUPABASE_ANON_KEY=[dein-anon-key]

# CRITICAL - Security  
REACT_APP_SUPER_ADMIN_SETUP_TOKEN=[dein-generierter-token]

# REQUIRED - PayPal (Production)
REACT_APP_PAYPAL_CLIENT_ID=[dein-paypal-client-id]
REACT_APP_PAYPAL_MODE=production

# REQUIRED - App Config
REACT_APP_APP_NAME=Skateboard Contest Manager
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# REQUIRED - Docker
PORT=8080
NODE_ENV=production
TZ=Europe/Berlin

# SECURITY
REACT_APP_FORCE_HTTPS=true
REACT_APP_SECURE_COOKIES=true
```

### 3. Coolify Application Setup

```bash
# In Coolify Dashboard:
# 1. "New Resource" > "Application"
# 2. Repository URL: https://github.com/[username]/skateboard-contest-app
# 3. Branch: main
# 4. Build Pack: Docker
# 5. Port: 8080
# 6. Health Check Path: /health
```

## Testing Commands

### 1. Lokaler Docker Test

```bash
# Build testen
docker build -t skateboard-test .

# Container lokal starten
docker run -p 8080:8080 \
  -e REACT_APP_SUPABASE_URL="[deine-url]" \
  -e REACT_APP_SUPABASE_ANON_KEY="[dein-key]" \
  -e REACT_APP_SUPER_ADMIN_SETUP_TOKEN="[dein-token]" \
  skateboard-test

# Health Check testen
curl http://localhost:8080/health
```

### 2. Production Health Checks

```bash
# Nach Deployment testen:
curl https://skateboard.bamboy.de/health
curl https://skateboard.bamboy.de/

# SSL Certificate prüfen:
openssl s_client -connect skateboard.bamboy.de:443 -servername skateboard.bamboy.de
```

## Troubleshooting Commands

### 1. Container Debug

```bash
# Container Shell (falls verfügbar):
docker exec -it [container-id] /bin/sh

# Logs ansehen:
docker logs [container-id]

# Nginx Status prüfen:
nginx -t
ps aux | grep nginx
```

### 2. Database Debug

```bash
# Supabase Connection Test:
psql "postgresql://postgres:[password]@[host]:5432/postgres"

# Tables prüfen:
\dt

# RLS Policies prüfen:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Network Debug

```bash
# DNS Check:
dig skateboard.bamboy.de
nslookup skateboard.bamboy.de

# Port Check:
telnet skateboard.bamboy.de 443
nc -zv skateboard.bamboy.de 443

# HTTP Response Check:
curl -I https://skateboard.bamboy.de
```

## Quick Setup Checklist

### Pre-Deployment:
- [ ] Supabase Projekt erstellt
- [ ] Database Schema deployed  
- [ ] Setup Token generiert
- [ ] PayPal Keys verfügbar
- [ ] Code auf GitHub gepusht

### Coolify Setup:
- [ ] Application erstellt
- [ ] Environment Variables gesetzt
- [ ] Domain konfiguriert (skateboard.bamboy.de)
- [ ] SSL aktiviert
- [ ] Health Check konfiguriert

### Post-Deployment:
- [ ] Health Check erfolgreich
- [ ] Super Admin Setup funktioniert
- [ ] SSL Certificate gültig
- [ ] Performance akzeptabel
- [ ] Logs ohne kritische Fehler

## Hilfreiche URLs

- Supabase Dashboard: https://supabase.bamboy.de
- Coolify Dashboard: [deine-coolify-url]
- Production App: https://skateboard.bamboy.de
- GitHub Repository: https://github.com/[username]/skateboard-contest-app