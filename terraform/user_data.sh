#!/usr/bin/env bash
set -euxo pipefail

# ---------- Base OS & essentials ----------
dnf -y update || true
dnf -y install nginx git tar bind-utils amazon-ssm-agent ruby wget docker certbot python3-certbot-nginx rsync || true

systemctl enable --now amazon-ssm-agent
systemctl enable nginx

# Enable and start the Docker service
sudo systemctl enable docker
sudo systemctl start docker


# ---------- Node.js 20 (Amazon Linux 2023 built-in) ----------
dnf -y install nodejs npm
npm install -g pm2


# ---------- App user & directories (PM2 needs a HOME) ----------
if ! id appuser >/dev/null 2>&1; then
  useradd -m -d /home/appuser -s /bin/bash appuser
fi

usermod -aG docker appuser

install -d -o appuser -g appuser -m 750 /home/appuser
install -d -o appuser -g appuser -m 700 /home/appuser/.pm2

mkdir -p /opt/roommitra/{api,webapp}
chmod 775 -R /opt/roommitra
chown -R appuser:appuser /opt/roommitra


# 2) API (api.roommitra.com) on :4000  — plain Node to avoid express install
cat >/opt/roommitra/api/server.js <<'EOF'
const http = require('http');
const port = 4000;
http.createServer((req,res)=>{
  if (req.url === '/health') {
    res.writeHead(200, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({ok:true}));
  }
  res.writeHead(200, {'Content-Type':'application/json'});
  res.end(JSON.stringify({ok:true, app:"RoomMitra API placeholder"}));
}).listen(port, ()=>console.log('API on',port));
EOF

# 3) Dashboard (app.roommitra.com) on :3001
cat >/opt/roommitra/webapp/server.js <<'EOF'
const http = require('http');
const port = 3001;
http.createServer((req,res)=>{
  res.writeHead(200, {'Content-Type':'text/plain'});
  res.end('RoomMitra Dashboard (CRA placeholder)');
}).listen(port, ()=>console.log('Dashboard on',port));
EOF

chown -R appuser:appuser /opt/roommitra

# ---------- Start apps with Docker / PM2 under appuser ----------

su -s /bin/bash - appuser -c "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${REGISTRY}"
su -s /bin/bash - appuser -c "docker pull ${WEBSITE_IMAGE_URI}"
su -s /bin/bash - appuser -c "docker stop website || true"
su -s /bin/bash - appuser -c "docker rm website || true"
su -s /bin/bash - appuser -c "docker run -d --name website --restart unless-stopped -p 3000:3000 ${WEBSITE_IMAGE_URI}"


su -s /bin/bash - appuser -c "pm2 start /opt/roommitra/api/server.js --name api || true"
su -s /bin/bash - appuser -c "pm2 start /opt/roommitra/webapp/server.js   --name webapp   || true"
su -s /bin/bash - appuser -c "pm2 save || true"
pm2 startup systemd -u appuser --hp /home/appuser

# ---------- Nginx reverse proxy (HTTP only pre-cert) ----------
cat >/etc/nginx/conf.d/roommitra-precert.conf <<'NGINX'
# Upgrade map for websockets
map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}

# roommitra.com -> :3000
server {
  listen 80;
  listen [::]:80;
  server_name roommitra.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
  }
}

# api.roommitra.com -> :4000
server {
  listen 80;
  listen [::]:80;
  server_name api.roommitra.com;

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
  }
}

# app.roommitra.com -> :3001
server {
  listen 80;
  listen [::]:80;
  server_name app.roommitra.com;

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
  }
}
NGINX


# ---------- Restore SSL certificates ----------
BUCKET="s3://roommitra-codedeploy/certs"

sudo aws s3 cp "$BUCKET/letsencrypt-latest.tgz" /root/
sudo tar -xzf /root/letsencrypt-latest.tgz -C /etc

sudo certbot install --nginx --cert-name roommitra.com

nginx -t
systemctl restart nginx
systemctl restart docker
