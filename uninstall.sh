#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
  echo "This script must be run as root."
  echo "Use: sudo $0"
  exit 1
fi

SERVICES=("dashboard_backend.service" "dashboard_frontend_build.service")
NGINX_SITE_NAME="pi5dashboard"
NGINX_AVAIL="/etc/nginx/sites-available/$NGINX_SITE_NAME"
NGINX_ENABLED="/etc/nginx/sites-enabled/$NGINX_SITE_NAME"

for service in "${SERVICES[@]}"; do
  echo "Stopping/disabling $service (if present)..."
  systemctl stop "$service" 2>/dev/null || true
  systemctl disable "$service" 2>/dev/null || true
  rm -f "/etc/systemd/system/$service"
done

echo "Removing nginx site config..."
rm -f "$NGINX_ENABLED"
rm -f "$NGINX_AVAIL"

if [ -f /etc/nginx/sites-available/default ] && [ ! -e /etc/nginx/sites-enabled/default ]; then
  echo "Restoring nginx default site..."
  ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
fi

systemctl daemon-reload
systemctl reset-failed

if command -v nginx >/dev/null 2>&1; then
  nginx -t || true
fi

echo "Uninstalled services and removed nginx config."
echo "If nginx is running, you may want to reload it manually:"
echo "  sudo systemctl reload nginx"

