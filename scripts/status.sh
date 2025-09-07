#!/bin/bash

# Panas Token Ecosystem Status Script
# This script checks the status of all ecosystem components

set -e

echo "📊 Panas Token Ecosystem - Status Check"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
STATUS_ENV=${STATUS_ENV:-"testnet"}
DETAILED=${DETAILED:-false}

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

# Function to check component status
check_component_status() {
    local component=$1
    local module_path=$2
    
    if [ -d "$module_path" ]; then
        cd "$module_path"
        
        local status="✅ AVAILABLE"
        local details=""
        
        # Check if component has a status script
        if [ -f "status.sh" ]; then
            if ./status.sh --env "$STATUS_ENV" > /dev/null 2>&1; then
                status="✅ RUNNING"
            else
                status="⚠️  ISSUES"
            fi
        elif [ -f "package.json" ]; then
            if npm list > /dev/null 2>&1; then
                status="✅ READY"
            else
                status="⚠️  DEPS MISSING"
            fi
        elif [ -f "requirements.txt" ]; then
            if pip list > /dev/null 2>&1; then
                status="✅ READY"
            else
                status="⚠️  DEPS MISSING"
            fi
        elif [ -f "Cargo.toml" ]; then
            if cargo check > /dev/null 2>&1; then
                status="✅ READY"
            else
                status="⚠️  BUILD ISSUES"
            fi
        fi
        
        # Get additional details if requested
        if [ "$DETAILED" = "true" ]; then
            if [ -f "README.md" ]; then
                local description=$(head -n 5 README.md | grep -v "^#" | head -n 1 | cut -c1-80)
                if [ -n "$description" ]; then
                    details=" - $description"
                fi
            fi
        fi
        
        echo "$component: $status$details"
        cd - > /dev/null
    else
        echo "$component: ❌ NOT FOUND"
    fi
}

# Function to check network connectivity
check_network_status() {
    local network=$1
    local rpc_url=$2
    
    if command -v curl > /dev/null 2>&1; then
        if curl -s --max-time 5 "$rpc_url" > /dev/null 2>&1; then
            echo "$network: ✅ CONNECTED"
        else
            echo "$network: ❌ DISCONNECTED"
        fi
    else
        echo "$network: ⚠️  CURL NOT AVAILABLE"
    fi
}

# Function to check git submodules status
check_submodules_status() {
    print_status "=== GIT SUBMODULES STATUS ==="
    
    if [ -f ".gitmodules" ]; then
        print_success "Found .gitmodules file"
        
        # Check if submodules are initialized
        git submodule status | while IFS= read -r line; do
            local prefix=${line:0:1}
            local hash=$(echo "$line" | cut -d' ' -f1 | cut -c2-)
            local path=$(echo "$line" | cut -d' ' -f2)
            local branch=$(echo "$line" | cut -d' ' -f3-)
            
            case "$prefix" in
                "-") echo "$path: ⚠️  NOT INITIALIZED" ;;
                "+") echo "$path: ⚠️  DIFFERENT COMMIT" ;;
                "U") echo "$path: ❌ MERGE CONFLICTS" ;;
                *) echo "$path: ✅ UP TO DATE" ;;
            esac
        done
    else
        print_error "No .gitmodules file found"
    fi
}

# Function to get token information
get_token_info() {
    print_status "=== TOKEN INFORMATION ==="
    
    # Read token information from documentation files
    if [ -f "Informe" ]; then
        print_status "PANAS Token Information:"
        echo "  Supply: 100,000,000 PANAS"
        echo "  Chains: TON (Jetton), Solana (SPL), Algorand (ASA), BSC (ERC-20)"
        echo "  NF Domains: panas.algo, pay.algo, treasury.algo"
    fi
    
    if [ -f "Gs-token" ]; then
        print_status "GS Token Information:"
        echo "  Mint: A1keUDicm5qfjjpjwhabK5EqVtBkkcdWGVjDXMqvbZ3w"
        echo "  Chain: Solana (Token 2022)"
        echo "  Holders: ~67"
    fi
    
    if [ -f "Kuchi" ]; then
        print_status "KUCHI Token Information:"
        echo "  Contract: 0x21b227d8085b4522805b6ad6c83...82068baa91"
        echo "  Chain: BSC (BEP-20)"
        echo "  Supply: 21,000,000 KUCHI"
        echo "  Holders: 29"
    fi
}

print_status "Checking ecosystem status for $STATUS_ENV environment"
echo ""

# Check git submodules
check_submodules_status
echo ""

# Check ecosystem components
print_status "=== ECOSYSTEM COMPONENTS ==="
check_component_status "TON Contracts" "ecosystem/ton-contracts"
check_component_status "Solana Contracts" "ecosystem/solana-contracts"
check_component_status "Algorand Contracts" "ecosystem/algorand-contracts"
check_component_status "BSC Contracts" "ecosystem/bsc-contracts"
check_component_status "GS Token" "ecosystem/gs-token"
check_component_status "VASER Token" "ecosystem/vaser-token"
check_component_status "KUCHI Token" "ecosystem/kuchi-token"
check_component_status "NF Domains" "ecosystem/nf-domains"
check_component_status "Router Backend" "ecosystem/router-backend"
check_component_status "Dashboard" "ecosystem/dashboard"
check_component_status "Telegram Bot" "ecosystem/telegram-bot"
echo ""

# Check network connectivity (testnet endpoints)
print_status "=== NETWORK CONNECTIVITY ==="
if [ "$STATUS_ENV" = "testnet" ]; then
    check_network_status "TON Testnet" "https://testnet.toncenter.com/api/v2/getAddressInformation"
    check_network_status "Solana Testnet" "https://api.testnet.solana.com"
    check_network_status "Algorand Testnet" "https://testnet-api.algonode.cloud"
    check_network_status "BSC Testnet" "https://data-seed-prebsc-1-s1.binance.org:8545"
else
    check_network_status "TON Mainnet" "https://toncenter.com/api/v2/getAddressInformation"
    check_network_status "Solana Mainnet" "https://api.mainnet-beta.solana.com"
    check_network_status "Algorand Mainnet" "https://mainnet-api.algonode.cloud"
    check_network_status "BSC Mainnet" "https://bsc-dataseed.binance.org"
fi
echo ""

# Check deployment logs
print_status "=== RECENT DEPLOYMENTS ==="
if [ -d "deployments" ] && [ "$(ls -A deployments)" ]; then
    print_status "Recent deployment logs:"
    ls -lt deployments/*.log | head -n 5 | while read -r line; do
        echo "  $(echo "$line" | awk '{print $9}' | xargs basename)"
    done
else
    print_warning "No deployment logs found"
fi
echo ""

# Check test results
print_status "=== RECENT TEST RESULTS ==="
if [ -d "test-results" ] && [ "$(ls -A test-results)" ]; then
    print_status "Recent test results:"
    ls -lt test-results/*.txt | head -n 3 | while read -r line; do
        local file=$(echo "$line" | awk '{print $9}')
        local filename=$(basename "$file")
        local passed=$(grep -c "PASSED" "$file" 2>/dev/null || echo "0")
        local failed=$(grep -c "FAILED" "$file" 2>/dev/null || echo "0")
        echo "  $filename - Passed: $passed, Failed: $failed"
    done
else
    print_warning "No test results found"
fi
echo ""

# Show token information
if [ "$DETAILED" = "true" ]; then
    get_token_info
    echo ""
fi

# Show available scripts
print_status "=== AVAILABLE SCRIPTS ==="
echo "  ./scripts/setup.sh    - Initialize ecosystem"
echo "  ./scripts/deploy.sh   - Deploy all contracts"
echo "  ./scripts/test.sh     - Run integration tests"
echo "  ./scripts/status.sh   - Check ecosystem status"
echo "  ./scripts/update.sh   - Update all submodules"
echo ""

print_success "Status check completed!"
echo ""
echo "Usage examples:"
echo "  ./scripts/status.sh DETAILED=true     - Show detailed status"
echo "  ./scripts/status.sh STATUS_ENV=mainnet - Check mainnet status"