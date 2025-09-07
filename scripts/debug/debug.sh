#!/bin/bash

# =============================================================================
# PANAS TOKEN ECOSYSTEM - DEBUG SCRIPT
# Panacea | Icono SA
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT"

# Default values
DEBUG_TYPE="all"
VERBOSE=false
OUTPUT_FILE=""

# =============================================================================
# FUNCTIONS
# =============================================================================

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

show_help() {
    cat << EOF
🐛 Panas Token Ecosystem - Debug Script

Usage: $0 [OPTIONS]

Options:
    -t, --type TYPE          Debug type (system|app|bots|all) [default: all]
    -v, --verbose            Verbose output
    -o, --output FILE        Output to file
    -h, --help               Show this help message

Examples:
    $0                                    # Debug everything
    $0 -t system                          # Debug system only
    $0 -t bots -v                         # Debug bots with verbose output
    $0 -t app -o debug.log                # Debug app and save to file

EOF
}

# =============================================================================
# SYSTEM DEBUG
# =============================================================================

debug_system() {
    log "🔍 Debugging system..."

    echo "=== SYSTEM INFORMATION ==="
    echo "OS: $(uname -a)"
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    echo "Docker: $(docker --version 2>/dev/null || echo 'Not installed')"
    echo "Git: $(git --version)"
    echo ""

    echo "=== MEMORY USAGE ==="
    if command -v free &> /dev/null; then
        free -h
    else
        # macOS alternative
        vm_stat | head -10
    fi
    echo ""

    echo "=== DISK USAGE ==="
    df -h
    echo ""

    echo "=== PROCESSES ==="
    ps aux | grep -E "(node|npm|docker)" | grep -v grep
    echo ""

    success "System debug completed"
}

# =============================================================================
# APPLICATION DEBUG
# =============================================================================

debug_app() {
    log "🔍 Debugging application..."

    echo "=== PACKAGE.JSON ==="
    if [ -f "package.json" ]; then
        echo "Name: $(jq -r '.name' package.json)"
        echo "Version: $(jq -r '.version' package.json)"
        echo "Scripts:"
        jq -r '.scripts | to_entries[] | "  \(.key): \(.value)"' package.json
    else
        warning "package.json not found"
    fi
    echo ""

    echo "=== DEPENDENCIES ==="
    if [ -f "package-lock.json" ]; then
        echo "Dependencies installed: $(jq -r '.dependencies | length' package.json)"
        echo "Dev dependencies: $(jq -r '.devDependencies | length' package.json)"
    else
        warning "package-lock.json not found"
    fi
    echo ""

    echo "=== ENVIRONMENT FILES ==="
    for file in .env*; do
        if [ -f "$file" ]; then
            echo "Found: $file"
            if [ "$VERBOSE" = true ]; then
                echo "  Variables: $(grep -c '=' "$file" || echo '0')"
            fi
        fi
    done
    echo ""

    echo "=== BUILD ARTIFACTS ==="
    if [ -d "dist" ]; then
        echo "dist/ directory exists"
        echo "  Files: $(find dist -type f | wc -l)"
    else
        warning "dist/ directory not found"
    fi

    if [ -d "build" ]; then
        echo "build/ directory exists"
        echo "  Files: $(find build -type f | wc -l)"
    else
        warning "build/ directory not found"
    fi
    echo ""

    success "Application debug completed"
}

# =============================================================================
# TELEGRAM BOTS DEBUG
# =============================================================================

debug_bots() {
    log "🔍 Debugging Telegram bots..."

    echo "=== BOT CONFIGURATION ==="
    if [ -f "config/bots.config.json" ]; then
        echo "Total bots configured: $(jq -r '.bots | length' config/bots.config.json)"
        echo "Bots with publisher: $(jq -r '.bots[] | select(.modules.publisher == true) | .name' config/bots.config.json | wc -l)"
        echo "Bots with AI: $(jq -r '.bots[] | select(.modules.ai_openai == true) | .name' config/bots.config.json | wc -l)"
    else
        warning "config/bots.config.json not found"
    fi
    echo ""

    echo "=== BOT TOKENS ==="
    if [ -f ".env.telegram.local" ]; then
        echo "Bot tokens found: $(grep -c 'BOT_.*_TOKEN' .env.telegram.local || echo '0')"
        if [ "$VERBOSE" = true ]; then
            echo "Token variables:"
            grep 'BOT_.*_TOKEN' .env.telegram.local | cut -d'=' -f1
        fi
    else
        warning ".env.telegram.local not found"
    fi
    echo ""

    echo "=== BOT VALIDATION ==="
    if command -v npm &> /dev/null; then
        npm run bots:validate 2>/dev/null || warning "Bot validation failed"
    else
        warning "npm not available for bot validation"
    fi
    echo ""

    success "Telegram bots debug completed"
}

# =============================================================================
# DOCKER DEBUG
# =============================================================================

debug_docker() {
    log "🔍 Debugging Docker..."

    if ! command -v docker &> /dev/null; then
        warning "Docker not installed"
        return
    fi

    echo "=== DOCKER VERSION ==="
    docker --version
    docker-compose --version
    echo ""

    echo "=== DOCKER IMAGES ==="
    docker images | grep panas-token || echo "No panas-token images found"
    echo ""

    echo "=== DOCKER CONTAINERS ==="
    docker ps -a | grep panas || echo "No panas containers found"
    echo ""

    echo "=== DOCKER COMPOSE ==="
    if [ -f "docker-compose.yml" ]; then
        echo "docker-compose.yml found"
        if [ "$VERBOSE" = true ]; then
            echo "Services:"
            docker-compose config --services
        fi
    else
        warning "docker-compose.yml not found"
    fi
    echo ""

    success "Docker debug completed"
}

# =============================================================================
# LOG ANALYSIS
# =============================================================================

analyze_logs() {
    log "🔍 Analyzing logs..."

    echo "=== LOG FILES ==="
    if [ -d "logs" ]; then
        echo "Log directory exists"
        echo "Log files:"
        find logs -name "*.log" -type f | head -10
    else
        warning "logs/ directory not found"
    fi
    echo ""

    echo "=== RECENT ERRORS ==="
    if [ -d "logs" ]; then
        find logs -name "*.log" -type f -exec grep -l "ERROR\|error\|Error" {} \; | head -5 | while read -r file; do
            echo "Errors in $file:"
            grep -n "ERROR\|error\|Error" "$file" | tail -5
        done
    fi
    echo ""

    success "Log analysis completed"
}

# =============================================================================
# OUTPUT HANDLING
# =============================================================================

setup_output() {
    if [ -n "$OUTPUT_FILE" ]; then
        exec > >(tee -a "$OUTPUT_FILE")
        exec 2>&1
        log "Output will be saved to: $OUTPUT_FILE"
    fi
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    log "🐛 Starting debug process..."

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--type)
                DEBUG_TYPE="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -o|--output)
                OUTPUT_FILE="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done

    # Setup output
    setup_output

    # Validate debug type
    case $DEBUG_TYPE in
        system|app|bots|docker|logs|all)
            log "Debug type: $DEBUG_TYPE"
            ;;
        *)
            error "Invalid debug type: $DEBUG_TYPE. Use system, app, bots, docker, logs, or all"
            ;;
    esac

    # Run debug functions
    case $DEBUG_TYPE in
        system)
            debug_system
            ;;
        app)
            debug_app
            ;;
        bots)
            debug_bots
            ;;
        docker)
            debug_docker
            ;;
        logs)
            analyze_logs
            ;;
        all)
            debug_system
            debug_app
            debug_bots
            debug_docker
            analyze_logs
            ;;
    esac

    success "🎉 Debug completed successfully!"
}

# Run main function
main "$@"
