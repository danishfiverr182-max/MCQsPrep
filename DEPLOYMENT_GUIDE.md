# 🚀 Free Deployment Guide

Deploy your Mock Test Platform completely free using: **Vercel** (Frontend) + **Railway** (Backend) + **MongoDB Atlas** (Database)

---

## **Quick Overview**

| Component | Service | Cost | Free Tier |
|-----------|---------|------|-----------|
| **Frontend** | Vercel | Free | ✅ Yes (unlimited deployments) |
| **Backend** | Railway | Free | ✅ Yes ($5 free credits/month) |
| **Database** | MongoDB Atlas | Free | ✅ Yes (512MB + 3 shared clusters) |
| **File Upload** | Cloudinary | Free | ✅ Yes (25GB/month) |
| **Email** | Gmail SMTP | Free | ✅ Yes (included with .env) |

---

## **Part 1: Prepare the Code**

### 1a. Create a `.env.production` for the backend

Create `server/.env.production`:

```env
PORT=5000
NODE_ENV=production

# MongoDB Atlas (your existing connection)
MONGO_URI=mongodb+srv://danishfiverr182_db_user:94UYTOoQ5AuIkCQF@cluster0.lditqsx.mongodb.net/mock-test-platform?retryWrites=true&w=majority&appName=Cluster0

# JWT
JWT_SECRET=6b7098bd6fadd54be0726a2797bc3bc53929431675a0fbdd4c4138fccabaf5a7
JWT_EXPIRES_IN=7d

# Update these with your actual deployed URLs
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
CLIENT_URL=https://your-app.vercel.app

# Admin Secret Path
ADMIN_SECRET_PATH=/admin-x9k2
SESSION_DAYS=7

# Google OAuth (from your .env file if using OAuth)
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
SERVER_URL=https://your-backend-railway.railway.app
SESSION_SECRET=7e1a3c9f2b6d4e8a0c5f7b9d3e1a6c8f0b2d4e6a8c0f2b4d6e8a0c2f4b6d8e0a

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
```

> **Note:** Save these values temporarily—you'll need them when deploying to Railway.

### 1b. Create environment file for Vercel

Create `client/.env.production`:

```env
VITE_API_TARGET=https://your-backend-railway.railway.app/api
VITE_ADMIN_PATH=/admin-x9k2
```

---

## **Part 2: Deploy Backend to Railway**

Railway has a **generous free tier** ($5 free credits/month) that's enough for this project.

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (easiest)
3. Create a new project

### Step 2: Deploy from GitHub
1. Click **"Create New"** → **"Project from Repo"**
2. Select your GitHub repository
3. Railway will auto-detect it's a Node.js app

### Step 3: Add MongoDB Environment Variables
In Railway **Variables** section, add:
- `MONGO_URI` = your MongoDB connection string
- `JWT_SECRET` = your JWT secret
- `FRONTEND_URL` = (you'll update this after Vercel deployment)
- `CORS_ORIGIN` = (you'll update this after Vercel deployment)
- `CLIENT_URL` = (you'll update this after Vercel deployment)
- `GOOGLE_CLIENT_ID` = your Google OAuth ID (from Google Cloud Console)
- `GOOGLE_CLIENT_SECRET` = your Google OAuth secret (from Google Cloud Console)
- `EMAIL_USER` = your Gmail
- `EMAIL_PASS` = your Gmail app password
- `SESSION_SECRET` = generate random string
- `ADMIN_SECRET_PATH` = /admin-x9k2
- `SERVER_URL` = (Railway will give you this after first deploy)
- `EMAIL_HOST` = smtp.gmail.com
- `EMAIL_PORT` = 587
- `SESSION_DAYS` = 7
- `NODE_ENV` = production
- `JWT_EXPIRES_IN` = 7d

### Step 4: Deploy
Railway auto-deploys when you push to GitHub. Once deployed:
- Copy your **Railway URL** (looks like `https://yourapp-prod.railway.app`)
- Update all the `*_URL` variables with this URL

---

## **Part 3: Deploy Frontend to Vercel**

Vercel is the easiest and **completely free** for unlimited projects.

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository

### Step 2: Configure Build Settings
When Vercel asks for build settings:
- **Root Directory:** `client`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 3: Add Environment Variables
In Vercel **Environment Variables**:
- `VITE_API_TARGET` = https://yourapp-prod.railway.app/api
- `VITE_ADMIN_PATH` = /admin-x9k2

### Step 4: Deploy
Click **Deploy**. Vercel gives you:
- A free URL like `https://your-app.vercel.app`
- Auto-deploys on every git push
- Free SSL certificate

### Step 5: Update Backend URLs
Go back to Railway and update:
- `FRONTEND_URL` = https://your-app.vercel.app
- `CORS_ORIGIN` = https://your-app.vercel.app
- `CLIENT_URL` = https://your-app.vercel.app

---

## **Part 4: Custom Domain (Optional, Free)**

### For Free Subdomain:
1. **Railway:** Go to Settings → Domain → Request free `.railway.app` subdomain
2. **Vercel:** Go to Settings → Domains → Add custom domain (requires DNS setup)

Or use the free Railway/Vercel domains as-is.

---

## **Part 5: Gmail App Password Setup**

For email to work in production:

1. Enable 2-Factor Authentication on your Gmail account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate an **App Password** for "Mail" and "Windows"
4. Use that 16-character password as `EMAIL_PASS` in Railway variables

---

## **Part 6: Verify Deployment**

✅ Test your live app:
- Frontend: https://your-app.vercel.app
- API: https://yourapp-prod.railway.app/api/ping
- Admin Login: https://your-app.vercel.app (look for admin login path)

---

## **Cost Summary**

| Service | Monthly Cost | Free Tier |
|---------|-------------|-----------|
| Vercel Frontend | $0 | Unlimited |
| Railway Backend | $0 (in free tier) | $5 free credits |
| MongoDB Atlas | $0 | 512MB storage |
| Cloudinary | $0 | 25GB/month |
| **Total** | **$0** | ✅ Completely FREE |

---

## **Troubleshooting**

### CORS errors?
- Make sure `CORS_ORIGIN` in Railway matches your Vercel URL exactly
- Include `https://` at the beginning

### Database not connecting?
- Test your `MONGO_URI` at [MongoDB Atlas](https://cloud.mongodb.com)
- Ensure IP whitelist includes Railway's IPs (or allow all: 0.0.0.0/0)

### Emails not sending?
- Verify Gmail app password (not your regular password)
- Check spam folder

### Railway dyno sleeping?
- Railway free tier doesn't auto-sleep, but stays active if you keep the app warm

---

## **Next Steps**

1. Follow **Part 2** to deploy backend to Railway
2. Follow **Part 3** to deploy frontend to Vercel
3. Test everything works
4. Share your live URL! 🎉

---

**Questions?** Check the [Vercel Docs](https://vercel.com/docs), [Railway Docs](https://docs.railway.app), or [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
