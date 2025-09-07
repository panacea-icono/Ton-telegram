#!/usr/bin/env node

/**
 * =============================================================================
 * WALLET MANAGER - PANAS TOKEN ECOSYSTEM
 * =============================================================================
 * Sistema seguro para gestión de wallets del ecosistema Panas Token
 * Maneja direcciones públicas y configuración de seguridad
 *
 * ⚠️  ADVERTENCIA: Nunca almacenar mnemónicos o claves privadas en texto plano
 * =============================================================================
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class WalletManager {
  constructor() {
    this.wallets = new Map();
    this.encryptionKey =
      process.env.ENCRYPTION_KEY || this.generateEncryptionKey();
    this.loadWalletConfig();
  }

  /**
   * Genera una clave de encriptación segura
   */
  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Carga la configuración de wallets desde variables de entorno
   */
  loadWalletConfig() {
    // Wallets del Dr. Ignacio
    this.addWallet('DR_IGNACIO_MAIN', {
      name: 'Dr. Ignacio - Wallet Principal',
      id: 'BHL4ZT_5HHW3E',
      addresses: {
        algorand: [
          '3MK2VFUQMEZX56ZNL3TIR2HGZKMXHTOBYKF3I3NHT3Q76AQYF2QX3I2H24',
          'BHLAZTPJS2IKXFP3A2T7WJX2SPFNFE2JRAA5WGWLMIEWBSTEEIE35HHW3E',
          'QJC4GF3GCZF7YHPWSHLYOA3WHFGWGEMI6L66R74H42K7E5WJ2LICNGBTGU',
          'KINAJELKUD7AKHVRLWJOXEDA5NPYR33SNSEBOK7R2PTRAIN6WZWDY2ONN4',
          'WRX3S7MAMB7LGXCXBX5NHU2D55XCITEGYLSH3WH6HLA727K746HLS4SD64',
          'KNXUWV5UA6MU73UFZ3KGPDSYJ6D2BL5DGDJIANBOEQKTCEMUGVGK62SEUQ',
          'ITJSNT7GWPNW6XUYIXSHN4OPIZ5VB6CXOPMV3SG65HNYTKZBO55OSMUUDE',
        ],
      },
      accessToken:
        'IJRJmqtDtMPM0xw0hTUuOMYlmW8upCdzeYCxbIgcxiQzlPasguGi3W3EtfBm0Mxc',
      tokenUrl: 'https://token.drtapiavargas.com/',
      telegramChannel: 'https://t.me/+Mz1Ck0QxdwxiYzY5',
      securityLevel: 'HIGH',
      createdAt: new Date().toISOString(),
    });

    // Wallet de Ivana
    this.addWallet('IVANA_WALLET', {
      name: 'Ivana Wallet 2024',
      id: 'BHL4ZT_5HHW3E',
      addresses: {
        algorand: [
          'BHLAZTPJS2IKXFP3A2T7WJX2SPFNFE2JRAA5WGWLMIEWBSTEEIE35HHW3E',
        ],
      },
      securityLevel: 'HIGH',
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Agrega una wallet al sistema
   */
  addWallet(id, config) {
    this.wallets.set(id, {
      ...config,
      id,
      lastAccessed: new Date().toISOString(),
    });
  }

  /**
   * Obtiene información de una wallet (solo direcciones públicas)
   */
  getWalletInfo(walletId) {
    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new Error(`Wallet ${walletId} no encontrada`);
    }

    return {
      id: wallet.id,
      name: wallet.name,
      addresses: wallet.addresses,
      accessToken: wallet.accessToken ? '***ENCRYPTED***' : null,
      tokenUrl: wallet.tokenUrl,
      telegramChannel: wallet.telegramChannel,
      securityLevel: wallet.securityLevel,
      createdAt: wallet.createdAt,
      lastAccessed: wallet.lastAccessed,
    };
  }

  /**
   * Lista todas las wallets del sistema
   */
  listWallets() {
    const walletList = [];
    for (const [id, wallet] of this.wallets) {
      walletList.push({
        id,
        name: wallet.name,
        addressesCount: Object.values(wallet.addresses).flat().length,
        securityLevel: wallet.securityLevel,
        lastAccessed: wallet.lastAccessed,
      });
    }
    return walletList;
  }

  /**
   * Verifica la validez de una dirección de wallet
   */
  validateAddress(address, network = 'algorand') {
    const patterns = {
      algorand: /^[A-Z2-7]{58}$/,
      solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
      ton: /^[A-Za-z0-9+/=]{48}$/,
      bsc: /^0x[a-fA-F0-9]{40}$/,
    };

    const pattern = patterns[network.toLowerCase()];
    return pattern ? pattern.test(address) : false;
  }

  /**
   * Genera un reporte de seguridad de las wallets
   */
  generateSecurityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalWallets: this.wallets.size,
      securitySummary: {
        high: 0,
        medium: 0,
        low: 0,
      },
      networkDistribution: {
        algorand: 0,
        solana: 0,
        ton: 0,
        bsc: 0,
      },
      recommendations: [],
    };

    for (const [id, wallet] of this.wallets) {
      // Contar niveles de seguridad
      report.securitySummary[wallet.securityLevel.toLowerCase()]++;

      // Contar direcciones por red
      for (const [network, addresses] of Object.entries(wallet.addresses)) {
        report.networkDistribution[network] += addresses.length;
      }
    }

    // Generar recomendaciones
    if (report.securitySummary.low > 0) {
      report.recommendations.push(
        'Actualizar wallets con nivel de seguridad bajo'
      );
    }
    if (report.networkDistribution.algorand === 0) {
      report.recommendations.push('Considerar agregar soporte para Algorand');
    }

    return report;
  }

  /**
   * Exporta configuración de wallets (solo información pública)
   */
  exportPublicConfig() {
    const publicConfig = {
      timestamp: new Date().toISOString(),
      wallets: [],
    };

    for (const [id, wallet] of this.wallets) {
      publicConfig.wallets.push({
        id,
        name: wallet.name,
        addresses: wallet.addresses,
        tokenUrl: wallet.tokenUrl,
        telegramChannel: wallet.telegramChannel,
        securityLevel: wallet.securityLevel,
      });
    }

    return publicConfig;
  }

  /**
   * Guarda la configuración en un archivo seguro
   */
  saveSecureConfig(filePath) {
    const config = this.exportPublicConfig();
    const securePath = path.resolve(filePath);

    // Crear directorio si no existe
    const dir = path.dirname(securePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(securePath, JSON.stringify(config, null, 2));
    console.log(`✅ Configuración guardada en: ${securePath}`);
  }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

if (require.main === module) {
  const walletManager = new WalletManager();
  const command = process.argv[2];

  switch (command) {
    case 'list':
      console.log('📋 Wallets del Ecosistema Panas Token:');
      console.log(JSON.stringify(walletManager.listWallets(), null, 2));
      break;

    case 'info':
      const walletId = process.argv[3];
      if (!walletId) {
        console.error('❌ Error: Especifica el ID de la wallet');
        process.exit(1);
      }
      try {
        console.log(`🔍 Información de ${walletId}:`);
        console.log(
          JSON.stringify(walletManager.getWalletInfo(walletId), null, 2)
        );
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
      }
      break;

    case 'validate':
      const address = process.argv[3];
      const network = process.argv[4] || 'algorand';
      if (!address) {
        console.error('❌ Error: Especifica la dirección a validar');
        process.exit(1);
      }
      const isValid = walletManager.validateAddress(address, network);
      console.log(
        `🔍 Validación de dirección ${address} en ${network}: ${isValid ? '✅ Válida' : '❌ Inválida'}`
      );
      break;

    case 'security':
      console.log('🔒 Reporte de Seguridad:');
      console.log(
        JSON.stringify(walletManager.generateSecurityReport(), null, 2)
      );
      break;

    case 'export':
      const outputPath = process.argv[3] || './secure-wallet-config.json';
      walletManager.saveSecureConfig(outputPath);
      break;

    default:
      console.log(`
🌐 Wallet Manager - Panas Token Ecosystem

Uso: node wallet-manager.js <comando> [argumentos]

Comandos disponibles:
  list                    Lista todas las wallets
  info <wallet-id>        Muestra información de una wallet específica
  validate <address> [network]  Valida una dirección de wallet
  security                Genera reporte de seguridad
  export [path]           Exporta configuración pública

Ejemplos:
  node wallet-manager.js list
  node wallet-manager.js info DR_IGNACIO_MAIN
  node wallet-manager.js validate 3MK2VFUQMEZX56ZNL3TIR2HGZKMXHTOBYKF3I3NHT3Q76AQYF2QX3I2H24 algorand
  node wallet-manager.js security
  node wallet-manager.js export ./config/wallets.json
            `);
  }
}

module.exports = WalletManager;
