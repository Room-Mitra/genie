#!/usr/bin/env bash
set -e
export PATH="$PATH:/usr/local/bin:/usr/bin"
pm2 stop website || true
