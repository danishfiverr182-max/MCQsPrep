# GitHub Actions Auto-Deployment Setup

This guide explains how to set up automatic deployments using GitHub Actions.

## ✨ What It Does

When you push to `main` branch, GitHub automatically:
1. Deploys backend to Railway
2. Deploys frontend to Vercel

---

## 🔑 Step 1: Create Deployment Tokens

### Railway Token
1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Click your profile → Account
3. Scroll to "API Tokens"
4. Click "New Token"
5. Give it a name (e.g., "GitHub Actions")
6. Copy the token (save it temporarily)

### Railway Project ID
1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Click on your project
3. Copy the **Project ID** from the URL bar or settings

### Vercel Token
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name: "GitHub Actions"
4. Expiration: 90 days
5. Copy the token (save it temporarily)

### Vercel Project ID & Org ID
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to Settings → General
4. Copy **Project ID** and **Org ID** (save them temporarily)

---

## 🔐 Step 2: Add GitHub Secrets

1. Go to your GitHub repo
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret:

| Secret Name | Value |
|-------------|-------|
| `RAILWAY_TOKEN` | Token from Railway |
| `RAILWAY_PROJECT_ID` | Project ID from Railway |
| `VERCEL_TOKEN` | Token from Vercel |
| `VERCEL_PROJECT_ID` | Project ID from Vercel |
| `VERCEL_ORG_ID` | Org ID from Vercel |

---

## 🚀 Step 3: Test the Deployment

1. Make a small change to your code (e.g., update README)
2. Commit and push: `git push origin main`
3. Go to GitHub repo → Actions tab
4. Watch the workflow run
5. Check Railway and Vercel dashboards for the deployment

---

## ✅ Workflow Steps

The GitHub Actions workflow does this:

### For Backend (Railway):
```yaml
- Install Railway CLI
- Link to your Railway project
- Deploy latest code
```

### For Frontend (Vercel):
```yaml
- Install Vercel CLI
- Deploy to production
- Get new deployment URL
```

---

## 🔄 Manual Trigger

You can also trigger deployments manually without pushing:

1. Go to GitHub repo → Actions
2. Click "Deploy to Vercel & Railway"
3. Click "Run workflow"
4. Select branch (main)
5. Click "Run workflow"

---

## 📊 Monitor Deployments

### View Workflow Status
- GitHub: Repo → Actions tab → Click workflow run

### View Logs
- Click the workflow run
- Click "Deploy Backend" or "Deploy Frontend" job
- Expand steps to see logs

### Common Issues

❌ **"Cannot find Railway CLI"**
- Make sure Railway token is correct
- Check Railway Project ID

❌ **"Vercel deployment failed"**
- Check Vercel token is valid
- Verify Project ID and Org ID
- Check environment variables in Vercel dashboard

❌ **"Build failed"**
- Check build logs in workflow
- Make sure `npm install` runs successfully
- Verify build command is correct

---

## 🛠️ Customizing the Workflow

Edit `.github/workflows/deploy.yml` to:
- Add more deployment targets
- Run tests before deploying
- Send notifications on success/failure
- Deploy to different branches (staging, production)

---

## 📚 Example Workflow Customizations

### Add Slack Notification
```yaml
- name: Notify Slack
  if: always()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
      -d '{"text":"Deployment Complete!"}'
```

### Run Tests Before Deploy
```yaml
- name: Run Tests
  run: npm test
  
- name: Build
  run: npm run build
```

### Deploy to Multiple Branches
```yaml
on:
  push:
    branches: [main, staging, develop]
```

---

## 🔒 Security Best Practices

✅ **DO:**
- Use GitHub Secrets for all tokens
- Use short-lived tokens (90 days)
- Rotate tokens regularly
- Use minimal permissions needed

❌ **DON'T:**
- Hardcode tokens in YAML
- Commit `.env` files
- Share tokens in chat/email
- Use personal access tokens

---

## 📞 Troubleshooting

### Workflow won't run
- Check `.github/workflows/deploy.yml` exists
- Verify secrets are added
- Check branch name is `main`

### Deployment fails
- Check logs in Actions tab
- Verify tokens haven't expired
- Check Railway/Vercel dashboards for capacity

### Want to disable auto-deploy?
- Go to Settings → Actions
- Disable "Allow all actions"
- Or remove `.github/workflows/deploy.yml`

---

## 🎯 Next Steps

1. ✅ Add GitHub Secrets (see Step 2)
2. ✅ Test workflow (push a change)
3. ✅ Monitor first deployment
4. ✅ Celebrate! 🎉

---

**Need help?** Check GitHub Actions docs or this repo's TROUBLESHOOTING.md
