#!/bin/bash

# Rosebud X Bot Deployment Script
# This script helps you deploy your bot to various platforms

echo "🤖 Rosebud X Bot Deployment Helper"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your API keys before continuing."
    echo "   Required: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN,"
    echo "            TWITTER_ACCESS_TOKEN_SECRET, OPENAI_API_KEY, BOT_USERNAME"
    read -p "Press Enter after you've configured .env file..."
fi

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please check your configuration."
    exit 1
fi

echo "✅ All tests passed!"

# Ask for deployment target
echo ""
echo "🚀 Choose deployment option:"
echo "1) Run locally (development)"
echo "2) Run locally (production)"
echo "3) Deploy to Replit"
echo "4) Deploy to Railway"
echo "5) Deploy to Render"
echo "6) Setup PM2 (for VPS)"

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo "🏃 Starting bot in development mode..."
        npm run dev
        ;;
    2)
        echo "🏃 Starting bot in production mode..."
        npm start
        ;;
    3)
        echo "📋 Replit Deployment Instructions:"
        echo "1. Go to replit.com and create new Node.js project"
        echo "2. Upload your project files"
        echo "3. In Secrets tab, add all environment variables from .env"
        echo "4. Run: npm install"
        echo "5. Run: npm start"
        echo "6. Keep the Repl running to maintain bot activity"
        ;;
    4)
        echo "📋 Railway Deployment Instructions:"
        echo "1. Connect your GitHub repository to Railway"
        echo "2. Add environment variables in Railway dashboard"
        echo "3. Railway will automatically deploy from your repo"
        echo "4. Monitor logs in Railway dashboard"
        ;;
    5)
        echo "📋 Render Deployment Instructions:"
        echo "1. Connect your GitHub repository to Render"
        echo "2. Create new Web Service"
        echo "3. Add environment variables in Render dashboard"
        echo "4. Set build command: npm install"
        echo "5. Set start command: npm start"
        ;;
    6)
        echo "🔧 Setting up PM2..."
        if ! command -v pm2 &> /dev/null; then
            echo "Installing PM2..."
            npm install -g pm2
        fi
        
        echo "Starting bot with PM2..."
        pm2 start src/bot.js --name "rosebud-bot"
        pm2 save
        pm2 startup
        
        echo "✅ Bot is now running with PM2!"
        echo "Monitor with: pm2 status"
        echo "View logs with: pm2 logs rosebud-bot"
        echo "Restart with: pm2 restart rosebud-bot"
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo "💡 Remember to:"
echo "   - Monitor your bot's activity"
echo "   - Check API usage limits"
echo "   - Keep your API keys secure"
echo "   - Test with a few mentions first" 