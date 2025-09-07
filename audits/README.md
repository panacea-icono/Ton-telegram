# Auditorías del Proyecto

Este directorio almacena informes de auditoría automatizados y manuales.

- Para generar una auditoría rápida: `npm run audit:run`
- Los resultados se guardan en `audits/audit-<timestamp>.txt` y `audits/latest.txt`.

- Auditoría de repos GitHub: `npm run audit:github`
- Auditoría de integraciones: `npm run audit:integrations`
- Ejecutar todas: `npm run audit:all`

Contenido sugerido del informe:
- Estado de seguridad (posibles secretos, archivos sensibles)
- Configuración y variables requeridas
- Salud de scripts (presencia, versión, uso de entorno)
- Recomendaciones prioritarias
