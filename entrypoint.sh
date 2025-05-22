#!/bin/sh
set -e

echo "📦 Running migrations..."
npm run db:migrate:production

echo "🚀 Starting app..."
exec NODE_ENV=production node dist/app/index.js