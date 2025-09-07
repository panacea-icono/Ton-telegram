#!/bin/bash

# Panas Token Ecosystem Deployment Script
# This script deploys contracts and tokens across all supported chains

set -e

echo "🚀 Panas Token Ecosystem - Deployment Script"
echo "============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_ENV=${DEPLOY_ENV:-"testnet"}
SKIP_CONFIRMATIONS=${SKIP_CONFIRMATIONS:-false}

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

# Function to confirm deployment
confirm_deployment() {
    if [ "$SKIP_CONFIRMATIONS" = "false" ]; then
        echo -e "${YELLOW}Do you want to deploy to $DEPLOY_ENV? (y/N)${NC}"
        read -r response
        if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            print_error "Deployment cancelled by user"
            exit 1
        fi
    fi
}

# Function to deploy to a specific chain
deploy_to_chain() {
    local chain=$1
    local module_path=$2
    
    print_status "Deploying to $chain..."
    
    if [ -d "$module_path" ]; then
        cd "$module_path"
        
        # Look for deployment scripts
        if [ -f "deploy.sh" ]; then
            print_status "Running deploy.sh for $chain"
            chmod +x deploy.sh
            DEPLOY_ENV=$DEPLOY_ENV ./deploy.sh
        elif [ -f "scripts/deploy.js" ]; then
            print_status "Running deploy.js for $chain"
            node scripts/deploy.js --env $DEPLOY_ENV
        elif [ -f "deploy.py" ]; then
            print_status "Running deploy.py for $chain"
            python deploy.py --env $DEPLOY_ENV
        elif [ -f "Makefile" ]; then
            print_status "Running make deploy for $chain"
            make deploy ENV=$DEPLOY_ENV
        else
            print_warning "No deployment script found for $chain"
            cd - > /dev/null
            return 1
        fi
        
        cd - > /dev/null
        print_success "$chain deployment completed"
        return 0
    else
        print_error "$chain contracts not found: $module_path"
        return 1
    fi
}

print_status "Starting deployment to $DEPLOY_ENV environment"
confirm_deployment

# Create deployment log
DEPLOYMENT_LOG="deployments/$(date +%Y%m%d_%H%M%S)_$DEPLOY_ENV.log"
mkdir -p deployments
echo "Deployment started at $(date)" > "$DEPLOYMENT_LOG"

# Track deployment results
DEPLOYMENT_RESULTS=()

echo ""
print_status "=== PHASE 1: Core Token Contracts ==="

# Deploy TON (Jetton) contracts
print_status "Deploying TON/Jetton contracts..."
if deploy_to_chain "TON" "ecosystem/ton-contracts" 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
    DEPLOYMENT_RESULTS+=("TON: ✅")
else
    DEPLOYMENT_RESULTS+=("TON: ❌")
fi

# Deploy Solana (SPL) contracts
print_status "Deploying Solana contracts..."
if deploy_to_chain "Solana" "ecosystem/solana-contracts" 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
    DEPLOYMENT_RESULTS+=("Solana: ✅")
else
    DEPLOYMENT_RESULTS+=("Solana: ❌")
fi

# Deploy Algorand (ASA) contracts
print_status "Deploying Algorand contracts..."
if deploy_to_chain "Algorand" "ecosystem/algorand-contracts" 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
    DEPLOYMENT_RESULTS+=("Algorand: ✅")
else
    DEPLOYMENT_RESULTS+=("Algorand: ❌")
fi

# Deploy BSC (ERC-20) contracts
print_status "Deploying BSC contracts..."
if deploy_to_chain "BSC" "ecosystem/bsc-contracts" 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
    DEPLOYMENT_RESULTS+=("BSC: ✅")
else
    DEPLOYMENT_RESULTS+=("BSC: ❌")
fi

echo ""
print_status "=== PHASE 2: Supporting Components ==="

# Deploy NF Domains
print_status "Setting up NF Domains..."
if deploy_to_chain "NF Domains" "ecosystem/nf-domains" 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
    DEPLOYMENT_RESULTS+=("NF Domains: ✅")
else
    DEPLOYMENT_RESULTS+=("NF Domains: ❌")
fi

# Deploy Router Backend
print_status "Deploying Router Backend..."
if deploy_to_chain "Router Backend" "ecosystem/router-backend" 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
    DEPLOYMENT_RESULTS+=("Router Backend: ✅")
else
    DEPLOYMENT_RESULTS+=("Router Backend: ❌")
fi

# Deploy Dashboard
print_status "Deploying Dashboard..."
if deploy_to_chain "Dashboard" "ecosystem/dashboard" 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
    DEPLOYMENT_RESULTS+=("Dashboard: ✅")
else
    DEPLOYMENT_RESULTS+=("Dashboard: ❌")
fi

# Deploy Telegram Bot
print_status "Deploying Telegram Bot..."
if deploy_to_chain "Telegram Bot" "ecosystem/telegram-bot" 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
    DEPLOYMENT_RESULTS+=("Telegram Bot: ✅")
else
    DEPLOYMENT_RESULTS+=("Telegram Bot: ❌")
fi

echo ""
print_status "=== PHASE 3: Integration Tests ==="

# Run integration tests if available
if [ -f "scripts/test.sh" ]; then
    print_status "Running integration tests..."
    if ./scripts/test.sh --env $DEPLOY_ENV 2>&1 | tee -a "$DEPLOYMENT_LOG"; then
        DEPLOYMENT_RESULTS+=("Integration Tests: ✅")
    else
        DEPLOYMENT_RESULTS+=("Integration Tests: ❌")
    fi
fi

# Summary
echo ""
echo "=============================================="
print_status "🎯 DEPLOYMENT SUMMARY"
echo "=============================================="
echo "Environment: $DEPLOY_ENV"
echo "Timestamp: $(date)"
echo "Log file: $DEPLOYMENT_LOG"
echo ""

for result in "${DEPLOYMENT_RESULTS[@]}"; do
    echo "$result"
done

echo ""
echo "Deployment completed at $(date)" >> "$DEPLOYMENT_LOG"

# Check if any deployments failed
failed_deployments=$(printf "%s\n" "${DEPLOYMENT_RESULTS[@]}" | grep -c "❌" || true)
if [ "$failed_deployments" -gt 0 ]; then
    print_warning "$failed_deployments deployments failed. Check the log file for details."
    exit 1
else
    print_success "All deployments completed successfully! 🎉"
fi

echo ""
echo "Next steps:"
echo "1. Run ./scripts/status.sh to check deployment status"
echo "2. Run ./scripts/test.sh to run comprehensive tests"
echo "3. Update configuration files with new addresses"