# Simulador y Estudio de Certificaciones AWS

Repositorio unificado con **una sola aplicación web** para practicar múltiples certificaciones de AWS y carpetas separadas de seguimiento/estudio para cada una.

## Estructura del Proyecto

```text
examenes_aws/
├── index.html / Examenes.html   # App web única (selector de Certificación + Examen)
├── app.js                       # Lógica del simulador (Padawan / Jedi, resultados, progreso)
├── styles.css                   # Estilos del simulador
├── certs.json                   # Configuración de certificaciones (nombre, carpeta, % aprobación)
├── md_to_docx.py                # Generador de chuleta_repaso.docx para cualquier certificación
│
├── examenes/                    # Bancos de preguntas (.json) por certificación
│   ├── cloud_practitioner/      # 31 exámenes de CLF-C02 + exams.json
│   └── architect_associate/     # Exámenes de SAA-C03 + exams.json
│
└── estudio/                     # Contexto, evaluaciones, plan y chuleta por certificación
    ├── cloud_practitioner/      # ✅ APROBADO OFICIALMENTE: 811/1000 (19/11/2026)
    └── architect_associate/     # 🚀 Próximo objetivo: Solutions Architect Associate (SAA-C03)
```

## Cómo sumar una certificación o un examen nuevo

1. **Sumar un examen `.json` a una certificación existente:**
   - Guardá el archivo `.json` dentro de `examenes/<certificacion>/` (por ejemplo `examenes/architect_associate/Examen1.json`).
   - Agregalo a `examenes/<certificacion>/exams.json` para que cargue al instante tanto en local como en GitHub Pages.
2. **Sumar una certificación nueva en el futuro (ej. `ai_practitioner`):**
   - Creá las carpetas `examenes/ai_practitioner/` (con su `exams.json`) y `estudio/ai_practitioner/`.
   - Agregá un bloque en `certs.json` con su `id`, `name`, `folder` y `passPercent`.
