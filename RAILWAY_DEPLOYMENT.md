# 🚄 Railway.app Deployment Guide

## Why Railway.app?

✅ **500 free hours/month** - plenty for a bot  
✅ **Always online** - no sleeping like Replit free  
✅ **Auto-deploy** from GitHub  
✅ **Easy environment variables**  
✅ **Great for beginners**  

## Step-by-Step Deployment

### 1. Prepare Your Code

Make sure your bot works locally first:

```bash
# Test environment
npm run test-env

# Test bot logic (no API calls)
npm run test-manual  

# Test with real API (careful of rate limits)
npm test

# Start bot locally
npm start
```

### 2. Push to GitHub

```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 3. Deploy to Railway

1. **Sign up**: Go to [railway.app](https://railway.app) 
2. **Connect GitHub**: Sign in with GitHub
3. **New Project**: Click "New Project" → "Deploy from GitHub repo"
4. **Select repo**: Choose your `rosebud_x_bot` repository
5. **Auto-deploy**: Railway will automatically build and deploy

### 4. Add Environment Variables

In Railway dashboard:

1. **Go to Variables tab**
2. **Add each variable**:
   ```
   TWITTER_API_KEY=your_actual_api_key
   TWITTER_API_SECRET=your_actual_api_secret  
   TWITTER_ACCESS_TOKEN=your_actual_access_token
   TWITTER_ACCESS_TOKEN_SECRET=your_actual_access_token_secret
   GEMINI_API_KEY=your_actual_gemini_key
   BOT_USERNAME=MeghMehta160626
   NODE_ENV=production
   ```

### 5. Monitor Your Bot

- **Logs**: Check Railway logs for bot activity
- **Status**: Visit your Railway app URL to see bot status
- **Metrics**: Monitor usage in Railway dashboard

## 🔧 Troubleshooting

**Build fails?**
- Check Node.js version in `package.json` engines
- Make sure all dependencies are in `package.json`

**Bot not responding?**  
- Check environment variables are set correctly
- Monitor logs for rate limit messages
- Verify Twitter API credentials

**Rate limits?**
- This is normal! Bot waits 15 minutes between checks
- Free Twitter API has strict limits

## 💰 Cost Breakdown

- **Free tier**: 500 hours/month (bot uses ~744 hours/month)
- **Starter plan**: $5/month for unlimited usage
- **Worth it**: Much more reliable than free alternatives

## 🎯 Testing Your Deployed Bot

1. **Tweet**: "@MeghMehta160626 let's play a game!"
2. **Wait**: Bot checks every 15 minutes
3. **Check**: Look for bot reply
4. **Monitor**: Check Railway logs

## 🚀 Going Live

Once deployed:
- Bot runs 24/7 automatically
- Handles rate limits gracefully  
- Scales for mass audience
- Auto-restarts if it crashes

Your bot is now production-ready! 🎉 