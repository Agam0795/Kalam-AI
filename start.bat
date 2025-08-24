@echo off
REM Kalam AI Startup Script for Windows

echo 🚀 Starting Kalam AI Application...

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  Warning: .env.local file not found. Please create it with required environment variables.
    echo Required variables:
    echo - GOOGLE_API_KEY
    echo - ALTERNATIVE_API_KEY
    echo - MONGODB_URI
    echo - NEXTAUTH_SECRET
    echo - NEXTAUTH_URL
)

REM Start development server
echo 🌟 Starting development server...
npm run dev
