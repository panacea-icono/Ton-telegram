#!/usr/bin/env node

/**
 * =============================================================================
 * VALIDATE LOCAL ENVIRONMENT - PANACEA ICONO SA
 * =============================================================================
 * Script para validar la configuración del entorno local
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

class LocalEnvValidator {
  constructor() {
    this.envFile = './env.local';
    this.requiredVars = [
      'TELEGRAM_BOT_ADMINS',
      'TELEGRAM_OFFICIAL_CHANNEL',
      'TELEGRAM_AUTH_TOKEN',
      'TELEGRAM_API_KEY',
      'FIBONACCI_HEROKU_URL',
      'KUCHIUYAS_ALGORAND_URL',
      'BACKEND_DEVELOPER_URL',
      'API_PANACEA_URL',
      'TON_TELEGRAM_ORQUESTADOR_URL',
      'KUCHIUYAS_EMPRESA_URL',
    ];
  }

  /**
   * Lee el archivo de entorno local
   */
  readEnvFile() {
    try {
      if (!fs.existsSync(this.envFile)) {
        throw new Error(`Archivo ${this.envFile} no encontrado`);
      }
      return fs.readFileSync(this.envFile, 'utf8');
    } catch (error) {
      console.error(`❌ Error leyendo ${this.envFile}:`, error.message);
      return null;
    }
  }

  /**
   * Parsea las variables de entorno
   */
  parseEnvVars(envContent) {
    const vars = {};
    const lines = envContent.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Saltar comentarios y líneas vacías
      if (trimmedLine.startsWith('#') || trimmedLine === '') {
        continue;
      }

      // Buscar variables de entorno
      const match = trimmedLine.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        vars[key] = value.replace(/^["']|["']$/g, ''); // Remover comillas
      }
    }

    return vars;
  }

  /**
   * Valida las variables requeridas
   */
  validateRequiredVars(envVars) {
    const results = {
      valid: true,
      missing: [],
      present: [],
      warnings: [],
    };

    for (const varName of this.requiredVars) {
      if (envVars[varName]) {
        results.present.push(varName);

        // Validaciones específicas
        if (varName === 'TELEGRAM_BOT_ADMINS') {
          if (!/^\d+$/.test(envVars[varName])) {
            results.warnings.push(
              `${varName} debe ser un número (tu ID de Telegram)`
            );
          }
        }

        if (varName.includes('TOKEN') || varName.includes('KEY')) {
          if (envVars[varName].length < 10) {
            results.warnings.push(`${varName} parece ser muy corto`);
          }
        }

        if (varName.includes('URL')) {
          if (!envVars[varName].startsWith('http')) {
            results.warnings.push(`${varName} debe ser una URL válida`);
          }
        }
      } else {
        results.missing.push(varName);
        results.valid = false;
      }
    }

    return results;
  }

  /**
   * Muestra el resumen de validación
   */
  displayResults(results, envVars) {
    console.log('🔍 Validación del Entorno Local - Panacea Icono SA');
    console.log('='.repeat(60));

    // Variables presentes
    console.log('\n✅ Variables Configuradas:');
    for (const varName of results.present) {
      const value = envVars[varName];
      const displayValue =
        varName.includes('TOKEN') || varName.includes('KEY')
          ? `${value.substring(0, 8)}...`
          : value;
      console.log(`  ✔ ${varName}=${displayValue}`);
    }

    // Variables faltantes
    if (results.missing.length > 0) {
      console.log('\n❌ Variables Faltantes:');
      for (const varName of results.missing) {
        console.log(`  ✗ ${varName}`);
      }
    }

    // Advertencias
    if (results.warnings.length > 0) {
      console.log('\n⚠️ Advertencias:');
      for (const warning of results.warnings) {
        console.log(`  ⚠ ${warning}`);
      }
    }

    // Resumen
    console.log('\n📊 Resumen:');
    console.log(
      `  Variables configuradas: ${results.present.length}/${this.requiredVars.length}`
    );
    console.log(`  Variables faltantes: ${results.missing.length}`);
    console.log(`  Advertencias: ${results.warnings.length}`);

    if (results.valid) {
      console.log('\n🎉 ¡Entorno local configurado correctamente!');
    } else {
      console.log('\n❌ Hay variables faltantes. Revisa la configuración.');
    }

    return results.valid;
  }

  /**
   * Ejecuta la validación completa
   */
  run() {
    try {
      console.log('🔍 Iniciando validación del entorno local...');

      const envContent = this.readEnvFile();
      if (!envContent) {
        return false;
      }

      const envVars = this.parseEnvVars(envContent);
      const results = this.validateRequiredVars(envVars);

      return this.displayResults(results, envVars);
    } catch (error) {
      console.error('❌ Error en la validación:', error.message);
      return false;
    }
  }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

if (require.main === module) {
  const validator = new LocalEnvValidator();
  const isValid = validator.run();

  if (!isValid) {
    process.exit(1);
  }
}

module.exports = LocalEnvValidator;
