#!/bin/bash
# Interactive Deployment Setup Script for macOS/Linux
# This script guides you through deploying to Vercel + Railway

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}🚀 Mock Test Platform - Deployment Setup${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

confirm() {
    local prompt="$1"
    local response
    read -p "$(echo -e ${YELLOW}${prompt}${NC}) (y/n) " -n 1 -r response
    echo
    [[ $response =~ ^[Yy]$ ]]
}

# Main script
print_header

# Step 1: Check prerequisites
print_step "Step 1: Checking Prerequisites"
echo "=============================="

if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "Git is installed: $GIT_VERSION"
else
    print_error "Git is NOT installed. Install from https://git-scm.com"
    exit 1
fi

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is NOT installed. Install from https://nodejs.org"
    exit 1
fi

echo ""

# Step 2: Verify environment files
print_step "Step 2: Environment Files"
echo "=========================="

if [ -f "server/.env" ]; then
    print_success "Found server/.env"
else
    print_warning "Missing server/.env"
    if confirm "Create from server/.env.example?"; then
        cp "server/.env.example" "server/.env"
        print_success "Created server/.env - EDIT THIS FILE with your actual values!"
    fi
fi

if [ -f "client/.env" ]; then
    print_success "Found client/.env"
else
    print_success "client/.env will be created during frontend deployment"
fi

echo ""

# Step 3: Interactive deployment choice
print_step "Step 3: Choose Deployment Method"
echo "================================="
echo ""
echo "1. Deploy Backend to Railway"
echo "2. Deploy Frontend to Vercel"
echo "3. Deploy Both (Full Stack)"
echo "4. Just generate config files (deploy manually)"
echo "5. Exit"
echo ""
read -p "Choose (1-5): " choice

case $choice in
    1)
        echo ""
        echo -e "${CYAN}Backend Deployment to Railway${NC}"
        echo "============================="
        echo ""
        echo -e "${YELLOW}1. Go to https://railway.app and sign up with GitHub${NC}"
        echo -e "${YELLOW}2. Create a new project from your repository${NC}"
        echo -e "${YELLOW}3. Add your environment variables in Railway dashboard${NC}"
        echo -e "${YELLOW}4. Copy your Railway URL when deployment completes${NC}"
        echo ""
        read -p "Enter your Railway backend URL: " railway_url
        if [ ! -z "$railway_url" ]; then
            print_success "Saved Railway URL: $railway_url"
            echo ""
            print_warning "Next: Update your frontend environment variables with this URL"
        fi
        ;;
    2)
        echo ""
        echo -e "${CYAN}Frontend Deployment to Vercel${NC}"
        echo "============================="
        echo ""
        echo -e "${YELLOW}1. Go to https://vercel.com and sign up with GitHub${NC}"
        echo -e "${YELLOW}2. Import your repository${NC}"
        echo -e "${YELLOW}3. Set Root Directory to 'client'${NC}"
        echo -e "${YELLOW}4. Add environment variables:${NC}"
        echo -e "${YELLOW}   - VITE_API_TARGET: https://your-railway-url/api${NC}"
        echo -e "${YELLOW}   - VITE_ADMIN_PATH: /admin-x9k2${NC}"
        echo -e "${YELLOW}5. Click Deploy${NC}"
        echo ""
        read -p "Enter your Vercel frontend URL: " vercel_url
        if [ ! -z "$vercel_url" ]; then
            print_success "Saved Vercel URL: $vercel_url"
            echo ""
            print_warning "Next: Update your Railway environment with this URL"
        fi
        ;;
    3)
        echo ""
        echo -e "${CYAN}Full Deployment (Backend + Frontend)${NC}"
        echo "===================================="
        echo ""
        
        echo -e "${YELLOW}STEP 1: Deploy Backend to Railway${NC}"
        echo "1. Go to https://railway.app → New Project"
        echo "2. Select 'Deploy from GitHub Repo'"
        echo "3. Choose your repository"
        echo "4. Add all environment variables from server/.env"
        echo "5. Wait for deployment"
        echo ""
        
        if confirm "Press ENTER when Railway deployment is complete"; then
            read -p "Enter your Railway URL: " railway_url
            
            echo ""
            echo -e "${YELLOW}STEP 2: Deploy Frontend to Vercel${NC}"
            echo "1. Go to https://vercel.com → Import Project"
            echo "2. Select your GitHub repository"
            echo "3. Set Root Directory: client"
            echo "4. Add Environment Variables:"
            echo "   - VITE_API_TARGET=$railway_url/api"
            echo "   - VITE_ADMIN_PATH=/admin-x9k2"
            echo "5. Click Deploy"
            echo ""
            
            if confirm "Press ENTER when Vercel deployment is complete"; then
                read -p "Enter your Vercel URL: " vercel_url
                
                echo ""
                echo -e "${YELLOW}STEP 3: Update Railway with Frontend URL${NC}"
                echo "1. Go back to Railway Dashboard → Variables"
                echo "2. Update these variables:"
                echo "   - FRONTEND_URL=$vercel_url"
                echo "   - CORS_ORIGIN=$vercel_url"
                echo "   - CLIENT_URL=$vercel_url"
                echo "3. Railway will auto-redeploy"
                echo ""
                
                print_success "Deployment Complete!"
                echo -e "${CYAN}Visit: $vercel_url${NC}"
            fi
        fi
        ;;
    4)
        echo ""
        echo -e "${CYAN}Generating Configuration Files${NC}"
        echo "=============================="
        echo ""
        
        print_success "server/railway.toml - Railway configuration"
        print_success "client/vercel.json - Vercel configuration"
        print_success ".github/workflows/deploy.yml - GitHub Actions workflow"
        echo ""
        print_warning "These files are already in your repository!"
        echo ""
        echo -e "${YELLOW}To deploy manually:${NC}"
        echo "1. Commit and push all changes: git push origin main"
        echo "2. Go to Railway and GitHub and follow the deployment guides"
        ;;
    5)
        echo "Exiting setup..."
        exit 0
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}📚 Need Help?${NC}"
echo -e "${CYAN}========================================${NC}"
echo "• Quick Guide: Read QUICKSTART.md"
echo "• Full Guide: Read DEPLOYMENT_GUIDE.md"
echo "• Issues? Check TROUBLESHOOTING.md"
echo "• Security: Review SECURITY_CHECKLIST.md"
echo ""
print_success "Good luck with your deployment!"
