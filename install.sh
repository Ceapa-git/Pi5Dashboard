#!/bin/bash
set -e

# Check for root / sudo
if [ "$EUID" -ne 0 ]; then
  echo "This script must be run as root."
  echo "Use: sudo $0"
  exit 1
fi

SERVICES=("dashboard_backend.service" "dashboard_frontend.service")

for service in "${SERVICES[@]}"; do
    if [ ! -f "$service" ]; then
        echo "Error: $service not found in current directory."
        exit 1
    fi

    echo "Installing $service..."
    cp "$service" /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable "$service"
    systemctl start "$service"
done

echo "All services installed and started successfully."
echo "Use 'journalctl -u <service_name> -f' to view logs."

