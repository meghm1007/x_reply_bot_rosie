# 🌐 Production Hosting Guide

## 🏆 **Recommended Options (Ranked)**

### **1. Railway.app (BEST for beginners)**
- **Free tier**: 500 hours/month
- **Paid**: $5/month unlimited
- **Pros**: Auto-deploy, great UX, reliable
- **Cons**: Limited free hours

**Setup Steps:**
1. Push code to GitHub
2. Connect Railway to GitHub
3. Add environment variables
4. Auto-deploy!

### **2. Render.com (Great alternative)**
- **Free tier**: Available with limitations
- **Paid**: $7/month for always-on
- **Pros**: Simple, reliable, good free tier
- **Cons**: Can be slower to start

### **3. DigitalOcean App Platform**
- **Free tier**: $0 for static sites, $5/month for apps
- **Pros**: Professional, scalable
- **Cons**: Slightly more complex setup

### **4. Heroku (Premium option)**
- **No free tier** (starts at $7/month)
- **Pros**: Industry standard, very reliable
- **Cons**: More expensive, no free option

### **5. VPS Options (Advanced)**
- **DigitalOcean Droplet**: $4/month
- **Linode**: $5/month
- **Vultr**: $2.50/month
- **Pros**: Full control, cheapest long-term
- **Cons**: Requires server management

## 🚀 **Railway.app Deployment (RECOMMENDED)**

### **Step 1: Prepare Code**
```bash
# Make sure everything works locally
npm run test-env
npm start

# Commit and push
git add .
git commit -m "Production ready with enhanced context understanding"
git push origin main
```

### **Step 2: Deploy to Railway**
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `rosebud_x_bot` repository
5. Railway automatically detects Node.js and deploys

### **Step 3: Add Environment Variables**
In Railway dashboard:
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_TOKEN_SECRET`
- `GEMINI_API_KEY`
- `BOT_USERNAME`
- `NODE_ENV=production`

### **Step 4: Monitor**
- Check deployment logs
- Visit the generated URL to see bot status
- Monitor for mentions and replies

## 🔧 **Alternative: DigitalOcean Droplet Setup**

For complete control and lowest cost:

### **Create Droplet**
```bash
# 1. Create $4/month droplet (Ubuntu 22.04)
# 2. SSH into server
ssh root@your-server-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PM2 for process management
npm install -g pm2

# 5. Clone your repository
git clone https://github.com/yourusername/rosebud_x_bot.git
cd rosebud_x_bot

# 6. Install dependencies
npm install

# 7. Create .env file
nano .env
# (Add your environment variables)

# 8. Start with PM2
pm2 start src/bot.js --name "rosebud-bot"
pm2 save
pm2 startup
```

### **Auto-restart on reboot**
```bash
# PM2 will automatically restart your bot if server reboots
pm2 startup
# Follow the instructions it gives you
```

## 📊 **Cost Comparison**

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| Railway | 500 hrs/month | $5/month | Beginners |
| Render | Limited uptime | $7/month | Simple deploy |
| DigitalOcean | None | $4/month VPS | Control |
| Heroku | None | $7/month | Enterprise |

## 🎯 **For Your Bot (5 mentions/hour)**

**Railway is perfect because:**
- ✅ Auto-deploys when you push code
- ✅ Handles environment variables easily
- ✅ Built-in monitoring and logs
- ✅ Zero server management
- ✅ $5/month is very reasonable

## 🚨 **Production Checklist**

Before going live:
- ✅ Fix Twitter permissions (Read and Write)
- ✅ Test context understanding locally
- ✅ Verify Rosebud AI links work
- ✅ Test with real mentions
- ✅ Set up monitoring
- ✅ Have backup plan (second platform ready)

## 🎮 **Expected Production Behavior**

Once live, your bot will:
1. **Check mentions every 15 minutes**
2. **Read full thread context**
3. **Generate witty, contextual game prompts**
4. **Include working Rosebud AI links**
5. **Handle 5 mentions/hour easily**
6. **Recover gracefully from rate limits**

**Example production flow:**
```
User posts: "Mondays are the worst!"
Someone tags: "@MeghMehta160626 make a game"
Bot replies: "Build a Monday-survival game where you dodge alarm clocks and collect coffee to make it to Friday! ☕

🎮 Build this game: https://rosebud.ai?prompt=..."
```

## 🔗 **Quick Deploy Commands**

```bash
# Railway (easiest)
# Just push to GitHub and connect to Railway

# Or VPS (cheapest)
ssh root@your-server
git clone your-repo
cd rosebud_x_bot
npm install
pm2 start src/bot.js --name rosebud-bot
```

Your bot is now **production-ready** with enhanced context understanding! 🚀✨ 