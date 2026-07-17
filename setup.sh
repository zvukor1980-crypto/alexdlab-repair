#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_NAME="alexdlab-repair"
HOST="alexmayk@server326.web-hosting.com"
PORT="21098"
REMOTE_ROOT="/home/alexmayk/alexdlab"
REPO="zvukor1980-crypto/alexdlab-repair"

echo "== AlexDLab Repair: автоматическая настройка =="

command -v git >/dev/null || { echo "Не найден git"; exit 1; }
command -v ssh >/dev/null || { echo "Не найден ssh"; exit 1; }
command -v rsync >/dev/null || { echo "Не найден rsync"; exit 1; }

git init
git branch -M main
git add .
git commit -m "Initial AlexDLab Repair starter" || true

if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  if ! gh repo view "$REPO" >/dev/null 2>&1; then
    gh repo create "$REPO" --private --source=. --remote=origin --push
  else
    git remote remove origin 2>/dev/null || true
    git remote add origin "https://github.com/$REPO.git"
    git push -u origin main
  fi
else
  echo "GitHub CLI не авторизован. Проект создан локально, GitHub пока пропущен."
fi

echo "Загружаю публичную часть сайта на хостинг..."
ssh -p "$PORT" "$HOST" "mkdir -p '$REMOTE_ROOT/public'"
rsync -az --delete -e "ssh -p $PORT" public/ "$HOST:$REMOTE_ROOT/public/"
ssh -p "$PORT" "$HOST" "rm -f /home/alexmayk/public_html /home/alexmayk/www; ln -s '$REMOTE_ROOT/public' /home/alexmayk/public_html; ln -s public_html /home/alexmayk/www"

echo
echo "Готово."
echo "Локальный проект: $(pwd)"
echo "Сайт: https://alexdlab.com"
echo "Важно: source-materials не отправлены на хостинг и не добавлены в GitHub."
