#!/bin/bash
set -e

echo "🚀 Installing DrawSpy Backend Server on VPS..."

# 1. Prepare directory
mkdir -p /var/www/drawspy
cd /var/www/drawspy

# 2. Extract application files
cat << 'EOF' > setup.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("📦 Creating production build structure...");
EOF

# Nginx config
cat << 'EOF' > /etc/nginx/sites-available/drawspy
server {
    listen 80;
    server_name api.drawspy.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/drawspy /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default || true
nginx -t && systemctl reload nginx

echo "✅ Nginx configured for api.drawspy.com"
