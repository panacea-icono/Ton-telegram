#!/usr/bin/env node

// Planificador de Auditorías - Ejecuta auditorías periódicas y mantiene historial
// Permite programar auditorías automáticas y generar reportes de tendencias

const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Importar auditorías
const { runComprehensiveAudit } = require('./comprehensive-audit');

// Configuración por defecto
const DEFAULT_CONFIG = {
  // Programación de auditorías (formato cron)
  schedules: {
    comprehensive: '0 0 * * 1', // Cada lunes a medianoche
    connections: '0 */6 * * *',  // Cada 6 horas
    forks: '0 0 * * 0',          // Cada domingo
    modulations: '0 0 */3 * *'   // Cada 3 días
  },
  
  // Configuración de retención
  retention: {
    maxReports: 30,     // Máximo número de reportes a mantener
    maxAgeDays: 90      // Máximo edad en días
  },
  
  // Configuración de alertas
  alerts: {
    enabled: true,
    thresholds: {
      connectionFailureRate: 0.5,  // 50% de fallos en conexiones
      submodulesMissing: 0.3,      // 30% de submódulos faltantes
      dependencyConflicts: 5       // Más de 5 conflictos de dependencias
    }
  }
};

class AuditScheduler {
  constructor(configPath = 'config/audit-scheduler.json') {
    this.configPath = path.resolve(configPath);
    this.config = this.loadConfig();
    this.tasks = new Map();
    this.historyPath = path.resolve('audits/history');
    this.ensureDirectories();
  }
  
  loadConfig() {
    if (fs.existsSync(this.configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        return { ...DEFAULT_CONFIG, ...config };
      } catch (error) {
        console.warn('⚠️  Error loading config, using defaults:', error.message);
      }
    }
    
    // Crear configuración por defecto si no existe
    this.saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
  
  saveConfig(config = this.config) {
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
  }
  
  ensureDirectories() {
    const dirs = [
      path.resolve('audits'),
      this.historyPath,
      path.dirname(this.configPath)
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }
  
  // Programar auditorías automáticas
  scheduleAudits() {
    console.log('📅 Programando auditorías automáticas...');
    
    // Auditoría comprensiva
    if (this.config.schedules.comprehensive) {
      const task = cron.schedule(this.config.schedules.comprehensive, async () => {
        console.log('🔍 Ejecutando auditoría comprensiva programada...');
        await this.runScheduledAudit('comprehensive');
      }, { scheduled: false });
      
      this.tasks.set('comprehensive', task);
      console.log(`✅ Auditoría comprensiva: ${this.config.schedules.comprehensive}`);
    }
    
    // Otras auditorías específicas
    for (const [auditType, schedule] of Object.entries(this.config.schedules)) {
      if (auditType === 'comprehensive') continue;
      
      if (schedule) {
        const task = cron.schedule(schedule, async () => {
          console.log(`🔍 Ejecutando auditoría ${auditType} programada...`);
          await this.runScheduledAudit(auditType);
        }, { scheduled: false });
        
        this.tasks.set(auditType, task);
        console.log(`✅ Auditoría ${auditType}: ${schedule}`);
      }
    }
  }
  
  // Ejecutar auditoría programada
  async runScheduledAudit(auditType) {
    try {
      const startTime = Date.now();
      let result;
      
      switch (auditType) {
        case 'comprehensive':
          result = await runComprehensiveAudit();
          break;
        case 'connections':
          const { runConnectionsAudit } = require('./connections-audit');
          result = await runConnectionsAudit();
          break;
        case 'forks':
          const { runForksAudit } = require('./forks-audit');
          result = await runForksAudit();
          break;
        case 'modulations':
          const { runModulationsAudit } = require('./modulations-audit');
          result = await runModulationsAudit();
          break;
        default:
          throw new Error(`Tipo de auditoría desconocido: ${auditType}`);
      }
      
      const duration = Date.now() - startTime;
      
      // Guardar en historial
      await this.saveToHistory(auditType, result, duration);
      
      // Verificar alertas
      if (this.config.alerts.enabled) {
        await this.checkAlerts(auditType, result);
      }
      
      console.log(`✅ Auditoría ${auditType} completada en ${duration}ms`);
      
    } catch (error) {
      console.error(`❌ Error en auditoría ${auditType}:`, error.message);
      
      // Guardar error en historial
      await this.saveToHistory(auditType, { error: error.message }, 0);
    }
  }
  
  // Guardar resultado en historial
  async saveToHistory(auditType, result, duration) {
    const historyFile = path.join(this.historyPath, `${auditType}-history.jsonl`);
    
    const entry = {
      timestamp: new Date().toISOString(),
      auditType,
      duration,
      result: result.error ? { error: result.error } : {
        success: true,
        summary: result.summary || {}
      }
    };
    
    // Añadir al archivo JSONL
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(historyFile, line);
    
    // Limpiar historial antiguo
    await this.cleanupHistory(auditType);
  }
  
  // Verificar alertas
  async checkAlerts(auditType, result) {
    const alerts = [];
    
    if (auditType === 'connections' && result.connectivity) {
      // Verificar tasa de fallos en conexiones
      const totalConnections = Object.values(result.connectivity).reduce((sum, conns) => sum + conns.length, 0);
      const failedConnections = Object.values(result.connectivity)
        .flat()
        .filter(conn => conn.status !== 'success').length;
      
      const failureRate = failedConnections / totalConnections;
      
      if (failureRate >= this.config.alerts.thresholds.connectionFailureRate) {
        alerts.push({
          type: 'connection_failure',
          message: `Alta tasa de fallos en conexiones: ${(failureRate * 100).toFixed(1)}%`,
          severity: 'high'
        });
      }
    }
    
    if (auditType === 'forks' && result.physicalDirectories) {
      // Verificar submódulos faltantes
      const total = result.gitmodules?.total || 0;
      const missing = result.physicalDirectories.missing?.length || 0;
      
      if (total > 0) {
        const missingRate = missing / total;
        
        if (missingRate >= this.config.alerts.thresholds.submodulesMissing) {
          alerts.push({
            type: 'submodules_missing',
            message: `Submódulos faltantes: ${missing}/${total} (${(missingRate * 100).toFixed(1)}%)`,
            severity: 'medium'
          });
        }
      }
    }
    
    if (auditType === 'modulations' && result.dependencyAnalysis) {
      // Verificar conflictos de dependencias
      const conflicts = result.dependencyAnalysis.conflicts?.length || 0;
      
      if (conflicts >= this.config.alerts.thresholds.dependencyConflicts) {
        alerts.push({
          type: 'dependency_conflicts',
          message: `Conflictos de dependencias detectados: ${conflicts}`,
          severity: 'medium'
        });
      }
    }
    
    // Procesar alertas
    if (alerts.length > 0) {
      console.log('🚨 ALERTAS DETECTADAS:');
      for (const alert of alerts) {
        const emoji = alert.severity === 'high' ? '🔴' : '🟡';
        console.log(`${emoji} ${alert.type}: ${alert.message}`);
      }
      
      // Guardar alertas
      await this.saveAlerts(auditType, alerts);
    }
  }
  
  // Guardar alertas
  async saveAlerts(auditType, alerts) {
    const alertsFile = path.join(this.historyPath, 'alerts.jsonl');
    
    for (const alert of alerts) {
      const entry = {
        timestamp: new Date().toISOString(),
        auditType,
        ...alert
      };
      
      const line = JSON.stringify(entry) + '\n';
      fs.appendFileSync(alertsFile, line);
    }
  }
  
  // Limpiar historial antiguo
  async cleanupHistory(auditType) {
    const historyFile = path.join(this.historyPath, `${auditType}-history.jsonl`);
    
    if (!fs.existsSync(historyFile)) return;
    
    try {
      const lines = fs.readFileSync(historyFile, 'utf8').split('\n').filter(Boolean);
      const entries = lines.map(line => JSON.parse(line));
      
      // Filtrar por edad y cantidad
      const maxAge = Date.now() - (this.config.retention.maxAgeDays * 24 * 60 * 60 * 1000);
      const filtered = entries
        .filter(entry => new Date(entry.timestamp).getTime() > maxAge)
        .slice(-this.config.retention.maxReports);
      
      // Reescribir archivo si es necesario
      if (filtered.length !== entries.length) {
        const content = filtered.map(entry => JSON.stringify(entry)).join('\n') + '\n';
        fs.writeFileSync(historyFile, content);
        
        const removed = entries.length - filtered.length;
        console.log(`🧹 Limpieza de historial ${auditType}: ${removed} entradas eliminadas`);
      }
      
    } catch (error) {
      console.warn(`⚠️  Error limpiando historial ${auditType}:`, error.message);
    }
  }
  
  // Iniciar programador
  start() {
    console.log('🚀 Iniciando programador de auditorías...');
    this.scheduleAudits();
    
    // Iniciar todas las tareas
    for (const [name, task] of this.tasks.entries()) {
      task.start();
      console.log(`▶️  Tarea ${name} iniciada`);
    }
    
    console.log('✅ Programador de auditorías activo');
  }
  
  // Detener programador
  stop() {
    console.log('🛑 Deteniendo programador de auditorías...');
    
    for (const [name, task] of this.tasks.entries()) {
      task.stop();
      console.log(`⏹️  Tarea ${name} detenida`);
    }
    
    this.tasks.clear();
    console.log('✅ Programador de auditorías detenido');
  }
  
  // Generar reporte de tendencias
  async generateTrendReport(auditType, days = 30) {
    const historyFile = path.join(this.historyPath, `${auditType}-history.jsonl`);
    
    if (!fs.existsSync(historyFile)) {
      return { error: `No hay historial para ${auditType}` };
    }
    
    try {
      const lines = fs.readFileSync(historyFile, 'utf8').split('\n').filter(Boolean);
      const entries = lines.map(line => JSON.parse(line));
      
      // Filtrar por período
      const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
      const recent = entries.filter(entry => new Date(entry.timestamp).getTime() > cutoff);
      
      const trends = {
        period: days,
        totalRuns: recent.length,
        successRate: recent.filter(e => e.result.success).length / recent.length,
        averageDuration: recent.reduce((sum, e) => sum + e.duration, 0) / recent.length,
        lastRun: recent[recent.length - 1]?.timestamp
      };
      
      return trends;
      
    } catch (error) {
      return { error: error.message };
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'start';
  
  const scheduler = new AuditScheduler();
  
  switch (command) {
    case 'start':
      scheduler.start();
      console.log('Presiona Ctrl+C para detener...');
      
      // Manejar señales de terminación
      process.on('SIGINT', () => {
        scheduler.stop();
        process.exit(0);
      });
      
      // Mantener el proceso corriendo
      setInterval(() => {}, 1000);
      break;
      
    case 'run-now':
      const auditType = args[1] || 'comprehensive';
      console.log(`🔍 Ejecutando auditoría ${auditType} inmediatamente...`);
      await scheduler.runScheduledAudit(auditType);
      break;
      
    case 'trends':
      const type = args[1] || 'comprehensive';
      const days = parseInt(args[2]) || 30;
      const trends = await scheduler.generateTrendReport(type, days);
      
      if (trends.error) {
        console.error('❌', trends.error);
      } else {
        console.log('📈 REPORTE DE TENDENCIAS');
        console.log(`Período: ${trends.period} días`);
        console.log(`Ejecuciones: ${trends.totalRuns}`);
        console.log(`Tasa de éxito: ${(trends.successRate * 100).toFixed(1)}%`);
        console.log(`Duración promedio: ${Math.round(trends.averageDuration)}ms`);
        console.log(`Última ejecución: ${trends.lastRun || 'N/A'}`);
      }
      break;
      
    case 'config':
      console.log('⚙️  CONFIGURACIÓN ACTUAL:');
      console.log(JSON.stringify(scheduler.config, null, 2));
      break;
      
    default:
      console.log('Uso: node audit-scheduler.js [command] [options]');
      console.log('');
      console.log('Comandos:');
      console.log('  start                    - Iniciar programador');
      console.log('  run-now [audit-type]     - Ejecutar auditoría inmediatamente');
      console.log('  trends [audit-type] [days] - Mostrar tendencias');
      console.log('  config                   - Mostrar configuración');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = { AuditScheduler };