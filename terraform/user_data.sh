#!/usr/bin/env bash
set -euxo pipefail

# ---------- Base OS & essentials ----------
dnf -y update || true
dnf -y install nginx git tar bind-utils amazon-ssm-agent ruby wget docker certbot python3-certbot-nginx || true

systemctl enable --now amazon-ssm-agent
systemctl enable nginx

# Enable and start the Docker service
sudo systemctl enable docker
sudo systemctl start docker


# ---------- App user & directories (PM2 needs a HOME) ----------
if ! id appuser >/dev/null 2>&1; then
  useradd -m -d /home/appuser -s /bin/bash appuser
fi

usermod -aG docker appuser

install -d -o appuser -g appuser -m 750 /home/appuser
install -d -o appuser -g appuser -m 700 /home/appuser/.pm2

mkdir -p /opt/roommitra/{api,webapp,website}
chmod 775 -R /opt/roommitra
chown -R appuser:appuser /opt/roommitra

# ---------- Start apps with Docker under appuser ----------
sudo -u appuser -H bash -lc "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${REGISTRY}"

# website
sudo -u appuser -H bash -lc "aws ssm get-parameter --name \"/roommitra/website/env\" --with-decryption --query \"Parameter.Value\" --output text > /opt/roommitra/website/.env"
sudo -u appuser -H bash -lc "chmod 600 /opt/roommitra/website/.env"
sudo -u appuser -H bash -lc "docker pull ${WEBSITE_IMAGE_URI}"
sudo -u appuser -H bash -lc "docker stop website || true"
sudo -u appuser -H bash -lc "docker rm website || true"
sudo -u appuser -H bash -lc "docker run -d --name website --env-file /opt/roommitra/website/.env --restart unless-stopped -p 3000:3000 --log-driver=awslogs --log-opt awslogs-region=ap-south-1 --log-opt awslogs-group=/roommitra/containers --log-opt awslogs-stream=website ${WEBSITE_IMAGE_URI}"


# api
sudo -u appuser -H bash -lc "aws ssm get-parameter --name \"/roommitra/api/env\" --with-decryption --query \"Parameter.Value\" --output text > /opt/roommitra/api/.env"
sudo -u appuser -H bash -lc "chmod 600 /opt/roommitra/api/.env"
sudo -u appuser -H bash -lc "docker pull ${API_IMAGE_URI}"
sudo -u appuser -H bash -lc "docker stop api || true"
sudo -u appuser -H bash -lc "docker rm api || true"
sudo -u appuser -H bash -lc "docker run -d --name api --env-file /opt/roommitra/api/.env --restart unless-stopped -p 4000:4000 --log-driver=awslogs --log-opt awslogs-region=ap-south-1 --log-opt awslogs-group=/roommitra/containers --log-opt awslogs-stream=api ${API_IMAGE_URI}"

# webapp
sudo -u appuser -H bash -lc "aws ssm get-parameter --name \"/roommitra/webapp/env\" --with-decryption --query \"Parameter.Value\" --output text > /opt/roommitra/webapp/.env"
sudo -u appuser -H bash -lc "chmod 600 /opt/roommitra/webapp/.env"
sudo -u appuser -H bash -lc "docker pull ${WEBAPP_IMAGE_URI}"
sudo -u appuser -H bash -lc "docker stop webapp || true"
sudo -u appuser -H bash -lc "docker rm webapp || true"
sudo -u appuser -H bash -lc "docker run -d --name webapp --env-file /opt/roommitra/webapp/.env --restart unless-stopped -p 3001:3001 --log-driver=awslogs --log-opt awslogs-region=ap-south-1 --log-opt awslogs-group=/roommitra/containers --log-opt awslogs-stream=webapp ${WEBAPP_IMAGE_URI}"

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
