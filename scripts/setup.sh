#!/bin/bash

# Panas Token Ecosystem Integration Setup Script
# This script initializes the ecosystem repositories and sets up the development environment

set -e

echo "🌐 Panas Token Ecosystem - Integration Setup"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install git and try again."
    exit 1
fi

print_status "Initializing Git submodules..."

# Initialize and update all submodules
if [ -f ".gitmodules" ]; then
    print_status "Found .gitmodules file, initializing submodules..."
    
    # Initialize submodules
    git submodule init
    
    # Update submodules (this will clone the repositories if they don't exist)
    git submodule update --init --recursive
    
    print_success "Submodules initialized successfully!"
    
    # List initialized submodules
    print_status "Initialized submodules:"
    git submodule status
    
else
    print_warning "No .gitmodules file found. Please ensure .gitmodules exists."
    exit 1
fi

# Create ecosystem directory if it doesn't exist
if [ ! -d "ecosystem" ]; then
    print_status "Creating ecosystem directory..."
    mkdir -p ecosystem
fi

# Check if submodules are properly cloned
print_status "Verifying submodule directories..."
for dir in ecosystem/*/; do
    if [ -d "$dir" ]; then
        print_success "Found: $dir"
    else
        print_warning "Missing: $dir"
    fi
done

print_status "Running setup scripts for each ecosystem component..."

# Function to run setup script if it exists
run_setup_if_exists() {
    local module_path=$1
    local module_name=$2
    
    if [ -d "$module_path" ]; then
        print_status "Setting up $module_name..."
        cd "$module_path"
        
        # Look for common setup scripts
        if [ -f "setup.sh" ]; then
            print_status "Running setup.sh for $module_name"
            chmod +x setup.sh
            ./setup.sh
        elif [ -f "install.sh" ]; then
            print_status "Running install.sh for $module_name"
            chmod +x install.sh
            ./install.sh
        elif [ -f "package.json" ]; then
            print_status "Running npm install for $module_name"
            npm install
        elif [ -f "requirements.txt" ]; then
            print_status "Running pip install for $module_name"
            pip install -r requirements.txt
        elif [ -f "Cargo.toml" ]; then
            print_status "Running cargo build for $module_name"
            cargo build
        else
            print_warning "No setup script found for $module_name"
        fi
        
        cd - > /dev/null
        print_success "$module_name setup completed"
    else
        print_warning "$module_name directory not found: $module_path"
    fi
}

# Setup each ecosystem component
run_setup_if_exists "ecosystem/ton-contracts" "TON Contracts"
run_setup_if_exists "ecosystem/solana-contracts" "Solana Contracts"  
run_setup_if_exists "ecosystem/algorand-contracts" "Algorand Contracts"
run_setup_if_exists "ecosystem/bsc-contracts" "BSC Contracts"
run_setup_if_exists "ecosystem/gs-token" "GS Token"
run_setup_if_exists "ecosystem/vaser-token" "VASER Token"
run_setup_if_exists "ecosystem/kuchi-token" "KUCHI Token"
run_setup_if_exists "ecosystem/nf-domains" "NF Domains"
run_setup_if_exists "ecosystem/router-backend" "Router Backend"
run_setup_if_exists "ecosystem/dashboard" "Dashboard"
run_setup_if_exists "ecosystem/telegram-bot" "Telegram Bot"

print_success "🎉 Ecosystem setup completed!"
echo ""
echo "Next steps:"
echo "1. Review the ecosystem/ directory structure"
echo "2. Run ./scripts/deploy.sh to deploy contracts"
echo "3. Run ./scripts/test.sh to run integration tests"
echo "4. Check ./scripts/status.sh for ecosystem status"