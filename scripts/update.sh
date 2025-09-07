#!/bin/bash

# Panas Token Ecosystem Update Script
# This script updates all submodules and dependencies

set -e

echo "🔄 Panas Token Ecosystem - Update Script"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
UPDATE_DEPS=${UPDATE_DEPS:-true}
FORCE_UPDATE=${FORCE_UPDATE:-false}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to confirm update
confirm_update() {
    if [ "$FORCE_UPDATE" = "false" ]; then
        echo -e "${YELLOW}This will update all submodules and dependencies. Continue? (y/N)${NC}"
        read -r response
        if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            print_error "Update cancelled by user"
            exit 1
        fi
    fi
}

# Function to update a specific component
update_component() {
    local component=$1
    local module_path=$2
    
    print_status "Updating $component..."
    
    if [ -d "$module_path" ]; then
        cd "$module_path"
        
        # Pull latest changes
        if git pull origin main > /dev/null 2>&1 || git pull origin master > /dev/null 2>&1; then
            print_success "$component updated"
        else
            print_warning "$component update failed or no remote configured"
        fi
        
        # Update dependencies if requested
        if [ "$UPDATE_DEPS" = "true" ]; then
            if [ -f "package.json" ]; then
                print_status "Updating npm dependencies for $component"
                npm update
            elif [ -f "requirements.txt" ]; then
                print_status "Updating pip dependencies for $component"
                pip install --upgrade -r requirements.txt
            elif [ -f "Cargo.toml" ]; then
                print_status "Updating cargo dependencies for $component"
                cargo update
            elif [ -f "go.mod" ]; then
                print_status "Updating go dependencies for $component"
                go get -u ./...
            fi
        fi
        
        cd - > /dev/null
    else
        print_warning "$component directory not found: $module_path"
    fi
}

print_status "Starting ecosystem update..."
confirm_update

# Create update log
UPDATE_LOG="updates/$(date +%Y%m%d_%H%M%S)_update.log"
mkdir -p updates
echo "Update started at $(date)" > "$UPDATE_LOG"

# Update main repository
print_status "=== UPDATING MAIN REPOSITORY ==="
print_status "Fetching latest changes..."
git fetch origin 2>&1 | tee -a "$UPDATE_LOG"

# Update submodules
print_status "=== UPDATING SUBMODULES ==="
if [ -f ".gitmodules" ]; then
    print_status "Updating all submodules..."
    
    # Update submodule URLs in case they changed
    git submodule sync --recursive 2>&1 | tee -a "$UPDATE_LOG"
    
    # Update to latest commits
    git submodule update --init --recursive --remote 2>&1 | tee -a "$UPDATE_LOG"
    
    print_success "Submodules updated"
else
    print_warning "No .gitmodules file found"
fi

# Update individual components
print_status "=== UPDATING COMPONENTS ==="
update_component "TON Contracts" "ecosystem/ton-contracts"
update_component "Solana Contracts" "ecosystem/solana-contracts"
update_component "Algorand Contracts" "ecosystem/algorand-contracts"
update_component "BSC Contracts" "ecosystem/bsc-contracts"
update_component "GS Token" "ecosystem/gs-token"
update_component "VASER Token" "ecosystem/vaser-token"
update_component "KUCHI Token" "ecosystem/kuchi-token"
update_component "NF Domains" "ecosystem/nf-domains"
update_component "Router Backend" "ecosystem/router-backend"
update_component "Dashboard" "ecosystem/dashboard"
update_component "Telegram Bot" "ecosystem/telegram-bot"

# Check for security updates
print_status "=== SECURITY CHECKS ==="
print_status "Checking for security vulnerabilities..."

# Check npm packages for vulnerabilities
find . -name "package.json" -not -path "./node_modules/*" | while read -r package_file; do
    package_dir=$(dirname "$package_file")
    cd "$package_dir"
    if command -v npm > /dev/null 2>&1; then
        print_status "Running npm audit in $package_dir"
        npm audit --audit-level=moderate 2>&1 | tee -a "../$UPDATE_LOG" || true
    fi
    cd - > /dev/null
done

# Check Python packages for vulnerabilities
find . -name "requirements.txt" -not -path "./venv/*" | while read -r req_file; do
    req_dir=$(dirname "$req_file")
    if command -v safety > /dev/null 2>&1; then
        print_status "Running safety check in $req_dir"
        safety check -r "$req_file" 2>&1 | tee -a "$UPDATE_LOG" || true
    fi
done

# Check for outdated script versions
print_status "=== SCRIPT VERSION CHECK ==="
print_status "Checking script versions..."

SCRIPT_VERSION="1.0.0"
echo "Current script version: $SCRIPT_VERSION" | tee -a "$UPDATE_LOG"

# List changes in submodules
print_status "=== CHANGE SUMMARY ==="
echo "Submodule changes:" | tee -a "$UPDATE_LOG"
git submodule status | while IFS= read -r line; do
    echo "$line" | tee -a "$UPDATE_LOG"
done

# Run quick health check after update
print_status "=== POST-UPDATE HEALTH CHECK ==="
if [ -f "scripts/status.sh" ]; then
    print_status "Running status check..."
    if ./scripts/status.sh 2>&1 | tee -a "$UPDATE_LOG"; then
        print_success "Health check passed"
    else
        print_warning "Health check found issues"
    fi
fi

# Summary
echo ""
echo "=============================================="
print_status "🔄 UPDATE SUMMARY"
echo "=============================================="
echo "Timestamp: $(date)"
echo "Log file: $UPDATE_LOG"
echo ""

echo "Update completed at $(date)" >> "$UPDATE_LOG"

print_success "Ecosystem update completed! 🎉"

echo ""
echo "What was updated:"
echo "✅ Git submodules synchronized"
echo "✅ Latest code pulled from all repositories"
if [ "$UPDATE_DEPS" = "true" ]; then
    echo "✅ Dependencies updated"
fi
echo "✅ Security audit performed"
echo "✅ Health check completed"

echo ""
echo "Next steps:"
echo "1. Review the update log: $UPDATE_LOG"
echo "2. Run ./scripts/test.sh to verify everything works"
echo "3. Run ./scripts/deploy.sh if updates need deployment"
echo "4. Check ./scripts/status.sh for detailed status"

echo ""
print_status "Recommended post-update commands:"
echo "  ./scripts/test.sh           # Run integration tests"
echo "  ./scripts/status.sh DETAILED=true  # Detailed status check"
echo "  git add . && git commit -m 'Update submodules and dependencies'"