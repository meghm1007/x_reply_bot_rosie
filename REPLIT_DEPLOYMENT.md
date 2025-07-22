# 🚀 Replit Deployment Guide

## Step-by-Step Deployment Process

### 1. Create New Replit Project
1. Go to [replit.com](https://replit.com) and sign in
2. Click "Create Repl"
3. Choose "Import from GitHub" OR "Upload folder"
4. Name your repl: `rosebud-x-bot`

### 2. Upload Your Project Files
**If using folder upload:**
- Zip your entire project folder
- Upload the zip file
- Replit will extract automatically

**If using GitHub:**
- Push your code to GitHub first
- Import the repository URL

### 3. Configure Environment Variables
1. In your Repl, click the "Secrets" tab (🔒 icon in sidebar)
2. Add each environment variable:

```
TWITTER_API_KEY = ni1XXJBIK0kzljtPjWDUqXzPh
TWITTER_API_SECRET = vXgQFABEzkhzgfpjiVTdnwAM84i76toLg6KYUu41v6CQHbR3B5
TWITTER_ACCESS_TOKEN = 1897953491936784384-XTiT7A7jOjo8781myu4eFpdqZzml1X
TWITTER_ACCESS_TOKEN_SECRET = JaGQ4vz7zZwO6EwuZnkL8effgZ9ykJc50uhuo57rSNyjC
TWITTER_BEARER_TOKEN = AAAAAAAAAAAAAAAAAAAAAHnB3AEAAAAAA7TCpLqemkl1ebKrNb6QAdJOUDM%3D0SE8nPNpREAyIlPpYZLsPo1egZva9NXvIiejS08wb2b6mUB8Lm
GEMINI_API_KEY = your_gemini_api_key_here
BOT_USERNAME = MeghMehta160626
POLL_INTERVAL_MINUTES = 15
MAX_THREAD_LENGTH = 10
```

### 4. Install Dependencies
In the Replit console, run:
```bash
npm install
```

### 5. Test Your Setup
```bash
npm test
```

### 6. Start Your Bot
Click the green "Run" button or type:
```bash
npm start
```

### 7. Keep Your Bot Alive
- Your Repl will show a web preview with bot status
- Keep the Repl tab open or use UptimeRobot to ping it
- The keep-alive server prevents Replit from sleeping

## 🔧 Troubleshooting

**Bot not starting?**
- Check all environment variables are set
- Verify API keys are correct
- Check console for error messages

**Rate limit errors?**
- This is normal! Bot will retry automatically
- Wait 15 minutes between tests

**Repl going to sleep?**
- Keep the tab open
- Use UptimeRobot to ping your repl URL every 5 minutes

## 🎯 Testing Your Bot

1. Tag your bot in a tweet: "@MeghMehta160626 let's play!"
2. Wait up to 15 minutes
3. Bot will reply with a game prompt
4. Check Repl console for logs

## 📊 Monitoring

Your Repl URL will show:
```json
{
  "status": "alive",
  "bot": "Rosebud X Bot", 
  "timestamp": "2024-01-15T12:00:00.000Z",
  "message": "🤖 Bot is running and checking for mentions!"
}
```

## 🎉 Success!

Once deployed, your bot will:
- Check for mentions every 15 minutes
- Reply to all tagged tweets with creative games
- Run 24/7 on Replit's servers
- Handle rate limits gracefully 