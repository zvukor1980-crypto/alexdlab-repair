#!/usr/bin/env bash
set -Eeuo pipefail
HOST="alexmayk@server326.web-hosting.com"
PORT="21098"
REMOTE="/home/alexmayk/alexdlab/public"

git add .
git commit -m "Update site $(date '+%Y-%m-%d %H:%M')" || true
git push || true
rsync -az --delete -e "ssh -p $PORT" public/ "$HOST:$REMOTE/"
echo "Опубликовано: https://alexdlab.com"
