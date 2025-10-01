#!/usr/bin/env bash
set -e
cd /opt/roommitra/website
export PATH="$PATH:/usr/local/bin:/usr/bin"
command -v pm2 >/dev/null || npm i -g pm2
if [ ! -f server-start.sh ]; then
  cat > server-start.sh <<'SH'
#!/usr/bin/env bash
set -e
npm run start -- --port 3000
SH
  chmod +x server-start.sh
fi
pm2 start ./server-start.sh --name website || pm2 reload website --update-env
pm2 save
