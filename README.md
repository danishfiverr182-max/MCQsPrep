# 🎓 Pakistan Mock Test Platform

A comprehensive full-stack mock test platform built with **React + Vite** (frontend) and **Node.js + Express** (backend). Designed for Pakistani students preparing for competitive exams.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/danishfiverr182-max/PakPrep/tree/main/client&project-name=pakprep-frontend&root-directory=client&env=VITE_API_TARGET,VITE_ADMIN_PATH&envDescription=Frontend%20environment%20variables&envLink=https://github.com/danishfiverr182-max/PakPrep/blob/main/QUICKSTART.md)
[![Deploy to Railway](https://railway.app/button)](https://railway.app/new/template/B5drqZ?referralCode=railway)

---

## ✨ Features

### 📚 For Students
- ✅ **Free Mock Tests** - Practice unlimited free tests
- 📊 **Detailed Analytics** - Track progress and scores
- 🎯 **Performance Metrics** - Identify weak areas
- 📱 **Responsive Design** - Works on desktop & mobile
- 🌙 **Dark Mode** - Easy on the eyes

### 🛡️ For Admins
- 📝 **Create Tests** - Build custom test papers
- 📂 **Category Management** - Organize content
- 📈 **Dashboard Analytics** - View platform stats
- 👥 **User Management** - Premium subscriptions
- ⚙️ **Settings & Customization** - Control platform behavior

### 🔧 Technical Features
- 🔐 **JWT Authentication** - Secure user sessions
- 💳 **Premium Subscriptions** - Monetization support
- 📧 **Email Verification** - User validation
- 🖼️ **Image Uploads** - Cloudinary integration
- 📱 **Mobile Friendly** - Fully responsive UI
- 🌐 **REST API** - Clean, RESTful backend

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account (free tier available)
- GitHub account

### Development Setup

```bash
# Clone repository
git clone https://github.com/danishfiverr182-max/PakPrep.git
cd PakPrep

# Install dependencies
npm install
cd client && npm install && cd ..

# Create environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit .env files with your values
# See QUICKSTART.md for details

# Start development server
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

---

## 🌐 Deploy for FREE

Deploy your entire app to production with **$0 cost** using:
- **Frontend:** Vercel (unlimited free deployments)
- **Backend:** Railway ($5 free credits/month)
- **Database:** MongoDB Atlas (free tier 512MB)
- **Files:** Cloudinary (free tier 25GB/month)

### Quick Deployment

#### Option 1: Interactive Setup (Recommended)
```bash
# Windows (PowerShell)
.\deploy-setup.ps1

# macOS/Linux (Bash)
bash deploy.sh
```

#### Option 2: One-Click Deploy

1. **Backend to Railway:**
   - Click: [![Deploy to Railway](https://railway.app/button)](https://railway.app/new/template/B5drqZ?referralCode=railway)
   - Add environment variables from `server/.env.example`
   - Get your Railway URL

2. **Frontend to Vercel:**
   - Click: [![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/danishfiverr182-max/PakPrep/tree/main/client)
   - Set Root Directory: `client`
   - Add environment variables
   - Deploy!

#### Option 3: Manual Deployment
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed step-by-step instructions.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | 5-minute deployment quickstart |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Detailed deployment instructions |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Pre/post deployment checklist |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues & solutions |
| [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) | Security verification before launch |

---

## 🏗️ Architecture

### Frontend (client/)
- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS
- **State:** Context API + hooks
- **Router:** React Router v7
- **Forms:** React Hook Form + Zod validation
- **HTTP:** Axios with interceptors
- **Toast:** React Hot Toast

### Backend (server/)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT + Passport.js (Google OAuth)
- **File Upload:** Cloudinary
- **Email:** Nodemailer (Gmail SMTP)
- **Validation:** Express Validator
- **Security:** Helmet, Rate Limiting, CORS

### Mobile (mobile/)
- **Framework:** Expo (managed workflow), React Native
- **Router:** React Navigation (native-stack + bottom-tabs)
- **HTTP:** Axios (Bearer-token auth instead of the web's cookie session)
- **Status:** Part 1 foundation only — see [`mobile/README.md`](mobile/README.md)
  for setup, environment variables, and current progress.

### Database Schema
- **Users** - Student accounts with JWT
- **Admins** - Admin accounts with cookie-based sessions
- **Tests** - Test papers with multiple sections
- **TestGroups** - Organize tests by category
- **TestResults** - Store student scores
- **Categories** - Categorize tests
- **Sections** - Test sections with MCQs

---

## 🔐 Environment Variables

### Backend (`server/.env`)
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your_64_char_random_hex
JWT_EXPIRES_IN=7d
SESSION_SECRET=your_random_session_secret

# URLs
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGIN=https://your-app.vercel.app
SERVER_URL=https://your-railway-url.railway.app

# Admin
ADMIN_SECRET_PATH=/admin-x9k2
SESSION_DAYS=7

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

### Frontend (`client/.env`)
```env
# API Target (in production, use your Railway URL)
VITE_API_TARGET=http://localhost:5000/api

# Admin path (must match backend)
VITE_ADMIN_PATH=/admin-x9k2
```

---

## 🔗 API Endpoints

### Public Routes (No Auth)
- `GET /api/categories` - List all categories
- `GET /api/free-tests` - List free tests
- `GET /api/free-tests/:id` - Get test details
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Routes (JWT Auth)
- `GET /api/user/profile` - Get user profile
- `POST /api/user/tests/:id/submit` - Submit test
- `GET /api/user/results` - Get user results

### Admin Routes (Admin Auth)
- `POST /api/admin/tests` - Create test
- `PUT /api/admin/tests/:id` - Update test
- `DELETE /api/admin/tests/:id` - Delete test
- `GET /api/admin/dashboard` - Dashboard stats

---

## 📦 Project Structure

```
PakPrep/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # React Context
│   │   ├── api/            # Axios config
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                  # Express backend
│   ├── index.js            # Server entry
│   ├── config/             # Configuration files
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Helper functions
│   ├── package.json
│   └── .env                # Environment variables
│
├── mobile/                  # Expo React Native app (Part 1 foundation)
│   ├── src/                # api/, components/, screens/, navigation/, etc.
│   ├── app.config.js       # env-driven Expo config
│   ├── package.json
│   └── README.md           # setup, env vars, current progress
│
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions CI/CD
│
└── README.md               # This file
```

---

## 🛠️ Development

### Available Scripts

**Root directory:**
```bash
npm run dev              # Start dev server (client + server)
npm start               # Start production server
```

**Client directory:**
```bash
cd client
npm run dev             # Start Vite dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Lint with oxlint
```

**Server directory:**
```bash
cd server
npm run dev             # Start with file watcher
npm run start           # Start normally
npm run seed            # Seed test data
```

---

## 🧪 Testing

### Test Locally Before Deployment
```bash
# 1. Install dependencies
npm install && cd client && npm install && cd ..

# 2. Start development server
npm run dev

# 3. Test features
# - Register account
# - Login/logout
# - Take free test
# - Submit test
# - View results

# 4. Check browser console for errors
# - No CORS errors
# - No 404s
# - Network requests successful
```

---

## 🐛 Troubleshooting

### CORS Errors
- Verify `CORS_ORIGIN` in backend matches frontend URL
- Check `VITE_API_TARGET` in frontend env

### Database Not Connecting
- Verify `MONGO_URI` is correct
- Allow 0.0.0.0/0 in MongoDB Atlas IP whitelist

### Email Not Sending
- Use Gmail App Password (not regular password)
- Enable 2-Step Verification on Gmail

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more issues and solutions.

---

## 🔒 Security

Before deploying to production, review [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md):
- ✅ Strong JWT secret
- ✅ HTTPS only
- ✅ Environment variables secured
- ✅ CORS restricted
- ✅ Rate limiting enabled
- ✅ Input validation strict
- ✅ Admin routes protected

---

## 📈 Monitoring

### Track Your Deployments
- **Vercel:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **Railway:** [railway.app/dashboard](https://railway.app/dashboard)
- **MongoDB:** [cloud.mongodb.com](https://cloud.mongodb.com)

### Set Up Alerts
- Railway: Enable error notifications
- Vercel: Configure deployment alerts
- MongoDB: Set up backup alerts

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see LICENSE file for details.

---

## 📞 Support

### Need Help?
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review deployment guides
3. Check GitHub Issues
4. Create a new Issue with:
   - Error message
   - Steps to reproduce
   - Your setup (OS, Node version, etc.)

### Community
- 💬 GitHub Discussions
- 📧 Email support
- 🐦 Twitter/Social media

---

## 🎯 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Timed test mode
- [ ] Practice test suite
- [ ] Video explanations
- [ ] Mobile app (React Native)
- [ ] AI-powered question generator
- [ ] Leaderboard
- [ ] Certificate generation

---

## 🙏 Credits

Built with ❤️ for Pakistani students

### Technologies
- React & Vite
- Express.js
- MongoDB Atlas
- Cloudinary
- Tailwind CSS
- Vercel & Railway

---

## 📺 Demo

### Live Demo Links
- **Frontend:** https://pakprep.vercel.app (after deployment)
- **Backend API:** https://pakprep-backend.railway.app/api (after deployment)

### Admin Panel
- **URL:** https://pakprep.vercel.app/admin-x9k2
- **Note:** Use admin credentials after deployment

---

## 📊 Stats

- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB
- **Tests:** Fully automated deployment via GitHub Actions
- **Deployment:** Vercel (Frontend) + Railway (Backend)
- **Uptime:** 99.9% SLA with Railway & Vercel

---

<div align="center">

**[⬆ Back to Top](#-pakistan-mock-test-platform)**

Made with 💚 for education | [Deploy Now →](#-deploy-for-free)

</div>
