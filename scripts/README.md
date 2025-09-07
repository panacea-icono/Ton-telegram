# Panas Token Ecosystem Integration Scripts

This directory contains integration scripts for managing the Panas Token ecosystem across multiple blockchain networks and repositories.

## Available Scripts

### 🚀 Setup & Initialization
- **`setup.sh`** - Initialize the ecosystem and set up all submodules
- **`update.sh`** - Update all submodules and dependencies

### 📊 Monitoring & Status  
- **`status.sh`** - Check the status of all ecosystem components
- **`test.sh`** - Run integration tests across the ecosystem

### 🔄 Deployment
- **`deploy.sh`** - Deploy contracts and services across all chains
- **`ci-cd.sh`** - CI/CD integration for automated workflows

## Quick Start

```bash
# Initialize the ecosystem
./scripts/setup.sh

# Check ecosystem status
./scripts/status.sh

# Run tests
./scripts/test.sh

# Deploy to testnet
DEPLOY_ENV=testnet ./scripts/deploy.sh

# Update everything
./scripts/update.sh
```

## Environment Variables

### Common Variables
- `DEPLOY_ENV` - Target environment (testnet/mainnet)
- `SKIP_CONFIRMATIONS` - Skip deployment confirmations (true/false)
- `DETAILED` - Show detailed status information (true/false)

### CI/CD Variables
- `CI_ENV` - CI environment identifier
- `WORKFLOW` - Workflow type (lint/test/security/deploy/full)
- `SKIP_TESTS` - Skip tests in CI (true/false)
- `DEPLOY_ON_SUCCESS` - Deploy after successful tests (true/false)

## Ecosystem Components

The scripts manage the following ecosystem repositories:

### Core Contracts
- **ton-contracts** - TON/Jetton token contracts
- **solana-contracts** - Solana SPL token contracts  
- **algorand-contracts** - Algorand ASA token contracts
- **bsc-contracts** - BSC BEP-20 token contracts

### Supporting Tokens
- **gs-token** - SMART GLOBAL TOKEN (Solana Token 2022)
- **vaser-token** - VASER TOKEN (Solana SPL)
- **kuchi-token** - Kuchicoin (BSC BEP-20)

### Infrastructure
- **nf-domains** - NF Domains integration for Algorand
- **router-backend** - Multi-chain payment router
- **dashboard** - Ecosystem dashboard and analytics
- **telegram-bot** - Telegram integration for payments

## Usage Examples

### Development Workflow
```bash
# Setup development environment
./scripts/setup.sh

# Check status with details
DETAILED=true ./scripts/status.sh

# Run specific test suite
TEST_SUITE=contracts ./scripts/test.sh

# Deploy to testnet
DEPLOY_ENV=testnet ./scripts/deploy.sh
```

### CI/CD Integration
```bash
# Run linting workflow
./scripts/ci-cd.sh lint

# Run full CI pipeline
DEPLOY_ON_SUCCESS=true ./scripts/ci-cd.sh full

# Security audit only
./scripts/ci-cd.sh security
```

### Maintenance
```bash
# Update all submodules and dependencies
./scripts/update.sh

# Force update without confirmation
FORCE_UPDATE=true ./scripts/update.sh

# Update without dependencies
UPDATE_DEPS=false ./scripts/update.sh
```

## File Structure

```
scripts/
├── setup.sh          # Ecosystem initialization
├── deploy.sh          # Multi-chain deployment  
├── test.sh            # Integration testing
├── status.sh          # Status monitoring
├── update.sh          # Update management
├── ci-cd.sh           # CI/CD workflows
└── README.md          # This file

ecosystem/             # Git submodules (created by setup.sh)
├── ton-contracts/     
├── solana-contracts/  
├── algorand-contracts/
├── bsc-contracts/     
├── gs-token/          
├── vaser-token/       
├── kuchi-token/       
├── nf-domains/        
├── router-backend/    
├── dashboard/         
└── telegram-bot/      

deployments/           # Deployment logs
test-results/          # Test results  
ci-reports/            # CI/CD reports
updates/               # Update logs
```

## Integration with Git Submodules

The scripts work with the `.gitmodules` file to manage ecosystem repositories as submodules. This allows:

- **Unified versioning** - Track specific versions of each component
- **Coordinated updates** - Update all components together
- **Simplified development** - One command to set up the entire ecosystem
- **CI/CD integration** - Automated testing and deployment across all components

## Error Handling

All scripts include comprehensive error handling:
- ✅ Colored output for clear status indication
- 📝 Detailed logging of all operations
- ⚠️ Graceful handling of missing components
- 🛑 Safe failure modes that don't break the ecosystem

## Contributing

When adding new ecosystem components:

1. Add the submodule to `.gitmodules`
2. Update the relevant scripts to include the new component
3. Ensure the component follows standard conventions:
   - `setup.sh` or `install.sh` for initialization
   - `deploy.sh` or deployment scripts
   - `test.sh` or standard testing commands
   - `status.sh` for health checks

## Security

- Scripts check for potential secrets in code
- Dependencies are audited for vulnerabilities  
- All operations are logged for audit trails
- Confirmations required for destructive operations (unless skipped)