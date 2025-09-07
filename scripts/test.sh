#!/bin/bash

# Panas Token Ecosystem Test Script
# This script runs integration tests across all ecosystem components

set -e

echo "🧪 Panas Token Ecosystem - Integration Tests"
echo "============================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
TEST_ENV=${TEST_ENV:-"testnet"}
TEST_SUITE=${TEST_SUITE:-"all"}
PARALLEL_TESTS=${PARALLEL_TESTS:-false}

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

# Function to run tests for a specific component
run_tests() {
    local component=$1
    local module_path=$2
    local test_results_file=$3
    
    print_status "Running tests for $component..."
    
    if [ -d "$module_path" ]; then
        cd "$module_path"
        
        local test_passed=false
        local test_output=""
        
        # Look for test scripts
        if [ -f "test.sh" ]; then
            print_status "Running test.sh for $component"
            if test_output=$(TEST_ENV=$TEST_ENV ./test.sh 2>&1); then
                test_passed=true
            fi
        elif [ -f "package.json" ] && grep -q '"test"' package.json; then
            print_status "Running npm test for $component"
            if test_output=$(npm test 2>&1); then
                test_passed=true
            fi
        elif [ -f "pytest.ini" ] || [ -f "pyproject.toml" ]; then
            print_status "Running pytest for $component"
            if test_output=$(python -m pytest 2>&1); then
                test_passed=true
            fi
        elif [ -f "Cargo.toml" ]; then
            print_status "Running cargo test for $component"
            if test_output=$(cargo test 2>&1); then
                test_passed=true
            fi
        elif [ -f "go.mod" ]; then
            print_status "Running go test for $component"
            if test_output=$(go test ./... 2>&1); then
                test_passed=true
            fi
        else
            print_warning "No test script found for $component"
            echo "$component: SKIPPED (no tests)" >> "$test_results_file"
            cd - > /dev/null
            return 0
        fi
        
        # Record results
        if [ "$test_passed" = true ]; then
            echo "$component: PASSED" >> "$test_results_file"
            print_success "$component tests passed"
        else
            echo "$component: FAILED" >> "$test_results_file"
            print_error "$component tests failed"
            echo "Error output:" >> "$test_results_file"
            echo "$test_output" >> "$test_results_file"
            echo "---" >> "$test_results_file"
        fi
        
        cd - > /dev/null
        return $([ "$test_passed" = true ] && echo 0 || echo 1)
    else
        echo "$component: MISSING (directory not found)" >> "$test_results_file"
        print_error "$component directory not found: $module_path"
        return 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    local test_results_file=$1
    
    print_status "=== INTEGRATION TESTS ==="
    
    # Test cross-chain token transfers
    print_status "Testing cross-chain token transfers..."
    if [ -f "tests/integration/cross_chain_test.sh" ]; then
        if ./tests/integration/cross_chain_test.sh 2>&1; then
            echo "Cross-chain transfers: PASSED" >> "$test_results_file"
        else
            echo "Cross-chain transfers: FAILED" >> "$test_results_file"
        fi
    else
        print_warning "Cross-chain integration tests not found"
        echo "Cross-chain transfers: SKIPPED" >> "$test_results_file"
    fi
    
    # Test NF Domains integration
    print_status "Testing NF Domains integration..."
    if [ -f "tests/integration/nf_domains_test.sh" ]; then
        if ./tests/integration/nf_domains_test.sh 2>&1; then
            echo "NF Domains: PASSED" >> "$test_results_file"
        else
            echo "NF Domains: FAILED" >> "$test_results_file"
        fi
    else
        echo "NF Domains: SKIPPED" >> "$test_results_file"
    fi
    
    # Test Router Backend API
    print_status "Testing Router Backend API..."
    if [ -f "tests/integration/router_api_test.sh" ]; then
        if ./tests/integration/router_api_test.sh 2>&1; then
            echo "Router API: PASSED" >> "$test_results_file"
        else
            echo "Router API: FAILED" >> "$test_results_file"
        fi
    else
        echo "Router API: SKIPPED" >> "$test_results_file"
    fi
    
    # Test Telegram Bot integration
    print_status "Testing Telegram Bot..."
    if [ -f "tests/integration/telegram_bot_test.sh" ]; then
        if ./tests/integration/telegram_bot_test.sh 2>&1; then
            echo "Telegram Bot: PASSED" >> "$test_results_file"
        else
            echo "Telegram Bot: FAILED" >> "$test_results_file"
        fi
    else
        echo "Telegram Bot: SKIPPED" >> "$test_results_file"
    fi
}

print_status "Starting tests for $TEST_ENV environment"
print_status "Test suite: $TEST_SUITE"

# Create test results directory and file
TEST_RESULTS_DIR="test-results"
mkdir -p "$TEST_RESULTS_DIR"
TEST_RESULTS_FILE="$TEST_RESULTS_DIR/$(date +%Y%m%d_%H%M%S)_$TEST_ENV.txt"
echo "Test run started at $(date)" > "$TEST_RESULTS_FILE"
echo "Environment: $TEST_ENV" >> "$TEST_RESULTS_FILE"
echo "Test suite: $TEST_SUITE" >> "$TEST_RESULTS_FILE"
echo "---" >> "$TEST_RESULTS_FILE"

# Track test results
TEST_COMPONENTS=()
FAILED_TESTS=0

if [ "$TEST_SUITE" = "all" ] || [ "$TEST_SUITE" = "contracts" ]; then
    print_status "=== CONTRACT TESTS ==="
    
    # Test TON contracts
    if run_tests "TON Contracts" "ecosystem/ton-contracts" "$TEST_RESULTS_FILE"; then
        TEST_COMPONENTS+=("TON Contracts: ✅")
    else
        TEST_COMPONENTS+=("TON Contracts: ❌")
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    # Test Solana contracts
    if run_tests "Solana Contracts" "ecosystem/solana-contracts" "$TEST_RESULTS_FILE"; then
        TEST_COMPONENTS+=("Solana Contracts: ✅")
    else
        TEST_COMPONENTS+=("Solana Contracts: ❌")
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    # Test Algorand contracts
    if run_tests "Algorand Contracts" "ecosystem/algorand-contracts" "$TEST_RESULTS_FILE"; then
        TEST_COMPONENTS+=("Algorand Contracts: ✅")
    else
        TEST_COMPONENTS+=("Algorand Contracts: ❌")
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    # Test BSC contracts
    if run_tests "BSC Contracts" "ecosystem/bsc-contracts" "$TEST_RESULTS_FILE"; then
        TEST_COMPONENTS+=("BSC Contracts: ✅")
    else
        TEST_COMPONENTS+=("BSC Contracts: ❌")
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
fi

if [ "$TEST_SUITE" = "all" ] || [ "$TEST_SUITE" = "components" ]; then
    print_status "=== COMPONENT TESTS ==="
    
    # Test NF Domains
    if run_tests "NF Domains" "ecosystem/nf-domains" "$TEST_RESULTS_FILE"; then
        TEST_COMPONENTS+=("NF Domains: ✅")
    else
        TEST_COMPONENTS+=("NF Domains: ❌")
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    # Test Router Backend
    if run_tests "Router Backend" "ecosystem/router-backend" "$TEST_RESULTS_FILE"; then
        TEST_COMPONENTS+=("Router Backend: ✅")
    else
        TEST_COMPONENTS+=("Router Backend: ❌")
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    # Test Dashboard
    if run_tests "Dashboard" "ecosystem/dashboard" "$TEST_RESULTS_FILE"; then
        TEST_COMPONENTS+=("Dashboard: ✅")
    else
        TEST_COMPONENTS+=("Dashboard: ❌")
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    # Test Telegram Bot
    if run_tests "Telegram Bot" "ecosystem/telegram-bot" "$TEST_RESULTS_FILE"; then
        TEST_COMPONENTS+=("Telegram Bot: ✅")
    else
        TEST_COMPONENTS+=("Telegram Bot: ❌")
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
fi

if [ "$TEST_SUITE" = "all" ] || [ "$TEST_SUITE" = "integration" ]; then
    run_integration_tests "$TEST_RESULTS_FILE"
fi

# Summary
echo ""
echo "=============================================="
print_status "🧪 TEST RESULTS SUMMARY"
echo "=============================================="
echo "Environment: $TEST_ENV"
echo "Test suite: $TEST_SUITE"
echo "Timestamp: $(date)"
echo "Results file: $TEST_RESULTS_FILE"
echo ""

for result in "${TEST_COMPONENTS[@]}"; do
    echo "$result"
done

echo ""
echo "Test run completed at $(date)" >> "$TEST_RESULTS_FILE"

# Check if any tests failed
if [ "$FAILED_TESTS" -gt 0 ]; then
    print_error "$FAILED_TESTS test(s) failed. Check the results file for details."
    exit 1
else
    print_success "All tests passed! 🎉"
fi

echo ""
echo "Next steps:"
echo "1. Review test results: $TEST_RESULTS_FILE"
echo "2. Run ./scripts/status.sh to check ecosystem status"
echo "3. Fix any failing tests before deployment"