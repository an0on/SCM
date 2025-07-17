# Multi-stage build für optimale Performance
FROM node:18-alpine AS builder

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package-Dateien kopieren für besseres Caching
COPY package*.json ./

# Dependencies installieren
RUN npm install --silent

# Source-Code kopieren
COPY . .

# Build-Argumente für Environment Variables
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY
ARG REACT_APP_SUPER_ADMIN_SETUP_TOKEN
ARG REACT_APP_PAYPAL_CLIENT_ID
ARG REACT_APP_PAYPAL_MODE
ARG REACT_APP_ENVIRONMENT

# Environment Variables setzen
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY
ENV REACT_APP_SUPER_ADMIN_SETUP_TOKEN=$REACT_APP_SUPER_ADMIN_SETUP_TOKEN
ENV REACT_APP_PAYPAL_CLIENT_ID=$REACT_APP_PAYPAL_CLIENT_ID
ENV REACT_APP_PAYPAL_MODE=$REACT_APP_PAYPAL_MODE
ENV REACT_APP_ENVIRONMENT=$REACT_APP_ENVIRONMENT

# Production Build erstellen
RUN npm run build

# Production Stage mit Nginx
FROM nginx:1.25-alpine AS production

# Security-Updates und curl installieren
RUN apk add --no-cache --upgrade apk-tools && \
    apk upgrade --no-cache && \
    apk add --no-cache curl

# Custom Nginx-Konfiguration kopieren
COPY nginx.conf /etc/nginx/nginx.conf

# Build-Dateien von Builder-Stage kopieren
COPY --from=builder /app/build /usr/share/nginx/html

# Health-Check-Script hinzufügen
COPY health-check.sh /usr/local/bin/health-check.sh
RUN chmod +x /usr/local/bin/health-check.sh

# Non-root User erstellen für Security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Ownership der Nginx-Dateien setzen
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d
    
# Temporäre Verzeichnisse für Nginx erstellen
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    chown -R nextjs:nodejs /var/cache/nginx

# Port für Coolify (kann 3000 oder 8080 sein)
EXPOSE 8080

# Health Check konfigurieren
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /usr/local/bin/health-check.sh

# User wechseln
USER nextjs

# Nginx im Foreground starten
CMD ["nginx", "-g", "daemon off;"]