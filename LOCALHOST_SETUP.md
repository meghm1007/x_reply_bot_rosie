# 🖥️ Localhost Development Setup

## Quick Start

### 1. Set Up Environment Variables

```bash
# Copy the example file
copy env.example .env

# Edit .env with your actual credentials:
# - Twitter API keys from developer.twitter.com
# - Gemini API key from makersuite.google.com  
# - Your bot username: MeghMehta160626
```

### 2. Test Your Setup

```bash
# Check environment variables
npm run test-env

# Test bot logic (safe, no API calls)
npm run test-manual

# Test with real Twitter API (careful of rate limits!)
npm test
```

### 3. Run Your Bot Locally

```bash
# Start the bot
npm start

# Visit http://localhost:3000 to see bot status
# Bot will check for mentions every 15 minutes
```

## 🔧 Troubleshooting

**Environment variables not set?**
- Make sure you copied `env.example` to `.env`
- Fill in all the required values
- No quotes needed around values in .env

**Port 3000 busy?**
- Bot will automatically try ports 3001, 3002, etc.
- Or set `PORT=4000` in your .env file

**Rate limit errors?**
- This is normal with Twitter's free API
- Bot will wait and retry automatically
- Wait 15 minutes between tests

**"Invalid consumer tokens"?**
- Double-check your Twitter API credentials
- Make sure they're from the same Twitter app
- Verify the app has Read and Write permissions

## 🎯 Testing Your Bot

1. **Tweet**: "@MeghMehta160626 let's play a game!"
2. **Wait**: Bot checks every 15 minutes  
3. **Watch logs**: See bot activity in terminal
4. **Check reply**: Bot should reply with a game prompt

## 🚀 Ready for Production?

Once your bot works locally:
1. Push code to GitHub
2. Follow `RAILWAY_DEPLOYMENT.md` 
3. Deploy to Railway.app for 24/7 operation

## 📚 Understanding the Code

- `src/bot.js` - Main bot logic
- `src/ai-service.js` - Gemini AI integration
- `src/persistence.js` - Saves replied tweets
- `src/thread-reader.js` - Reads conversation threads
- `src/keep-alive.js` - Web server for status checking

Happy coding! 🤖✨ 