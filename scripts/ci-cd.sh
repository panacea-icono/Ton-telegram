#!/bin/bash

# Panas Token Ecosystem CI/CD Integration Script
# This script integrates with CI/CD pipelines and automates workflows

set -e

echo "🚀 Panas Token Ecosystem - CI/CD Integration"
echo "============================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
CI_ENV=${CI_ENV:-"ci"}
WORKFLOW=${WORKFLOW:-"full"}
SKIP_TESTS=${SKIP_TESTS:-false}
DEPLOY_ON_SUCCESS=${DEPLOY_ON_SUCCESS:-false}

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

# Function to detect CI environment
detect_ci_environment() {
    if [ "$CI" = "true" ]; then
        if [ -n "$GITHUB_ACTIONS" ]; then
            echo "github-actions"
        elif [ -n "$GITLAB_CI" ]; then
            echo "gitlab-ci"
        elif [ -n "$JENKINS_URL" ]; then
            echo "jenkins"
        elif [ -n "$CIRCLECI" ]; then
            echo "circle-ci"
        else
            echo "unknown-ci"
        fi
    else
        echo "local"
    fi
}

# Function to setup CI environment
setup_ci_environment() {
    local ci_system=$1
    
    print_status "Setting up environment for $ci_system..."
    
    case "$ci_system" in
        "github-actions")
            # GitHub Actions specific setup
            if [ -n "$GITHUB_ENV" ]; then
                echo "PANAS_CI_ENV=$CI_ENV" >> "$GITHUB_ENV"
                echo "PANAS_WORKFLOW=$WORKFLOW" >> "$GITHUB_ENV"
            fi
            ;;
        "gitlab-ci")
            # GitLab CI specific setup
            export PANAS_CI_ENV="$CI_ENV"
            export PANAS_WORKFLOW="$WORKFLOW"
            ;;
        "jenkins")
            # Jenkins specific setup
            export PANAS_CI_ENV="$CI_ENV"
            export PANAS_WORKFLOW="$WORKFLOW"
            ;;
        *)
            print_warning "Unknown or local CI environment"
            ;;
    esac
}

# Function to run linting across ecosystem
run_ecosystem_linting() {
    print_status "=== ECOSYSTEM LINTING ==="
    
    local lint_failed=0
    
    # Function to lint a component
    lint_component() {
        local component=$1
        local path=$2
        
        if [ -d "$path" ]; then
            print_status "Linting $component..."
            cd "$path"
            
            if [ -f "package.json" ] && grep -q '"lint"' package.json; then
                if npm run lint; then
                    print_success "$component linting passed"
                else
                    print_error "$component linting failed"
                    lint_failed=$((lint_failed + 1))
                fi
            elif [ -f "pyproject.toml" ] || [ -f "setup.cfg" ]; then
                if command -v flake8 > /dev/null 2>&1; then
                    if flake8 .; then
                        print_success "$component linting passed"
                    else
                        print_error "$component linting failed"
                        lint_failed=$((lint_failed + 1))
                    fi
                fi
            elif [ -f "Cargo.toml" ]; then
                if cargo clippy -- -D warnings; then
                    print_success "$component linting passed"
                else
                    print_error "$component linting failed"
                    lint_failed=$((lint_failed + 1))
                fi
            else
                print_warning "No linting configuration found for $component"
            fi
            
            cd - > /dev/null
        fi
    }
    
    # Lint each component
    lint_component "TON Contracts" "ecosystem/ton-contracts"
    lint_component "Solana Contracts" "ecosystem/solana-contracts"
    lint_component "Algorand Contracts" "ecosystem/algorand-contracts"
    lint_component "BSC Contracts" "ecosystem/bsc-contracts"
    lint_component "Router Backend" "ecosystem/router-backend"
    lint_component "Dashboard" "ecosystem/dashboard"
    lint_component "Telegram Bot" "ecosystem/telegram-bot"
    
    return $lint_failed
}

# Function to run security checks
run_security_checks() {
    print_status "=== SECURITY CHECKS ==="
    
    local security_issues=0
    
    # Check for secrets in code
    if command -v grep > /dev/null 2>&1; then
        print_status "Checking for potential secrets..."
        
        # Common secret patterns
        SECRET_PATTERNS=(
            "password\s*=\s*['\"][^'\"]{8,}"
            "api[_-]?key\s*=\s*['\"][^'\"]{16,}"
            "private[_-]?key\s*=\s*['\"][^'\"]{32,}"
            "secret\s*=\s*['\"][^'\"]{16,}"
            "token\s*=\s*['\"][^'\"]{16,}"
        )
        
        for pattern in "${SECRET_PATTERNS[@]}"; do
            if grep -r -i -E "$pattern" . --include="*.js" --include="*.ts" --include="*.py" --include="*.sol" --exclude-dir=node_modules --exclude-dir=.git; then
                print_warning "Potential secret found matching pattern: $pattern"
                security_issues=$((security_issues + 1))
            fi
        done
        
        if [ $security_issues -eq 0 ]; then
            print_success "No obvious secrets found in code"
        fi
    fi
    
    # Check dependencies for vulnerabilities
    print_status "Checking dependencies for vulnerabilities..."
    
    find . -name "package.json" -not -path "./node_modules/*" | while read -r package_file; do
        package_dir=$(dirname "$package_file")
        cd "$package_dir"
        if command -v npm > /dev/null 2>&1; then
            npm audit --audit-level=high || security_issues=$((security_issues + 1))
        fi
        cd - > /dev/null
    done
    
    return $security_issues
}

# Function to generate reports
generate_reports() {
    local ci_system=$1
    
    print_status "=== GENERATING REPORTS ==="
    
    # Create reports directory
    mkdir -p "ci-reports"
    
    # Generate test coverage report
    if [ -f "coverage/lcov.info" ]; then
        print_status "Test coverage report found"
        cp coverage/lcov.info "ci-reports/coverage.lcov"
    fi
    
    # Generate component status report
    print_status "Generating component status report..."
    ./scripts/status.sh DETAILED=true > "ci-reports/status-report.txt"
    
    # Generate deployment readiness report
    print_status "Generating deployment readiness report..."
    {
        echo "Deployment Readiness Report"
        echo "=========================="
        echo "Generated at: $(date)"
        echo ""
        echo "Environment: $CI_ENV"
        echo "Workflow: $WORKFLOW"
        echo ""
        echo "Component Status:"
        ./scripts/status.sh | grep -E "(✅|⚠️|❌)"
    } > "ci-reports/deployment-readiness.txt"
    
    # Archive reports for CI system
    case "$ci_system" in
        "github-actions")
            if [ -n "$GITHUB_ACTIONS" ]; then
                echo "::set-output name=reports-path::ci-reports"
            fi
            ;;
        *)
            print_status "Reports generated in ci-reports/ directory"
            ;;
    esac
}

# Main CI/CD workflow
run_ci_workflow() {
    local workflow_type=$1
    local ci_system=$(detect_ci_environment)
    
    print_status "Running CI workflow: $workflow_type"
    print_status "CI System: $ci_system"
    
    setup_ci_environment "$ci_system"
    
    # Create CI log
    CI_LOG="ci-reports/$(date +%Y%m%d_%H%M%S)_ci.log"
    mkdir -p ci-reports
    echo "CI run started at $(date)" > "$CI_LOG"
    echo "Environment: $CI_ENV" >> "$CI_LOG"
    echo "Workflow: $workflow_type" >> "$CI_LOG"
    echo "CI System: $ci_system" >> "$CI_LOG"
    echo "---" >> "$CI_LOG"
    
    case "$workflow_type" in
        "lint")
            if run_ecosystem_linting 2>&1 | tee -a "$CI_LOG"; then
                print_success "Linting workflow completed successfully"
                exit 0
            else
                print_error "Linting workflow failed"
                exit 1
            fi
            ;;
        "test")
            if [ "$SKIP_TESTS" = "false" ]; then
                if ./scripts/test.sh --env "$CI_ENV" 2>&1 | tee -a "$CI_LOG"; then
                    print_success "Test workflow completed successfully"
                    exit 0
                else
                    print_error "Test workflow failed"
                    exit 1
                fi
            else
                print_warning "Tests skipped"
            fi
            ;;
        "security")
            if run_security_checks 2>&1 | tee -a "$CI_LOG"; then
                print_success "Security workflow completed successfully"
                exit 0
            else
                print_error "Security workflow failed"
                exit 1
            fi
            ;;
        "deploy")
            if ./scripts/deploy.sh DEPLOY_ENV="$CI_ENV" SKIP_CONFIRMATIONS=true 2>&1 | tee -a "$CI_LOG"; then
                print_success "Deployment workflow completed successfully"
                exit 0
            else
                print_error "Deployment workflow failed"
                exit 1
            fi
            ;;
        "full")
            # Full workflow: lint -> security -> test -> deploy (optional)
            local step_failed=false
            
            print_status "STEP 1: Linting"
            if ! run_ecosystem_linting 2>&1 | tee -a "$CI_LOG"; then
                print_error "Linting failed"
                step_failed=true
            fi
            
            print_status "STEP 2: Security Checks"
            if ! run_security_checks 2>&1 | tee -a "$CI_LOG"; then
                print_error "Security checks failed"
                step_failed=true
            fi
            
            if [ "$SKIP_TESTS" = "false" ]; then
                print_status "STEP 3: Testing"
                if ! ./scripts/test.sh --env "$CI_ENV" 2>&1 | tee -a "$CI_LOG"; then
                    print_error "Tests failed"
                    step_failed=true
                fi
            fi
            
            if [ "$DEPLOY_ON_SUCCESS" = "true" ] && [ "$step_failed" = "false" ]; then
                print_status "STEP 4: Deployment"
                if ! ./scripts/deploy.sh DEPLOY_ENV="$CI_ENV" SKIP_CONFIRMATIONS=true 2>&1 | tee -a "$CI_LOG"; then
                    print_error "Deployment failed"
                    step_failed=true
                fi
            fi
            
            generate_reports "$ci_system"
            
            if [ "$step_failed" = "true" ]; then
                print_error "Full workflow failed"
                exit 1
            else
                print_success "Full workflow completed successfully"
                exit 0
            fi
            ;;
        *)
            print_error "Unknown workflow: $workflow_type"
            exit 1
            ;;
    esac
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --workflow)
            WORKFLOW="$2"
            shift 2
            ;;
        --env)
            CI_ENV="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --deploy-on-success)
            DEPLOY_ON_SUCCESS=true
            shift
            ;;
        *)
            WORKFLOW="$1"
            shift
            ;;
    esac
done

# Run the CI workflow
run_ci_workflow "$WORKFLOW"