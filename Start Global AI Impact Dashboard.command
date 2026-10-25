#!/bin/zsh

cd "$(dirname "$0")" || exit 1

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js is required to run Global AI Impact Dashboard. Install it from https://nodejs.org/"
  read "?Press Enter to close."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing Global AI Impact Dashboard dependencies..."
  npm install || exit 1
fi

echo "Starting Global AI Impact Dashboard..."
npm run dev
