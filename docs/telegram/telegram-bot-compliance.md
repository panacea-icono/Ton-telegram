# Telegram Bot Platform Developer Terms — Cumplimiento (Checklist)

Este documento mapea las cláusulas clave de los “Telegram Bot Platform Developer Terms” a acciones concretas en este repositorio para asegurar cumplimiento continuo.

Estado: base implementada; pendiente completar funcionalidades de pago y TON-only si aplica Mini App.

1. Aceptación y Alcance

- Aceptar Términos y Política de Privacidad de Telegram. Mantenerse actualizado con @BotNews.
- Acción: Añadir este documento al repo y revisarlo trimestralmente.

2. Independencia (2.1)

- No presentarse como afiliado/representante de Telegram.
- Acción: Revisar branding y descripciones del bot/app; no usar marcas de Telegram.

3. Disponibilidad (3)

- Telegram/TPA pueden cambiar o no estar disponibles. Diseñar para tolerancia a fallos.
- Acción: Implementar manejo de errores y degradación (en progreso, ver scripts/health-check.js).

4. Privacidad (4)

- Mantener política de privacidad accesible.
- Guardar solo datos necesarios; cifrados en reposo y separados de claves.
- Acciones:
  - docs/telegram/privacy-policy.md añadido (plantilla). En producción, publicar URL y registrar en @BotFather.
  - Cifrado: scripts/secure-encrypt.js corrige AES-256-GCM (clave/IV/tag correctos).
  - Añadir mecanismo de eliminación de datos a petición (pendiente integrar endpoint si almacenamos PII).

  4.3 Scraping

- Prohibido recolectar datos masivos o para ML/AI desde grupos/canales.
- Acción: En código del bot, no realizar scraping. Revisar PRs con lint/seguridad.

  4.5 Credenciales

- No exponer tokens/IDs; todo por variables de entorno/secret manager.
- Acción: .env ignorado; scripts usan process.env; añadidos chequeos.

5. Código de Conducta

- No spam, no suplantación, no engaños, no malware, no ventas de bienes/servicios ilegales.
- Acción: Moderación y validación de contenido de UGC (pendiente cuando haya UGC real).

  5.3 Interfaz

- No bloquear interacción ni simular diálogos del sistema/Telegram.
- Acción: Revisar UI de Mini App/bot conforme se implemente.

  5.4 Telegram Business

- Si se usa como Chatbot business: declarar servicios y políticas adicionales.
- Acción: Documentar si se activa esta función.

6. Pagos

- Bienes físicos: usar proveedores externos (no Telegram). Telegram no procesa.
- Bienes digitales: sólo vía Telegram Stars. Debe existir /paysupport para soporte.
- Acciones:
  - Comando /paysupport añadido en frontend/telegram-bot/bot.js.
  - Pendiente: flujo de pago con Stars según Bot API cuando se implemente.

7. Blockchain (Mini Apps)

- Mini Apps con cripto deben ser exclusivamente TON; conexión wallet por TON Connect.
- Acciones:
  - Si este repo publica un Mini App con funciones cripto: deshabilitar cadenas no-TON en el contexto de Telegram y operar solo con TON.
  - Mantener otras cadenas fuera del Mini App o mediante puente permitido y siempre a través de TON Connect.

9. Cumplimiento Legal/Privacidad (GDPR, etc.)

- Acción: Evaluación legal local; DPA si aplica; retención/borrado de datos (4.2) implementados por diseño.

10. Terminación

- Diseñar para revocación/terminación sin datos críticos en Telegram Cloud.

12. Responsabilidad/As Is

- Diseñar resiliencia; no depender de almacenamiento perpetuo en Telegram.

Checklist técnico (auto‑verificable)

- [x] Política de privacidad incluida: docs/telegram/privacy-policy.md
- [x] Comando /paysupport en el bot
- [x] Cifrado seguro AES-256-GCM
- [x] Credenciales por entorno (.env ignorado)
- [ ] Mecanismo de borrado de datos a solicitud (añadir cuando haya PII almacenada)
- [ ] TON‑only en Mini App si integra cripto (banderas/entorno)
