#!/usr/bin/env bash
set -e
cd /opt/roommitra/website
export PATH="$PATH:/usr/local/bin:/usr/bin"
npm ci
npm run build
