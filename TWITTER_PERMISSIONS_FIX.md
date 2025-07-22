# 🔧 Fix Twitter 403 Permission Error

## ❌ **The Problem**
Your bot gets this error when trying to post:
```
❌ Failed to post reply: Request failed with code 403
🚫 Permission denied. Check your Twitter app permissions.
```

## ✅ **The Solution**

### **Step 1: Update Twitter App Permissions**

1. **Go to**: [developer.twitter.com/en/portal/dashboard](https://developer.twitter.com/en/portal/dashboard)
2. **Sign in** with your Twitter account
3. **Select your app** (the one you created for the bot)

### **Step 2: Configure App Settings**

1. **Click on your app name**
2. **Go to "Settings" tab**
3. **Scroll to "User authentication settings"**
4. **Click "Edit"** (or "Set up" if not configured)

### **Step 3: Set Required Permissions**

Configure these settings:

**App permissions**: 
- ✅ **Read and write** (NOT "Read only")

**Type of App**: 
- ✅ **Web App, Automated App or Bot**

**App info**:
- **Callback URLs**: `http://localhost:3000`
- **Website URL**: `https://rosebud.ai`

**Click "Save"**

### **Step 4: Regenerate Tokens (CRITICAL!)**

1. **Go to "Keys and tokens" tab**
2. **Under "Access Token and Secret"**
3. **Click "Regenerate"** (this is important!)
4. **Copy the new tokens**

### **Step 5: Update Your .env File**

Replace the old tokens in your `.env` file:

```env
TWITTER_ACCESS_TOKEN=your_new_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_new_access_token_secret_here
```

**Important**: Keep the API Key and Secret the same, only regenerate Access Token and Secret.

### **Step 6: Test the Fix**

```bash
# Test environment
npm run test-env

# Try manual reply
node scripts/manual-reply.js
```

## 🎯 **Expected Results**

After fixing permissions, you should see:
```
✅ Reply posted successfully!
🆔 Reply ID: 1234567890
🔗 Reply URL: https://twitter.com/MeghMehta160626/status/1234567890
💾 Saved to persistence system
```

## 🚨 **Common Issues**

**Still getting 403?**
- Make sure you **regenerated** the Access Token (not just API keys)
- Wait 5-10 minutes after changing permissions
- Check that your app is **not suspended**

**"Invalid consumer tokens"?**
- Double-check your API Key and Secret
- Make sure they're from the **same app**

**Rate limit errors?**
- This is normal, wait 15 minutes and try again

## 🎮 **New Bot Behavior**

After fixing permissions, your bot will now:

### **Old Style (Questions):**
```
🎮 GAME TIME! What's your favorite space game? Reply with your answer! 🎯
```

### **New Style (Direct Prompts):**
```
Build a space exploration puzzle game where players solve cosmic riddles to unlock new star systems and uncover ancient alien technology. ✨

🎮 rosebud.ai
```

The new style gives **direct game building instructions** instead of asking questions, which is perfect for Rosebud AI integration! 🚀 