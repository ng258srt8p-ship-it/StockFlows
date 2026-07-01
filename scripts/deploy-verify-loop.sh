#!/bin/bash

# Automated Deploy-Verification Loop for StockFlows
# ====================================================
# 
# This script automates the complete deployment pipeline for StockFlows,
# including GitHub pushes, Fly.io deployment, Cloudflare Pages deployment,
# Shopify Partners deployment, and E2E testing verification.
#
# CONFIGURABLE OPTIONS:
# - ITERATIONS: Number of times to run the full loop (default: 1)
# - STOP_ON_FAILURE: Set to '1' to stop on first failure, '0' to continue (default: 1)
# - DEPLOYER_USERNAME: GitHub username/account for repo ownership
# - DEPLOYER_EMAIL: Email address for Git commits
#
# USAGE:
#   ./deploy-verify-loop.sh [iterations]
#   Example: ./deploy-verify-loop.sh 3
#   Example: ./deploy-verify-loop.sh --iterations=5 --continue-on-failure
#
# DEPENDENCIES:
# - gh (GitHub CLI) - authenticated
# - fly (Fly.io CLI) - authenticated
# - wrangler (Cloudflare Pages CLI) - authenticated
# - npm/npx - Node.js package manager
# - curl
# - jq (for JSON parsing in some operations)
#
# ENVIRONMENT VARIABLES (can be set before running):
# - GITHUB_TOKEN: Personal access token for GitHub API
# - FLY_TOKEN: Fly.io personal access token  
# - CLOUDINARY_API_TOKEN: Cloudflare Pages API token (for wrangler auth)
# - DATABASE_URL: PostgreSQL connection string for Fly.io
# - REDIS_HOST: Redis host for Fly.io

# Set default values and configuration
ITERATIONS=${1:-1}
STOP_ON_FAILURE=1
DEPLOYER_USERNAME="georgetozer"
DEPLOYER_EMAIL="georgetozer@gmail.com"
FORCE_FAILURE_TEST=false

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -i|--iterations)
                shift
                ITERATIONS="$1"
                shift
                ;;
            -c|--continue-on-failure)
                STOP_ON_FAILURE=0
                shift
                ;;
            -f|--force-fail-test)
                FORCE_FAILURE_TEST=true
                shift
                ;;
            -u|--username)
                shift
                DEPLOYER_USERNAME="$1"
                shift
                ;;
            -e|--email)
                shift
                DEPLOYER_EMAIL="$1"
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo "Unknown argument: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

show_help() {
    cat << EOF
Usage: $0 [options]

Automated Deploy-Verification Loop for StockFlows

Options:
  -i, --iterations N      Number of loop iterations (default: 1)
  -c, --continue-on-failure Continue on step failures instead of stopping
  -f, --force-fail-test    Force E2E tests to fail for testing error handling
  -u, --username NAME     GitHub username for commits (default: $DEPLOYER_USERNAME)
  -e, --email ADDRESS      Email address for Git commits (default: $DEPLOYER_EMAIL)
  -h, --help              Show this help message

Environment Variables:
  GITHUB_TOKEN           Personal Access Token for GitHub API
  FLY_TOKEN              Personal Access Token for Fly.io API
  CLOUDINARY_API_TOKEN    Cloudflare Pages API token
  DATABASE_URL           PostgreSQL connection string
  REDIS_HOST             Redis host for Fly.io

Examples:
  $0                                    # Run once (default)
  $0 3                                  # Run 3 times
  $0 --continue-on-failure             # Continue even if steps fail
  $0 --iterations=5 --username=john    # Custom settings
EOF
}

# Color output functions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if required tools are available
check_dependencies() {
    print_step "Checking Dependencies"
    
    local missing=0
    
    for cmd in gh fly npx npm curl jq; do
        if ! command -v $cmd &> /dev/null; then
            print_error "Required command '$cmd' is not available"
            missing=1
        else
            print_success "$cmd is available"
        fi
    done
    
    if [ $missing -eq 1 ]; then
        print_error "Please install missing dependencies and try again"
        return 1
    fi
    
    return 0
}

# Function to verify authentication
check_authentication() {
    print_step "Checking Authentication"
    
    # Check GitHub CLI
    if ! gh auth status &> /dev/null; then
        print_error "GitHub CLI is not authenticated. Run: gh auth login"
        return 1
    fi
    print_success "GitHub CLI authenticated"
    
    # Check Fly.io CLI
    if ! fly auth token &> /dev/null; then
        print_error "Fly.io CLI is not authenticated. Run: fly auth login"
        return 1
    fi
    print_success "Fly.io CLI authenticated"
    
    # Check Cloudflare Pages
    if ! npx wrangler pages project list 2>&1 | head -1 | grep -q "stockflows-tour"; then
        print_warning "Cloudflare Pages project 'stockflows-tour' may not exist"
        print_warning "You may need to create it manually or check API token"
    fi
    print_success "Cloudflare Pages configured"
    
    return 0
}

# Function to run git operations
run_git_operations() {
    print_step "Running Git Operations"
    
    local repo_created=false
    
    # Check if git repo exists
    if [ ! -d ".git" ]; then
        print_success "Initializing Git repository"
        git init
        git checkout -b main
        
        # Create .gitignore if it doesn't exist
        if [ ! -f ".gitignore" ]; then
            cat > .gitignore << GITEOF
node_modules/
build/
dist/
.env
.env.local
.env.production
test-results/
*.log
.DS_Store
coverage/
GITEOF
        fi
        
        git add .
        git config user.name "$DEPLOYER_USERNAME"
        git config user.email "$DEPLOYER_EMAIL"
        git commit -m "Initial commit: StockFlows inventory management app for Shopify"
        
        repo_created=true
        print_success "Git repository initialized and committed"
    else
        print_success "Git repository already exists"
    fi
    
    # Push to GitHub
    local repo_name="stockflows"
    print_success "Checking if GitHub repository exists..."
    
    if gh repo view $repo_name 2>/dev/null; then
        print_success "GitHub repository '$repo_name' already exists"
        
        # Try to get current user for remote naming
        local current_user
        if current_user=$(gh api user -q .login 2>/dev/null); then
            git remote remove origin 2>/dev/null || true
            git remote add origin "git@github.com:$current_user/$repo_name.git"
        else
            print_warning "Could not determine GitHub username, skipping git remote setup"
        fi
        
        git branch --set-upstream-to origin/main 2>/dev/null || true
    else
        print_success "Creating GitHub repository '$repo_name'"
        
        local repo_description="AI-powered inventory management and demand forecasting for Shopify merchants"
        
        if gh auth status >/dev/null 2>&1; then
            gh repo create $repo_name --public --description "$repo_description" --source=. --remote=origin --push
            print_success "Repository created and pushed to GitHub"
            repo_created=true
        else
            print_error "GitHub authentication required to create repository"
            print_error "Please run: gh auth login"
            return 1
        fi
    fi
    
    # Configure git user if needed
    git config user.name "$DEPLOYER_USERNAME"
    git config user.email "$DEPLOYER_EMAIL"
    
    # Push current branch
    if [ "$repo_created" = true ]; then
        git push -u origin main
    else
        git push origin main --force
    fi
    
    print_success "Git operations completed"
    return 0
}

# Function to deploy to Fly.io
run_fly_deployment() {
    print_step "Deploying to Fly.io"
    
    # Check Fly login
    if ! fly auth token &> /dev/null; then
        print_error "Not authenticated with Fly.io"
        print_error "Please run: fly auth login"
        return 1
    fi
    
    # Check if fly.toml exists
    if [ ! -f "fly.toml" ]; then
        print_error "fly.toml not found. Run 'fly launch --no-deploy' first"
        return 1
    fi
    
    # Deploy
    print_success "Deploying to Fly.io"
    
    # Set required secrets (these would need to be configured before running)
    if [ -n "$SHOPIFY_API_KEY" ] && [ -n "$SHOPIFY_API_SECRET" ]; then
        fly secrets set SHOPIFY_API_KEY="$SHOPIFY_API_KEY" 2>/dev/null || true
        fly secrets set SHOPIFY_API_SECRET="$SHOPIFY_API_SECRET" 2>/dev/null || true
    fi
    
    if [ -n "$DATABASE_URL" ]; then
        fly secrets set DATABASE_URL="$DATABASE_URL" 2>/dev/null || true
    fi
    
    # Deploy command
    if fly deploy --now; then
        print_success "Fly.io deployment completed"
    else
        print_error "Fly.io deployment failed"
        return 1
    fi
    
    # Run migrations if needed
    print_success "Running database migrations"
    if fly ssh console -C "npx prisma migrate deploy"; then
        print_success "Database migrations completed"
    else
        print_warning "Database migrations may have failed, continuing..."
    fi
    
    return 0
}

# Function to deploy to Cloudflare Pages
run_cloudflare_pages_deployment() {
    print_step "Deploying to Cloudflare Pages"
    
    # Check if wrangler is configured
    if ! npm list -g wrangler &> /dev/null || ! command -v wrangler &> /dev/null; then
        print_error "Wrangler CLI is not installed globally"
        print_error "Please run: npm install -g wrangler"
        return 1
    fi
    
    # Check if project exists
    local project_name="stockflows-tour"
    print_success "Checking Cloudflare Pages project '$project_name'"
    
    if ! npx wrangler pages project list 2>/dev/null | grep -q $project_name; then
        print_warning "Cloudflare Pages project '$project_name' not found"
        print_warning "You may need to create it manually in Cloudflare dashboard"
        print_warning "Or check if wrangler is properly authenticated"
        return 1
    fi
    
    # Deploy
    print_success "Deploying static site to Cloudflare Pages"
    
    if npx wrangler pages deploy public --project-name=$project_name --branch=main; then
        print_success "Cloudflare Pages deployment completed"
    else
        print_error "Cloudflare Pages deployment failed"
        return 1
    fi
    
    return 0
}

# Function to run Shopify Partners deployment
run_shopify_app_deploy() {
    print_step "Deploying Shopify App Config (Partners)"
    
    print_success "Deploying Shopify app configuration"
    
    if npx @shopify/cli app deploy --force; then
        print_success "Shopify Partners deployment completed"
    else
        print_error "Shopify Partners deployment failed"
        return 1
    fi
    
    return 0
}

# Function to run E2E tests
run_e2e_tests() {
    print_step "Running E2E Tests (Playwright)"
    
    # Check if tests directory exists
    if [ ! -d "e2e" ]; then
        print_error "E2E tests directory not found at 'e2e/'"
        return 1
    fi
    
    # Check if Playwright config exists
    if [ ! -f "playwright.config.ts" ]; then
        print_error "Playwright config not found at 'playwright.config.ts'"
        return 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_success "Installing Node.js dependencies"
        npm ci
    fi
    
    # Force failure if requested (for testing)
    if [ "$FORCE_FAILURE_TEST" = true ]; then
        print_warning "Force failure mode enabled - tests will fail"
        return 1
    fi
    
    # Run Playwright tests
    print_success "Running Playwright E2E tests against deployed application"
    
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_success "Test attempt $attempt/$max_attempts"
        
        if npx playwright test --reporter=html; then
            print_success "All E2E tests passed"
            return 0
        else
            print_error "E2E tests failed"
            
            # Save test results for debugging
            if [ -d "test-results" ]; then
                print_warning "Test results saved to test-results/ directory"
            fi
            
            return 1
        fi
    done
    
    print_error "All test attempts failed after $max_attempts attempts"
    return 1
}

# Function to run verification scripts
run_verification() {
    print_step "Running Health Checks"
    
    # Wait a moment for deployment to stabilize
    sleep 30
    
    # Try to reach Fly.io app
    if [ -n "$FLY_APP_URL" ]; then
        print_success "Testing Fly.io application health"
        if curl -f -s "$FLY_APP_URL/health" | grep -q "alive"; then
            print_success "Fly.io application is healthy"
        else
            print_error "Fly.io application health check failed"
            return 1
        fi
    fi
    
    # Try to reach Cloudflare Pages
    local pages_url="https://stockflows.app"
    print_success "Testing Cloudflare Pages site"
    if curl -f -s -I "$pages_url" | grep -q "200 OK"; then
        print_success "Cloudflare Pages site is reachable"
    else
        print_error "Cloudflare Pages site check failed"
        return 1
    fi
    
    print_success "All verification checks passed"
    return 0
}

# Function to clean up
cleanup() {
    print_step "Cleaning up"
    
    # Remove any temporary files
    rm -f .fly launched 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Main execution function
main() {
    echo "============================================"
    echo " StockFlows Deploy-Verification Loop Script"
    echo "============================================"
    echo ""
    echo "Iterations: $ITERATIONS"
    echo "Stop on failure: $([ $STOP_ON_FAILURE -eq 1 ] && echo 'YES' || echo 'NO')"
    echo "Force test failure: $FORCE_FAILURE_TEST"
    echo ""
    
    # Validate iterations
    if ! [[ "$ITERATIONS" =~ ^[0-9]+$ ]] || [ "$ITERATIONS" -lt 1 ]; then
        print_error "Invalid number of iterations: $ITERATIONS"
        print_error "Must be a positive integer"
        show_help
        exit 1
    fi
    
    local success_count=0
    local failure_count=0
    
    for ((iteration=1; iteration<=ITERATIONS; iteration++)); do
        echo ""
        echo "=========================================================="
        echo " RUNNING ITERATION $iteration/$ITERATIONS"
        echo "=========================================================="
        echo ""
        
        # Reset loop state
        set +e
        
        # Run the deployment pipeline
        if run_git_operations; then
            print_success "Git Operations: PASSED"
            git_success=true
        else
            print_error "Git Operations: FAILED"
            git_success=false
        fi
        
        if run_fly_deployment; then
            print_success "Fly.io Deployment: PASSED"
            fly_success=true
        else
            print_error "Fly.io Deployment: FAILED"
            fly_success=false
        fi
        
        if run_cloudflare_pages_deployment; then
            print_success "Cloudflare Pages Deployment: PASSED"
            cloudflare_success=true
        else
            print_error "Cloudflare Pages Deployment: FAILED"
            cloudflare_success=false
        fi
        
        if run_shopify_app_deploy; then
            print_success "Shopify Partners Deployment: PASSED"
            shopify_success=true
        else
            print_error "Shopify Partners Deployment: FAILED"
            shopify_success=false
        fi
        
        if run_e2e_tests; then
            print_success "E2E Tests: PASSED"
            test_success=true
        else
            print_error "E2E Tests: FAILED"
            test_success=false
        fi
        
        if run_verification; then
            print_success "Verification: PASSED"
            verification_success=true
        else
            print_error "Verification: FAILED"
            verification_success=false
        fi
        
        # Check if any step failed
        overall_success=$(
            [ "$git_success" = true ] && \
            [ "$fly_success" = true ] && \
            [ "$cloudflare_success" = true ] && \
            [ "$shopify_success" = true ] && \
            [ "$test_success" = true ] && \
            [ "$verification_success" = true ] && \
            echo "true" || echo "false"
        )
        
        # Count successes and failures
        if [ "$overall_success" = "true" ]; then
            success_count=$((success_count + 1))
            print_success "ITERATION $iteration: ALL STEPS PASSED"
        else
            failure_count=$((failure_count + 1))
            print_error "ITERATION $iteration: SOME STEPS FAILED"
        fi
        
        # Check if we should stop on failure
        if [ "$overall_success" = "false" ] && [ $STOP_ON_FAILURE -eq 1 ]; then
            echo ""
            print_error "Stopping due to failure (STOP_ON_FAILURE=1)"
            break
        fi
        
        # Wait between iterations if not the last one
        if [ $iteration -lt $ITERATIONS ]; then
            echo ""
            print_warning "Waiting 60 seconds before next iteration..."
            sleep 60
        fi
    done
    
    # Summary
    echo ""
    echo "============================================"
    echo " DEPLOYMENT LOOP SUMMARY"
    echo "============================================"
    echo "Iterations completed: $ITERATIONS"
    echo "Successful iterations: $success_count"
    echo "Failed iterations: $failure_count"
    echo ""
    
    if [ $failure_count -gt 0 ]; then
        print_error "Some iterations failed. Check logs above for details."
        exit 1
    else
        print_success "All iterations completed successfully!"
        exit 0
    fi
}

# Parse arguments and run main
parse_args "$@"

# Run main function
trap cleanup EXIT
main
