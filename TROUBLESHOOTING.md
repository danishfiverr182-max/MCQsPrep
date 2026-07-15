# 🔧 Deployment Troubleshooting Guide

## **Common Issues & Solutions**

---

### **1. CORS Error: "Access to XMLHttpRequest blocked"**

**Symptom:** Frontend can't reach backend API

**Causes & Fixes:**

❌ **Wrong URL in `VITE_API_TARGET`**
```env
# ❌ WRONG (missing /api)
VITE_API_TARGET=https://yourapp-prod.railway.app

# ✅ CORRECT
VITE_API_TARGET=https://yourapp-prod.railway.app/api
```

❌ **`CORS_ORIGIN` doesn't match Vercel URL**
```env
# In Railway Variables:
# Make sure this EXACTLY matches your Vercel URL
CORS_ORIGIN=https://yourapp.vercel.app
```

❌ **Using `http://` instead of `https://`**
```env
# ❌ WRONG
CORS_ORIGIN=http://yourapp.vercel.app

# ✅ CORRECT
CORS_ORIGIN=https://yourapp.vercel.app
```

**Fix:**
1. Update Railway variables to match your exact Vercel URL
2. Redeploy Railway
3. Clear browser cache (Cmd+Shift+R)

---

### **2. MongoDB Connection Fails**

**Symptom:** "MongoServerError: connect ECONNREFUSED"

**Causes & Fixes:**

❌ **IP not whitelisted in MongoDB Atlas**
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Click "Network Access" (left sidebar)
3. Add Railway IPs OR just allow 0.0.0.0/0 (accept the warning)

❌ **Wrong `MONGO_URI`**
1. Copy it again from MongoDB Atlas
2. Verify password has no special characters OR is URL-encoded
3. Make sure database name is correct

❌ **Connection string has typo**
```env
# Test it locally first:
# In your terminal: echo "your_connection_string" | grep "mongodb"
```

**Fix:**
1. Allow 0.0.0.0/0 in MongoDB Atlas Network Access
2. Test `MONGO_URI` locally: `node -e "require('mongoose').connect(process.env.MONGO_URI)"`

---

### **3. Vercel Build Fails**

**Symptom:** "Build failed" in Vercel dashboard

**Causes & Fixes:**

❌ **Missing root directory**
1. Go to Vercel Project Settings
2. Under "Root Directory": set to `client`
3. Redeploy

❌ **Wrong build command**
```json
// In vercel.json
{
  "buildCommand": "cd client && npm run build"
}
```

❌ **npm install fails**
```
// Check that client/package.json exists
// Run locally: cd client && npm install
```

**Fix:**
1. Check Vercel build logs (click "Deployments" → "View" on failed deploy)
2. Make sure `client/` folder exists and has `package.json`
3. Try deploying again (Vercel → Settings → Deployments → Redeploy)

---

### **4. Railway Deployment Stays Pending**

**Symptom:** Railway shows "Building..." forever

**Causes & Fixes:**

❌ **Wrong start command**
- Make sure `server/index.js` exists and starts Express server
- Check that it listens on `process.env.PORT || 5000`

❌ **Missing environment variables**
- Check Railway Variables section for all required vars
- Look at Deploy Logs (Railway Dashboard → Deployments → Logs)

**Fix:**
1. Click Deployments → View latest
2. Check the logs (Logs tab)
3. Add missing env vars
4. Redeploy (Railway Dashboard → Deployments → Redeploy)

---

### **5. "Email Not Sending" or "SMTP Error"**

**Symptom:** Registration emails don't arrive

**Causes & Fixes:**

❌ **Using regular Gmail password instead of App Password**
```env
# ❌ WRONG
EMAIL_PASS=your_gmail_password

# ✅ CORRECT (16-char app password)
EMAIL_PASS=abcd efgh ijkl mnop
```

❌ **Gmail account doesn't have 2FA enabled**
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"
3. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Generate new App Password
5. Use it in Railway `EMAIL_PASS`

❌ **Wrong SMTP settings**
```env
# These must be exactly:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

**Fix:**
1. Generate new Gmail App Password
2. Update `EMAIL_PASS` in Railway Variables
3. Test: Try registering new account
4. Check Gmail spam folder for test email

---

### **6. "Cannot GET /" or Page Not Found**

**Symptom:** Frontend loads but routes show 404

**Causes & Fixes:**

❌ **Vercel Output Directory is wrong**
1. Go to Vercel Settings
2. Check "Output Directory" is set to `dist` (not `build`)

❌ **Vite build didn't run**
1. Check Vercel build logs
2. Run locally: `cd client && npm run build`
3. Verify `client/dist` folder exists

**Fix:**
1. Vercel Settings → "Output Directory" = `dist`
2. Redeploy
3. Clear cache (Ctrl+Shift+R)

---

### **7. "ERR_SSL_PROTOCOL_ERROR" or "Not Secure"**

**Symptom:** Browser warns "Not Secure"

**Explanation:**
- Vercel provides free HTTPS automatically ✅
- No action needed!
- If you see this after 5 minutes, refresh the page

---

### **8. Railway Costs More Than Expected**

**Symptom:** Railway shows high usage

**Causes & Fixes:**

✅ **Free tier limits:**
- $5 free credits per month
- Usage-based (CPU, RAM, storage)
- For this app: should be ~$1-2/month (plenty of free credit)

⚠️ **If over budget:**
1. Check Railway Dashboard → Usage
2. Scale down resources if needed (Settings → Compute)
3. Or upgrade to paid plan

---

### **9. "Timeout" errors on test submission**

**Symptom:** Tests freeze when submitting

**Causes & Fixes:**

❌ **Backend API is slow**
- Railway might be "cold starting" (first request is slow)
- Subsequent requests are faster

❌ **MongoDB query is slow**
- Check Railway logs for slow queries
- Optimize database indexes

**Fix:**
1. Check Railway Logs for errors
2. Keep app "warm" by visiting it daily
3. Consider upgrading Railway plan if issue persists

---

### **10. "403 Forbidden" on Admin Login**

**Symptom:** Admin login redirects to home

**Causes & Fixes:**

❌ **`ADMIN_SECRET_PATH` doesn't match**
```env
# In Railway AND client .env.production:
VITE_ADMIN_PATH=/admin-x9k2  # Must be same as ADMIN_SECRET_PATH in backend
```

❌ **Admin user doesn't exist**
1. Seed admin: Run `node seedAdmin.js` in your local server/
2. Copy MongoDB database to Railway (manual migration needed)

**Fix:**
1. Verify `ADMIN_SECRET_PATH` matches on both backend and frontend
2. Manually create admin user in MongoDB Atlas (use MongoDB Compass or Atlas UI)

---

## **Debugging Steps**

1. **Check Logs**
   - Vercel: Dashboard → Deployments → Click failing build → View logs
   - Railway: Dashboard → Deployments → View latest → Logs tab

2. **Test Locally First**
   - Run: `npm run dev` in root (client + server)
   - Verify features work locally before pushing

3. **Check Environment Variables**
   - Railway: Project → Variables (all there?)
   - Vercel: Project Settings → Environment Variables (all there?)

4. **Browser DevTools**
   - Network tab: Check API responses
   - Console: Check for JavaScript errors
   - Application → Cookies: Verify auth cookies

5. **Test Single Endpoint**
   ```bash
   # Test if backend is running
   curl https://yourapp-prod.railway.app/api/ping
   
   # Should return success
   ```

---

## **Getting Help**

💬 **Community:**
- [Railway Community](https://railway.app/community)
- [Vercel Support](https://vercel.com/support)
- [MongoDB Atlas Support](https://www.mongodb.com/support)

📚 **Documentation:**
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Vite Docs](https://vitejs.dev)

🐛 **Reporting Issues:**
1. Check logs (Vercel/Railway)
2. Test locally to confirm it's not a local issue
3. Provide: Error message, logs, what you tried

---

**Still stuck?** Check `DEPLOYMENT_GUIDE.md` or revisit `QUICKSTART.md`
