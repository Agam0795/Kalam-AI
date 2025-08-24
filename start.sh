#!/bin/bash

# Kalam AI Startup Script
echo "🚀 Starting Kalam AI Application..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local file not found. Please create it with required environment variables."
    echo "Required variables:"
    echo "- GOOGLE_API_KEY"
    echo "- ALTERNATIVE_API_KEY"
    echo "- MONGODB_URI"
    echo "- NEXTAUTH_SECRET"
    echo "- NEXTAUTH_URL"
fi

# Start development server
echo "🌟 Starting development server..."
npm run dev
