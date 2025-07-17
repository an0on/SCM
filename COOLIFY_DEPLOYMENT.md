# 🚀 Coolify Deployment Guide

## Skateboard Contest App - Production Ready

### 📋 **Pre-Deployment Checklist**

#### ✅ **1. Repository Setup**
- [ ] Code auf GitHub/GitLab gepusht
- [ ] `.env.example` mit allen nötigen Variablen
- [ ] `Dockerfile` optimiert für Production
- [ ] `docker-compose.yml` konfiguriert

#### ✅ **2. Supabase Konfiguration**
- [ ] Produktions-Supabase unter `https://supabase.bamboy.de` erreichbar
- [ ] Database Schema deployed
- [ ] RLS-Policies aktiviert
- [ ] Environment Variables dokumentiert

#### ✅ **3. External Services**
- [ ] PayPal Production Keys verfügbar
- [ ] Domain `skateboard.bamboy.de` konfiguriert
- [ ] SSL-Zertifikat Setup bereit

---

## 🔧 **Coolify Setup Schritte**

### **Schritt 1: Neues Projekt in Coolify erstellen**

1. **Coolify Dashboard** öffnen
2. **"New Resource"** → **"Application"**
3. **Repository URL** eingeben
4. **Branch** auf `main` setzen
5. **Build Pack** auf `Docker` setzen

### **Schritt 2: Environment Variables konfigurieren**

```bash
# REQUIRED - Supabase Configuration
REACT_APP_SUPABASE_URL=https://supabase.bamboy.de
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# CRITICAL - Super Admin Security
REACT_APP_SUPER_ADMIN_SETUP_TOKEN=your_64_character_secure_token

# REQUIRED - PayPal Production
REACT_APP_PAYPAL_CLIENT_ID=your_production_paypal_client_id
REACT_APP_PAYPAL_MODE=production

# REQUIRED - Application Config
REACT_APP_APP_NAME=Skateboard Contest Manager
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# REQUIRED - Docker/Coolify
PORT=8080
NODE_ENV=production
TZ=Europe/Berlin

# SECURITY - SSL/HTTPS
REACT_APP_FORCE_HTTPS=true
REACT_APP_SECURE_COOKIES=true

# OPTIONAL - Security Settings
REACT_APP_SESSION_TIMEOUT_MINUTES=30
REACT_APP_MAX_LOGIN_ATTEMPTS=5
REACT_APP_LOCKOUT_DURATION_MINUTES=15

# OPTIONAL - Monitoring
REACT_APP_ENABLE_MONITORING=true
REACT_APP_LOG_LEVEL=warn
```

### **Schritt 3: Domain & SSL Konfiguration**

1. **Domain hinzufügen**: `skateboard.bamboy.de`
2. **SSL aktivieren**: Let's Encrypt Auto-SSL
3. **Force HTTPS**: Aktivieren
4. **WWW Redirect**: Nach Bedarf

### **Schritt 4: Resource Limits setzen**

```yaml
# Coolify Resource Configuration
resources:
  limits:
    memory: 512MB
    cpu: 1.0
  reservations:
    memory: 128MB
    cpu: 0.25
```

### **Schritt 5: Health Check konfigurieren**

- **Health Check URL**: `/health`
- **Interval**: 30s
- **Timeout**: 10s
- **Retries**: 3

---

## 🛠️ **Build & Deployment**

### **Automatisches Deployment**

1. **GitHub Actions** sind bereits konfiguriert
2. **Push to main** → Automatisches Build & Deploy
3. **Health Check** nach Deployment
4. **Notification** bei Erfolg/Fehler

### **Manuelles Deployment**

```bash
# Local Build testen
npm run docker:build
npm run docker:run

# Health Check testen
curl http://localhost:8080/health

# Production Deploy über Coolify Interface
```

---

## 📊 **Monitoring & Maintenance**

### **Health Monitoring**

```bash
# Health Check Endpoint
GET https://skateboard.bamboy.de/health

# Erwartete Antwort
HTTP/1.1 200 OK
Content-Type: text/plain

healthy
```

### **Log Monitoring**

```bash
# Coolify Logs anzeigen
# Via Coolify Dashboard → Logs Tab

# Wichtige Log-Patterns
grep "ERROR" logs/
grep "Health check" logs/
grep "Super Admin" logs/
```

### **Performance Monitoring**

- **Response Time**: < 2s
- **Memory Usage**: < 400MB
- **CPU Usage**: < 80%
- **Disk Space**: < 80%

---

## 🚨 **Troubleshooting**

### **Häufige Probleme**

#### **1. Build Failures**
```bash
# Check build logs in Coolify
# Common issues:
- Environment Variables missing
- Node version mismatch
- Docker build timeout
```

#### **2. Runtime Errors**
```bash
# Check application logs
# Common issues:
- Supabase connection failed
- Invalid environment variables
- Health check failing
```

#### **3. SSL/Domain Issues**
```bash
# Check DNS configuration
dig skateboard.bamboy.de

# Check SSL certificate
openssl s_client -connect skateboard.bamboy.de:443 -servername skateboard.bamboy.de
```

### **Debug Commands**

```bash
# Container Shell Access (via Coolify)
# Check container status
ps aux
df -h
free -m

# Check nginx status
nginx -t
nginx -s reload

# Test endpoints
curl http://localhost:8080/health
curl http://localhost:8080/
```

---

## 🔄 **Backup & Recovery**

### **Automated Backups**

1. **Database**: Supabase Point-in-Time Recovery
2. **Environment**: Variables gesichert in Coolify
3. **Code**: GitHub Repository als Source of Truth

### **Recovery Procedures**

#### **Rollback zu vorheriger Version**
```bash
# Via Coolify Dashboard
1. Deployments Tab
2. Select previous successful deployment
3. Click "Redeploy"
```

#### **Emergency Recovery**
```bash
# Complete rebuild from scratch
1. New Coolify Application
2. Same environment variables
3. Deploy from GitHub main branch
4. Update DNS if needed
```

---

## 📈 **Performance Optimization**

### **Production Optimizations bereits aktiv:**

- ✅ **Multi-stage Docker build**
- ✅ **Nginx mit Gzip/Brotli Compression**
- ✅ **Static Asset Caching**
- ✅ **Optimized React Build**
- ✅ **Security Headers**
- ✅ **Rate Limiting**

### **Additional Optimizations:**

```bash
# CDN Setup (optional)
REACT_APP_CDN_URL=https://cdn.bamboy.de

# Database Connection Pooling
REACT_APP_DB_POOL_SIZE=10

# Asset Optimization
npm run analyze  # Bundle size analysis
```

---

## 🔐 **Security Checklist**

### **Post-Deployment Security Verification**

- [ ] **HTTPS** erzwungen
- [ ] **Security Headers** aktiv
- [ ] **Rate Limiting** funktioniert
- [ ] **Health Endpoint** verfügbar
- [ ] **Audit Logging** aktiv
- [ ] **2FA** für Super Admin verfügbar

### **Security Tests**

```bash
# SSL Test
curl -I https://skateboard.bamboy.de

# Security Headers Test
curl -I https://skateboard.bamboy.de | grep -i security

# Rate Limiting Test
for i in {1..20}; do curl -s -o /dev/null -w "%{http_code}\n" https://skateboard.bamboy.de/api/test; done
```

---

## 📞 **Support & Kontakt**

### **Bei Deployment-Problemen:**

1. **Coolify Logs** prüfen
2. **GitHub Actions** Status checken
3. **Health Check** manuell testen
4. **Environment Variables** verifizieren

### **Notfall-Kontakte:**

- **Technical Lead**: admin@bamboy.de
- **DevOps**: devops@bamboy.de
- **Emergency**: +49-xxx-xxx-xxxx

---

## 🎯 **Next Steps nach Deployment**

1. **Super Admin Setup** durchführen
2. **Erste Contest** erstellen
3. **PayPal Integration** testen
4. **Performance Monitoring** aktivieren
5. **User Documentation** bereitstellen

---

**✅ Deine Skateboard Contest App ist jetzt Coolify-ready und bereit für Production Deployment!**