#!/bin/bash
cd ./frontend
npm run build
cd ..
sudo systemctl restart dashboardFrontend.service