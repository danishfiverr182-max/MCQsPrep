# 🔐 Production Security Checklist

Before going live, verify all these security settings:

---

## **Environment Variables**

- [ ] `JWT_SECRET` is at least 32 characters (not the example value)
  ```bash
  # Generate a strong one:
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

- [ ] `SESSION_SECRET` is a random string (not hardcoded)
  ```bash
  # Generate one:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] `EMAIL_PASS` is a Gmail App Password (not your regular password)

- [ ] `GOOGLE_CLIENT_SECRET` is kept secret (not in frontend code)

- [ ] All URLs use HTTPS (not HTTP)
  ```env
  FRONTEND_URL=https://yourapp.vercel.app  # ✅
  CORS_ORIGIN=https://yourapp.vercel.app    # ✅
  SERVER_URL=https://yourapp.railway.app    # ✅
  ```

---

## **Database Security**

- [ ] MongoDB IP whitelist is set up
  - Option 1: Allow 0.0.0.0/0 (easiest for development)
  - Option 2: Whitelist Railway's IP range (more secure)

- [ ] Database credentials are strong
  - MongoDB user password is not "password" or simple
  - Username is not "admin" or "user"

- [ ] No sensitive data is logged
  - Verify `morgan` logging is safe in production
  - No passwords/tokens in logs

---

## **Frontend Security**

- [ ] No sensitive data in environment variables accessible to browser
  ```javascript
  // ❌ DON'T: VITE_ADMIN_SECRET in frontend
  // ✅ OK: VITE_ADMIN_PATH in frontend (it's just a URL path)
  ```

- [ ] CORS is restricted to your domain
  ```env
  # In backend:
  CORS_ORIGIN=https://yourapp.vercel.app  # specific domain, not *
  ```

- [ ] Content Security Policy headers are set (Helmet.js)

---

## **Authentication & Cookies**

- [ ] JWT tokens have expiration
  ```env
  JWT_EXPIRES_IN=7d  # Not infinitely long
  ```

- [ ] Cookies are secure
  - In production: `httpOnly`, `Secure`, `SameSite` flags set
  - Check your session/cookie middleware

- [ ] Password requirements enforced
  - Minimum length
  - No common passwords
  - Hashed with bcrypt

---

## **API Security**

- [ ] Rate limiting is enabled
  - Prevents brute force attacks
  - Protects from spam

- [ ] Input validation is strict
  - Use `express-validator`
  - Validate all user inputs
  - Sanitize database queries

- [ ] Admin routes are protected
  - `/admin-x9k2` path is not guessable
  - Requires valid JWT token
  - IP restriction (optional)

---

## **Third-Party Services**

### Gmail SMTP
- [ ] App Password generated (not regular password)
- [ ] 2-Step Verification enabled on Google account
- [ ] Recovery email is up-to-date

### Cloudinary
- [ ] API keys stored in backend only (not frontend)
- [ ] Upload restrictions configured (file size, type)
- [ ] Auto-delete old uploads policy (optional)

### Google OAuth (if using)
- [ ] Authorized redirect URIs include both:
  - `https://yourapp.vercel.app/auth/google/callback`
  - `https://yourapp.railway.app/auth/google/callback`
- [ ] Secrets are not exposed in frontend code

---

## **Monitoring & Maintenance**

- [ ] Set up email alerts for:
  - Railway errors
  - MongoDB connection issues
  - High CPU/memory usage

- [ ] Regular backups of MongoDB
  - Use MongoDB Atlas automated backups (free tier)
  - Or manual export weekly

- [ ] Monitor logs for suspicious activity
  - Repeated failed login attempts
  - Unusual API usage
  - Errors in production

---

## **Deployment Safety**

- [ ] `.env` files are in `.gitignore`
  ```bash
  # Verify:
  git status  # Should NOT show .env files
  ```

- [ ] Secrets are not in git history
  ```bash
  # Check (should be empty):
  git log -p | grep "MONGO_URI\|JWT_SECRET"
  ```

- [ ] Only push to `main` branch after testing
  - Use feature branches for development
  - Require code review before merging

---

## **Scalability Prep**

- [ ] Database indexes are created for common queries
- [ ] API responses are paginated (not returning huge datasets)
- [ ] Images are optimized before upload
- [ ] Static assets are cached on Vercel/CDN

---

## **Testing Before Going Live**

Run through this checklist:

1. **Authentication**
   - [ ] Register new user
   - [ ] Login works
   - [ ] Logout works
   - [ ] Password reset works (if implemented)

2. **Database**
   - [ ] Can read data (tests, categories)
   - [ ] Can write data (submissions, results)
   - [ ] Data persists after deploy

3. **Email**
   - [ ] Verification email sends
   - [ ] Email has correct links
   - [ ] Email arrives in inbox (or spam)

4. **File Upload** (if applicable)
   - [ ] Upload image
   - [ ] Image displays correctly
   - [ ] File is stored in Cloudinary

5. **Admin Functions**
   - [ ] Admin can log in
   - [ ] Admin can create tests
   - [ ] Admin can view stats
   - [ ] Admin can manage users

6. **User Experience**
   - [ ] No console errors
   - [ ] No broken images
   - [ ] Links work
   - [ ] Mobile responsive

---

## **Post-Launch**

- [ ] Monitor for errors (Vercel/Railway dashboards)
- [ ] Check user feedback
- [ ] Monitor database growth
- [ ] Plan for scaling if needed
- [ ] Keep dependencies updated

---

✅ **All checked?** You're ready to go live!
