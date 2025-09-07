#!/usr/bin/env node

/**
 * =============================================================================
 * SECURE ENCRYPTION UTILITY - PANAS TOKEN ECOSYSTEM
 * =============================================================================
 * Utilidad para encriptar información sensible de wallets
 * ⚠️  ADVERTENCIA: Solo usar en entornos seguros
 * =============================================================================
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SecureEncryption {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;
    }

    /**
     * Genera una clave de encriptación segura
     */
    generateKey() {
        return crypto.randomBytes(this.keyLength);
    }

    /**
     * Genera un IV (Initialization Vector) seguro
     */
    generateIV() {
        return crypto.randomBytes(this.ivLength);
    }

    /**
     * Encripta un texto usando AES-256-GCM
     */
    encrypt(text, key) {
        const iv = this.generateIV();
        const cipher = crypto.createCipher(this.algorithm, key);
        cipher.setAAD(Buffer.from('panas-token-ecosystem', 'utf8'));
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const tag = cipher.getAuthTag();
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            tag: tag.toString('hex')
        };
    }

    /**
     * Desencripta un texto usando AES-256-GCM
     */
    decrypt(encryptedData, key) {
        const decipher = crypto.createDecipher(this.algorithm, key);
        decipher.setAAD(Buffer.from('panas-token-ecosystem', 'utf8'));
        decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    /**
     * Encripta mnemónicos de forma segura
     */
    encryptMnemonic(mnemonic, key) {
        if (!mnemonic || typeof mnemonic !== 'string') {
            throw new Error('Mnemónico inválido');
        }

        const words = mnemonic.split(' ');
        if (words.length !== 12 && words.length !== 24) {
            throw new Error('Mnemónico debe tener 12 o 24 palabras');
        }

        return this.encrypt(mnemonic, key);
    }

    /**
     * Encripta claves privadas de forma segura
     */
    encryptPrivateKey(privateKey, key) {
        if (!privateKey || typeof privateKey !== 'string') {
            throw new Error('Clave privada inválida');
        }

        return this.encrypt(privateKey, key);
    }

    /**
     * Crea un archivo de configuración encriptado
     */
    createEncryptedConfig(walletData, outputPath, key) {
        const encryptedData = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            wallets: {}
        };

        for (const [walletId, wallet] of Object.entries(walletData)) {
            encryptedData.wallets[walletId] = {
                name: wallet.name,
                id: wallet.id,
                addresses: wallet.addresses,
                accessToken: wallet.accessToken ? this.encrypt(wallet.accessToken, key) : null,
                tokenUrl: wallet.tokenUrl,
                telegramChannel: wallet.telegramChannel,
                securityLevel: wallet.securityLevel,
                createdAt: wallet.createdAt
            };

            // Encriptar mnemónicos si existen
            if (wallet.mnemonic) {
                encryptedData.wallets[walletId].encryptedMnemonic = this.encryptMnemonic(wallet.mnemonic, key);
            }

            // Encriptar claves privadas si existen
            if (wallet.privateKey) {
                encryptedData.wallets[walletId].encryptedPrivateKey = this.encryptPrivateKey(wallet.privateKey, key);
            }
        }

        // Guardar archivo encriptado
        const securePath = path.resolve(outputPath);
        const dir = path.dirname(securePath);
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(securePath, JSON.stringify(encryptedData, null, 2));
        
        // Guardar clave de encriptación por separado (en producción usar HSM)
        const keyPath = securePath.replace('.json', '.key');
        fs.writeFileSync(keyPath, key.toString('hex'));
        
        console.log(`✅ Configuración encriptada guardada en: ${securePath}`);
        console.log(`🔑 Clave de encriptación guardada en: ${keyPath}`);
        console.log(`⚠️  IMPORTANTE: Mantener la clave de encriptación en lugar seguro`);
        
        return { configPath: securePath, keyPath };
    }

    /**
     * Valida la seguridad de una configuración
     */
    validateSecurity(config) {
        const issues = [];
        
        for (const [walletId, wallet] of Object.entries(config.wallets)) {
            // Verificar que no hay mnemónicos en texto plano
            if (wallet.mnemonic && !wallet.encryptedMnemonic) {
                issues.push(`Wallet ${walletId}: Mnemónico en texto plano detectado`);
            }
            
            // Verificar que no hay claves privadas en texto plano
            if (wallet.privateKey && !wallet.encryptedPrivateKey) {
                issues.push(`Wallet ${walletId}: Clave privada en texto plano detectada`);
            }
            
            // Verificar nivel de seguridad
            if (wallet.securityLevel !== 'HIGH') {
                issues.push(`Wallet ${walletId}: Nivel de seguridad bajo (${wallet.securityLevel})`);
            }
        }
        
        return {
            isValid: issues.length === 0,
            issues,
            recommendations: [
                'Usar encriptación AES-256-GCM para todos los datos sensibles',
                'Almacenar claves de encriptación en HSM o servicio de gestión de secretos',
                'Implementar rotación de claves regular',
                'Usar autenticación multifactor para acceso a wallets',
                'Auditar accesos regularmente'
            ]
        };
    }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

if (require.main === module) {
    const encryption = new SecureEncryption();
    const command = process.argv[2];

    switch (command) {
        case 'encrypt':
            const mnemonic = process.argv[3];
            const key = process.argv[4] || encryption.generateKey();
            
            if (!mnemonic) {
                console.error('❌ Error: Especifica el mnemónico a encriptar');
                process.exit(1);
            }
            
            try {
                const encrypted = encryption.encryptMnemonic(mnemonic, Buffer.from(key, 'hex'));
                console.log('🔐 Mnemónico encriptado:');
                console.log(JSON.stringify(encrypted, null, 2));
            } catch (error) {
                console.error(`❌ Error: ${error.message}`);
                process.exit(1);
            }
            break;

        case 'decrypt':
            const encryptedData = process.argv[3];
            const decryptKey = process.argv[4];
            
            if (!encryptedData || !decryptKey) {
                console.error('❌ Error: Especifica los datos encriptados y la clave');
                process.exit(1);
            }
            
            try {
                const data = JSON.parse(encryptedData);
                const decrypted = encryption.decrypt(data, Buffer.from(decryptKey, 'hex'));
                console.log('🔓 Datos desencriptados:');
                console.log(decrypted);
            } catch (error) {
                console.error(`❌ Error: ${error.message}`);
                process.exit(1);
            }
            break;

        case 'validate':
            const configPath = process.argv[3];
            
            if (!configPath) {
                console.error('❌ Error: Especifica la ruta del archivo de configuración');
                process.exit(1);
            }
            
            try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                const validation = encryption.validateSecurity(config);
                
                console.log('🔍 Validación de Seguridad:');
                console.log(`Estado: ${validation.isValid ? '✅ Seguro' : '❌ Inseguro'}`);
                
                if (validation.issues.length > 0) {
                    console.log('\n⚠️  Problemas encontrados:');
                    validation.issues.forEach(issue => console.log(`  - ${issue}`));
                }
                
                console.log('\n💡 Recomendaciones:');
                validation.recommendations.forEach(rec => console.log(`  - ${rec}`));
                
            } catch (error) {
                console.error(`❌ Error: ${error.message}`);
                process.exit(1);
            }
            break;

        default:
            console.log(`
🔐 Secure Encryption Utility - Panas Token Ecosystem

Uso: node secure-encrypt.js <comando> [argumentos]

Comandos disponibles:
  encrypt <mnemonic> [key]     Encripta un mnemónico
  decrypt <data> <key>         Desencripta datos
  validate <config-path>       Valida seguridad de configuración

Ejemplos:
  node secure-encrypt.js encrypt "vague stove piece lake federal help park harvest sphere shaft tape copper"
  node secure-encrypt.js validate ./secure-wallet-config.json
            `);
    }
}

module.exports = SecureEncryption;
