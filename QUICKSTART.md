# 🎯 5-Minute Deployment Quick Start

## **The Goal**
Deploy your app for **FREE** in ~20-30 minutes using Vercel (frontend) + Railway (backend)

---

## **Before You Start**
1. ✅ Your GitHub repo is ready
2. ✅ MongoDB Atlas connection string is working
3. ✅ All code is committed and pushed to GitHub

---

## **Step 1: Prepare Files (2 min)**

Create these 2 files in your repo root:

**`server/.env.production`** (copy from .env and update URLs):
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
CLIENT_URL=https://your-app.vercel.app
SERVER_URL=https://your-app-prod.railway.app
# ... add other vars (see DEPLOYMENT_GUIDE.md)
```

**`client/.env.production`**:
```env
VITE_API_TARGET=https://your-app-prod.railway.app/api
VITE_ADMIN_PATH=/admin-x9k2
```

---

## **Step 2: Deploy Backend to Railway (5 min)**

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your repo
4. In **Variables**, add all vars from `server/.env.production`
5. Wait for deploy to complete
6. **Copy your Railway URL** (e.g., `https://yourapp-prod.railway.app`)

---

## **Step 3: Deploy Frontend to Vercel (5 min)**

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"New Project"** → Select your repo
3. **Build Settings:**
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables:**
   - `VITE_API_TARGET` = https://yourapp-prod.railway.app/api
   - `VITE_ADMIN_PATH` = /admin-x9k2
5. Click **Deploy**
6. **Copy your Vercel URL** (e.g., `https://yourapp.vercel.app`)

---

## **Step 4: Update Railway URLs (2 min)**

1. Go back to Railway
2. In **Variables**, update:
   - `FRONTEND_URL` = https://yourapp.vercel.app
   - `CORS_ORIGIN` = https://yourapp.vercel.app
   - `CLIENT_URL` = https://yourapp.vercel.app
3. Railway auto-redeploys

---

## **Step 5: Test Your App (5 min)**

✅ Visit: https://yourapp.vercel.app
✅ Check Network tab - no CORS errors?
✅ Can you log in?
✅ Can you take a test?

**Done! 🎉**

---

## **If Something Breaks**

| Error | Solution |
|-------|----------|
| **CORS error** | Double-check `CORS_ORIGIN` in Railway matches your Vercel URL exactly |
| **DB not connecting** | Verify `MONGO_URI` in Railway (allow 0.0.0.0/0 in MongoDB Atlas IP whitelist) |
| **Vercel build fails** | Check build logs in Vercel dashboard |
| **Railway says no routes** | Make sure `server/index.js` starts an Express server on `process.env.PORT` |

---

## **Cost: $0** ✅

- Vercel: Unlimited free
- Railway: $5 free credits (more than enough)
- MongoDB: Free tier
- **Total: FREE**

---

**📚 Need more help?** See `DEPLOYMENT_GUIDE.md` and `DEPLOYMENT_CHECKLIST.md`
