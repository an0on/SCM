#!/bin/sh

# Simple Health Check für nginx Container
set -e

# Verwende curl (sollte im nginx Container verfügbar sein)
if command -v curl >/dev/null 2>&1; then
    curl -f http://localhost:8080/health || exit 1
elif command -v wget >/dev/null 2>&1; then
    wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1
else
    # Fallback: Prüfe ob nginx läuft
    if ps aux | grep -v grep | grep nginx > /dev/null; then
        exit 0
    else
        exit 1
    fi
fi

echo "healthy"
exit 0