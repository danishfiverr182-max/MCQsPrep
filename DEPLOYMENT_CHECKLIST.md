# ✅ Deployment Checklist

## **Pre-Deployment (Do This First)**

### Backend (server/)
- [ ] Update `server/.env.production` with your production values
- [ ] Update MongoDB IP whitelist in Atlas to allow Railway IPs (or 0.0.0.0/0)
- [ ] Generate Gmail App Password and save it
- [ ] Verify all required env vars are set (see DEPLOYMENT_GUIDE.md)
- [ ] Test locally: `npm run build` in server folder

### Frontend (client/)
- [ ] Create `client/.env.production` with your backend API URL
- [ ] Test build locally: `cd client && npm run build`
- [ ] Verify `dist` folder is created with no build errors

### Git
- [ ] Commit and push all changes to GitHub
- [ ] Ensure `.env` files are in `.gitignore` (don't commit secrets!)

---

## **Deployment Steps**

### 1️⃣ **Deploy Backend to Railway**
- [ ] Create Railway account at railway.app
- [ ] Connect GitHub repo
- [ ] Select `server` as root directory (if needed)
- [ ] Add all environment variables from `server/.env.production`
- [ ] Trigger deploy (automatic on push or manual)
- [ ] Copy Railway URL once deployed
- [ ] Test backend is running: `https://your-railway-url/api/ping`

### 2️⃣ **Deploy Frontend to Vercel**
- [ ] Create Vercel account at vercel.com
- [ ] Import GitHub repo
- [ ] Set root directory to `client`
- [ ] Add environment variables:
  - `VITE_API_TARGET=https://your-railway-url/api`
  - `VITE_ADMIN_PATH=/admin-x9k2`
- [ ] Deploy
- [ ] Copy Vercel URL

### 3️⃣ **Update URLs in Railway**
- [ ] Go back to Railway Variables
- [ ] Update all URL variables to point to your Vercel domain:
  - `FRONTEND_URL=https://your-vercel-app.vercel.app`
  - `CORS_ORIGIN=https://your-vercel-app.vercel.app`
  - `CLIENT_URL=https://your-vercel-app.vercel.app`
  - `SERVER_URL=https://your-railway-url.railway.app`
- [ ] Redeploy Railway with new variables

---

## **Verification**

- [ ] Frontend loads at https://your-vercel-app.vercel.app
- [ ] Can navigate pages without CORS errors
- [ ] Login/Register works (check API calls in DevTools Network tab)
- [ ] Free tests load and submit correctly
- [ ] Admin login works at `/admin-x9k2` path
- [ ] Emails send (check spam folder)

---

## **Post-Deployment**

- [ ] Set up custom domain (optional)
- [ ] Monitor Railway dashboard for usage
- [ ] Monitor Vercel analytics
- [ ] Set up email alerts if costs spike
- [ ] Regular backups of MongoDB

---

## **Important Notes**

⚠️ **Do NOT commit `.env` files to GitHub!**
- They should be in `.gitignore`
- Only commit `.env.example`
- Add secrets via service dashboards only

⚠️ **MongoDB IP Whitelist**
- Railway IPs change, so allow 0.0.0.0/0 OR
- Use MongoDB Atlas IP whitelist with automatic detection

⚠️ **Gmail App Password**
- Use generated app password, NOT your regular Gmail password
- Keep it secret, never commit it

---

## **Estimated Time**

- Backend deployment: 5-10 minutes
- Frontend deployment: 5-10 minutes
- Testing: 5-10 minutes
- **Total: 20-30 minutes**

---

## **Quick Links**

- 🚂 [Railway Dashboard](https://railway.app)
- ▲ [Vercel Dashboard](https://vercel.com)
- 🍃 [MongoDB Atlas](https://cloud.mongodb.com)
- 📧 [Gmail App Passwords](https://myaccount.google.com/apppasswords)

