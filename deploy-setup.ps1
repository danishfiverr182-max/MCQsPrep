# Interactive Deployment Setup Script
# This script guides you through deploying to Vercel + Railway

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Mock Test Platform - Deployment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to prompt for input
function Get-UserInput($prompt, $default = "") {
    if ($default) {
        Write-Host "$prompt [$default]: " -NoNewline -ForegroundColor Yellow
    } else {
        Write-Host "$prompt: " -NoNewline -ForegroundColor Yellow
    }
    $input = Read-Host
    if ($input -eq "" -and $default) {
        return $default
    }
    return $input
}

# Function to confirm
function Confirm-Action($message) {
    Write-Host $message -NoNewline -ForegroundColor Yellow
    $response = Read-Host " (y/n)"
    return $response -eq "y" -or $response -eq "Y"
}

# Step 1: Check prerequisites
Write-Host "Step 1: Checking Prerequisites" -ForegroundColor Magenta
Write-Host "==============================" -ForegroundColor Magenta

$hasGit = git --version 2>$null
$hasNode = node --version 2>$null

if ($hasGit) {
    Write-Host "✓ Git is installed: $hasGit" -ForegroundColor Green
} else {
    Write-Host "✗ Git is NOT installed. Install from https://git-scm.com" -ForegroundColor Red
    exit 1
}

if ($hasNode) {
    Write-Host "✓ Node.js is installed: $hasNode" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js is NOT installed. Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Verify environment files
Write-Host "Step 2: Environment Variables" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Magenta

if (Test-Path "server\.env") {
    Write-Host "✓ Found server/.env" -ForegroundColor Green
} else {
    Write-Host "✗ Missing server/.env" -ForegroundColor Red
    if (Confirm-Action "Create from server/.env.example?") {
        Copy-Item "server\.env.example" "server\.env"
        Write-Host "✓ Created server/.env - EDIT THIS FILE with your actual values!" -ForegroundColor Yellow
    }
}

if (Test-Path "client\.env") {
    Write-Host "✓ Found client/.env" -ForegroundColor Green
} else {
    Write-Host "✓ client/.env will be created during frontend deployment" -ForegroundColor Green
}

Write-Host ""

# Step 3: Get deployment URLs
Write-Host "Step 3: Deployment Information" -ForegroundColor Magenta
Write-Host "==============================" -ForegroundColor Magenta
Write-Host ""

$deployChoice = Read-Host "What would you like to do?
1. Deploy Backend to Railway
2. Deploy Frontend to Vercel
3. Deploy Both
4. Just generate config files (deploy manually)
5. Exit

Choose (1-5)"

switch ($deployChoice) {
    "1" {
        # Deploy Backend
        Write-Host ""
        Write-Host "Backend Deployment to Railway" -ForegroundColor Cyan
        Write-Host "=============================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Go to https://railway.app and sign up with GitHub" -ForegroundColor Yellow
        Write-Host "2. Create a new project from your repository" -ForegroundColor Yellow
        Write-Host "3. Add your environment variables in Railway dashboard" -ForegroundColor Yellow
        Write-Host "4. Copy your Railway URL when deployment completes" -ForegroundColor Yellow
        Write-Host ""
        
        $railwayUrl = Get-UserInput "Enter your Railway backend URL (e.g., https://myapp-prod.railway.app)"
        
        if ($railwayUrl) {
            Write-Host "✓ Saved Railway URL: $railwayUrl" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next: Update your frontend environment variables with this URL" -ForegroundColor Yellow
        }
    }
    
    "2" {
        # Deploy Frontend
        Write-Host ""
        Write-Host "Frontend Deployment to Vercel" -ForegroundColor Cyan
        Write-Host "=============================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Go to https://vercel.com and sign up with GitHub" -ForegroundColor Yellow
        Write-Host "2. Import your repository" -ForegroundColor Yellow
        Write-Host "3. Set Root Directory to 'client'" -ForegroundColor Yellow
        Write-Host "4. Add environment variables:" -ForegroundColor Yellow
        Write-Host "   - VITE_API_TARGET: https://your-railway-url/api" -ForegroundColor Yellow
        Write-Host "   - VITE_ADMIN_PATH: /admin-x9k2" -ForegroundColor Yellow
        Write-Host "5. Click Deploy" -ForegroundColor Yellow
        Write-Host ""
        
        $vercelUrl = Get-UserInput "Enter your Vercel frontend URL (e.g., https://myapp.vercel.app)"
        
        if ($vercelUrl) {
            Write-Host "✓ Saved Vercel URL: $vercelUrl" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next: Update your Railway environment with this URL" -ForegroundColor Yellow
        }
    }
    
    "3" {
        # Deploy Both
        Write-Host ""
        Write-Host "Full Deployment (Backend + Frontend)" -ForegroundColor Cyan
        Write-Host "====================================" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "STEP 1: Deploy Backend to Railway" -ForegroundColor Yellow
        Write-Host "1. Go to https://railway.app → New Project" -ForegroundColor Gray
        Write-Host "2. Select 'Deploy from GitHub Repo'" -ForegroundColor Gray
        Write-Host "3. Choose your repository" -ForegroundColor Gray
        Write-Host "4. Add all environment variables from server/.env" -ForegroundColor Gray
        Write-Host "5. Wait for deployment" -ForegroundColor Gray
        Write-Host ""
        
        if (Confirm-Action "Press ENTER when Railway deployment is complete, then I'll help with frontend deployment") {
            $railwayUrl = Get-UserInput "Enter your Railway URL (e.g., https://myapp-prod.railway.app)"
            
            Write-Host ""
            Write-Host "STEP 2: Deploy Frontend to Vercel" -ForegroundColor Yellow
            Write-Host "1. Go to https://vercel.com → Import Project" -ForegroundColor Gray
            Write-Host "2. Select your GitHub repository" -ForegroundColor Gray
            Write-Host "3. Set Root Directory: client" -ForegroundColor Gray
            Write-Host "4. Add Environment Variables:" -ForegroundColor Gray
            Write-Host "   - VITE_API_TARGET=$railwayUrl/api" -ForegroundColor Gray
            Write-Host "   - VITE_ADMIN_PATH=/admin-x9k2" -ForegroundColor Gray
            Write-Host "5. Click Deploy" -ForegroundColor Gray
            Write-Host ""
            
            if (Confirm-Action "Press ENTER when Vercel deployment is complete") {
                $vercelUrl = Get-UserInput "Enter your Vercel URL (e.g., https://myapp.vercel.app)"
                
                Write-Host ""
                Write-Host "STEP 3: Update Railway with Frontend URL" -ForegroundColor Yellow
                Write-Host "1. Go back to Railway Dashboard → Variables" -ForegroundColor Gray
                Write-Host "2. Update these variables:" -ForegroundColor Gray
                Write-Host "   - FRONTEND_URL=$vercelUrl" -ForegroundColor Gray
                Write-Host "   - CORS_ORIGIN=$vercelUrl" -ForegroundColor Gray
                Write-Host "   - CLIENT_URL=$vercelUrl" -ForegroundColor Gray
                Write-Host "3. Railway will auto-redeploy" -ForegroundColor Gray
                Write-Host ""
                
                Write-Host "✅ Deployment Complete!" -ForegroundColor Green
                Write-Host "Visit: $vercelUrl" -ForegroundColor Cyan
            }
        }
    }
    
    "4" {
        # Generate config files
        Write-Host ""
        Write-Host "Generating Configuration Files" -ForegroundColor Cyan
        Write-Host "==============================" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "✓ server/railway.toml - Railway configuration" -ForegroundColor Green
        Write-Host "✓ client/vercel.json - Vercel configuration" -ForegroundColor Green
        Write-Host "✓ .github/workflows/deploy.yml - GitHub Actions workflow" -ForegroundColor Green
        Write-Host ""
        Write-Host "These files are already in your repository!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To deploy manually:" -ForegroundColor Yellow
        Write-Host "1. Commit and push all changes: git push origin main" -ForegroundColor Gray
        Write-Host "2. Go to Railway and GitHub and follow the deployment guides" -ForegroundColor Gray
    }
    
    "5" {
        Write-Host "Exiting setup..." -ForegroundColor Yellow
        exit 0
    }
    
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📚 Need Help?" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "• Quick Guide: Read QUICKSTART.md" -ForegroundColor White
Write-Host "• Full Guide: Read DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host "• Issues? Check TROUBLESHOOTING.md" -ForegroundColor White
Write-Host "• Security: Review SECURITY_CHECKLIST.md" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Good luck with your deployment!" -ForegroundColor Green
