# Panas Token Ecosystem - Integration Documentation

## Overview

This repository contains the integration scripts and configuration for the **Panas Token Ecosystem**, a multichain payment infrastructure for the medical and aesthetic surgery sector developed by **Panacea | Icono SA**.

## 🌐 Ecosystem Architecture

The Panas Token ecosystem spans multiple blockchain networks:

### Primary Networks
- **TON (The Open Network)** - Primary deployment as Jetton for Telegram Wallet integration
- **Solana** - SPL token for DeFi interoperability  
- **Algorand** - ASA token with NF Domains for human-readable addresses
- **BSC (Binance Smart Chain)** - BEP-20 token for liquidity ramps

### Integrated Tokens
- **GS Token** - SMART GLOBAL TOKEN (Solana Token 2022)
- **VASER Token** - VASER TOKEN (Solana SPL)  
- **KUCHI Token** - Kuchicoin (BSC BEP-20)

## 🚀 Quick Start

### 1. Initialize the Ecosystem
```bash
# Clone this repository
git clone https://github.com/panacea-icono/Ton-telegram.git
cd Ton-telegram

# Initialize all ecosystem repositories  
./scripts/setup.sh
```

### 2. Configure Environment
```bash
# Copy and customize the environment configuration
cp config/ecosystem.env .env
# Edit .env with your specific configuration

# Load the configuration
source .env
```

### 3. Check Status
```bash
# Check the status of all components
./scripts/status.sh

# Get detailed status
DETAILED=true ./scripts/status.sh
```

### 4. Run Tests
```bash
# Run integration tests
./scripts/test.sh

# Run specific test suite
TEST_SUITE=contracts ./scripts/test.sh
```

### 5. Deploy (Testnet)
```bash
# Deploy to testnet
DEPLOY_ENV=testnet ./scripts/deploy.sh

# Deploy to mainnet (production)
DEPLOY_ENV=mainnet ./scripts/deploy.sh
```

## 📁 Repository Structure

```
Ton-telegram/
├── .gitmodules              # Git submodules configuration
├── config/
│   └── ecosystem.env        # Environment configuration template
├── scripts/
│   ├── setup.sh            # Ecosystem initialization
│   ├── deploy.sh           # Multi-chain deployment
│   ├── test.sh             # Integration testing
│   ├── status.sh           # Status monitoring
│   ├── update.sh           # Update management
│   ├── ci-cd.sh            # CI/CD workflows
│   └── README.md           # Scripts documentation
├── ecosystem/              # Git submodules (created by setup.sh)
│   ├── ton-contracts/      # TON Jetton contracts
│   ├── solana-contracts/   # Solana SPL contracts
│   ├── algorand-contracts/ # Algorand ASA contracts
│   ├── bsc-contracts/      # BSC BEP-20 contracts
│   ├── gs-token/           # GS Token integration
│   ├── vaser-token/        # VASER Token integration
│   ├── kuchi-token/        # KUCHI Token integration
│   ├── nf-domains/         # NF Domains for Algorand
│   ├── router-backend/     # Multi-chain router
│   ├── dashboard/          # Analytics dashboard
│   └── telegram-bot/       # Telegram integration
├── deployments/            # Deployment logs
├── test-results/           # Test results
├── ci-reports/            # CI/CD reports
└── updates/               # Update logs
```

## 🔧 Integration Scripts

### Core Scripts
- **`setup.sh`** - Initializes git submodules and sets up the development environment
- **`deploy.sh`** - Deploys contracts across all supported chains
- **`test.sh`** - Runs comprehensive integration tests
- **`status.sh`** - Monitors ecosystem health and component status
- **`update.sh`** - Updates all submodules and dependencies
- **`ci-cd.sh`** - Provides CI/CD automation workflows

### Usage Examples
```bash
# Full ecosystem setup
./scripts/setup.sh

# Deploy to testnet with confirmation
DEPLOY_ENV=testnet ./scripts/deploy.sh

# Run only contract tests
TEST_SUITE=contracts ./scripts/test.sh

# Update everything without confirmation
FORCE_UPDATE=true ./scripts/update.sh

# CI/CD: Run full workflow with deployment
DEPLOY_ON_SUCCESS=true ./scripts/ci-cd.sh full
```

## 🌍 Multi-Chain Configuration

### TON Configuration
```bash
export TON_NETWORK="testnet"
export TON_API_ENDPOINT="https://testnet.toncenter.com/api/v2"
```

### Solana Configuration  
```bash
export SOLANA_NETWORK="testnet"
export SOLANA_RPC_URL="https://api.testnet.solana.com"
```

### Algorand Configuration
```bash
export ALGORAND_NETWORK="testnet" 
export ALGORAND_NODE_URL="https://testnet-api.algonode.cloud"
```

### BSC Configuration
```bash
export BSC_NETWORK="testnet"
export BSC_RPC_URL="https://data-seed-prebsc-1-s1.binance.org:8545"
```

## 🎯 Token Information

### PANAS Token
- **Total Supply**: 100,000,000 PANAS
- **Decimals**: TON(9), Solana(6), Algorand(6), BSC(18)
- **Purpose**: Primary payment token for medical services

### NF Domains (Algorand)
Pre-registered domains for ecosystem wallets:
- `panas.algo` - Main project wallet
- `pay.algo` - Payment router
- `treasury.algo` - Treasury multisig
- `clinic.algo` - General clinic payments
- `doctor.algo` - Doctor payments

### Integration Tokens
- **GS Token**: `A1keUDicm5qfjjpjwhabK5EqVtBkkcdWGVjDXMqvbZ3w` (Solana Token 2022)
- **VASER Token**: `FrsW6JC2Em2iEjNyKtEmFpw5jRdjcuZ1Gbx4kAK4xX1S` (Solana SPL)
- **KUCHI Token**: `0x21b227d8085b4522805b6ad6c83...82068baa91` (BSC BEP-20)

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Panas Ecosystem CI/CD
on: [push, pull_request]
jobs:
  ecosystem-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive
      - name: Setup Ecosystem
        run: ./scripts/setup.sh
      - name: Run Tests  
        run: ./scripts/test.sh
      - name: Deploy to Testnet
        if: github.ref == 'refs/heads/main'
        run: DEPLOY_ENV=testnet SKIP_CONFIRMATIONS=true ./scripts/deploy.sh
```

### Available CI/CD Workflows
```bash
./scripts/ci-cd.sh lint      # Linting only
./scripts/ci-cd.sh test      # Testing only  
./scripts/ci-cd.sh security  # Security audit only
./scripts/ci-cd.sh deploy    # Deployment only
./scripts/ci-cd.sh full      # Complete pipeline
```

## 🛠 Development Workflow

### 1. Development Setup
```bash
git clone --recursive https://github.com/panacea-icono/Ton-telegram.git
cd Ton-telegram
./scripts/setup.sh
source config/ecosystem.env
```

### 2. Make Changes
- Edit code in the appropriate `ecosystem/` submodule
- Commit changes in the submodule
- Update the main repository to reference the new commit

### 3. Test Changes
```bash
./scripts/test.sh
./scripts/status.sh
```

### 4. Update Dependencies
```bash
./scripts/update.sh
```

### 5. Deploy
```bash
DEPLOY_ENV=testnet ./scripts/deploy.sh
```

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Basic status check
./scripts/status.sh

# Detailed status with component info
DETAILED=true ./scripts/status.sh

# Check specific environment
STATUS_ENV=mainnet ./scripts/status.sh
```

### Log Management
All operations are logged to timestamped files:
- `deployments/` - Deployment logs
- `test-results/` - Test execution results
- `ci-reports/` - CI/CD pipeline reports
- `updates/` - Update and maintenance logs

## 🔐 Security Considerations

### Private Key Management
- Never commit private keys or mnemonics to the repository
- Use environment variables or secure secret management
- Different keys for different environments (testnet/mainnet)

### Access Control
- Multisig wallets for treasury and authority functions
- Separate deployment keys with limited permissions
- Regular key rotation for production environments

### Audit Trail
- All deployments are logged with timestamps
- Git submodules provide version tracking
- Integration tests validate security properties

## 🆘 Troubleshooting

### Common Issues

#### Submodule Not Found
```bash
# Re-initialize submodules
git submodule update --init --recursive
```

#### Deployment Fails
```bash
# Check network connectivity
./scripts/status.sh

# Verify environment configuration
source config/ecosystem.env && validate_env
```

#### Tests Fail
```bash
# Run specific test suite
TEST_SUITE=integration ./scripts/test.sh

# Check test logs
tail -f test-results/latest.txt
```

### Getting Help
1. Check script logs in respective directories
2. Run status script with detailed output: `DETAILED=true ./scripts/status.sh`
3. Verify environment configuration: `source config/ecosystem.env && show_config`
4. Check individual component README files in `ecosystem/` directories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes to the appropriate submodule
4. Test changes with `./scripts/test.sh`
5. Submit a pull request

## 📄 License

This project is developed by **Panacea | Icono SA** for the medical and aesthetic surgery ecosystem.

## 📞 Contact

- **Company**: Panacea | Icono SA
- **Project**: Panas Token Ecosystem  
- **Email**: info@iconosa.com
- **Telegram**: [Bot oficial Panas Token — en desarrollo]

---

**Panacea | Icono SA** - Blockchain Medical Solutions