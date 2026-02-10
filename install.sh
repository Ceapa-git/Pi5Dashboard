#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
  echo "This script must be run as root."
  echo "Use: sudo $0"
  exit 1
fi

read -r -p "Did you edit the mount paths for your storage devices in backend/stats.py [y/N] " confirm
confirm=${confirm:-N}

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
USER_NAME="${SUDO_USER:-$USER}"
BACKEND_SH="$APP_DIR/backend.sh"
FRONTEND_SH="$APP_DIR/frontend.sh"
NGINX_SITE_NAME="pi5dashboard"
NGINX_AVAIL="/etc/nginx/sites-available/$NGINX_SITE_NAME"
NGINX_ENABLED="/etc/nginx/sites-enabled/$NGINX_SITE_NAME"

command -v npm >/dev/null 2>&1 || { echo "Error: npm not installed/in PATH."; exit 1; }
command -v nginx >/dev/null 2>&1 || { echo "Error: nginx not installed/in PATH."; exit 1; }

if [ ! -f "$BACKEND_SH" ]; then
  echo "Error: backend.sh not found at $BACKEND_SH"
  exit 1
fi

if [ ! -f "$FRONTEND_SH" ]; then
  echo "Error: frontend.sh not found at $FRONTEND_SH"
  exit 1
fi

echo "Writing systemd services..."

cat > /etc/systemd/system/dashboard_backend.service <<EOF
[Unit]
Description=Pi5 Dashboard Backend
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$APP_DIR
ExecStart=/bin/bash $BACKEND_SH
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/dashboard_frontend_build.service <<EOF
[Unit]
Description=Pi5 Dashboard Frontend Build
After=network.target

[Service]
Type=oneshot
User=$USER_NAME
WorkingDirectory=$APP_DIR
ExecStart=/bin/bash $FRONTEND_SH
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

echo "Writing nginx site config (NOT starting nginx)..."

FRONTEND_DIST="$APP_DIR/frontend/dist"

cat > "$NGINX_AVAIL" <<EOF
server {
    listen 80;
    server_name _;

    root $FRONTEND_DIST;
    index index.html;

    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend reverse proxy (adjust port if your backend uses a different one)
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

if [ -e "$NGINX_ENABLED" ]; then
  rm -f "$NGINX_ENABLED"
fi
ln -s "$NGINX_AVAIL" "$NGINX_ENABLED"

if [ -e /etc/nginx/sites-enabled/default ]; then
  echo "Disabling nginx default site..."
  rm -f /etc/nginx/sites-enabled/default
fi

nginx -t

systemctl daemon-reload
systemctl enable dashboard_backend.service
systemctl enable dashboard_frontend_build.service

echo "Running frontend build (oneshot)..."
systemctl start dashboard_frontend_build.service

echo "Starting backend..."
systemctl start dashboard_backend.service

echo
echo "Installed:"
echo " - dashboard_backend.service (enabled + started)"
echo " - dashboard_frontend_build.service (enabled; ran build now)"
echo " - nginx site: $NGINX_AVAIL (enabled via symlink)"
echo
echo "NGINX was NOT started/restarted."
echo "When ready, run:"
echo "  sudo systemctl reload nginx   # or restart nginx"
echo
echo "Logs:"
echo "  journalctl -u dashboard_backend.service -f"
echo "  journalctl -u dashboard_frontend_build.service -f"

