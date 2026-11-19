# Chuleta de Repaso — AWS Solutions Architect Associate (SAA-C03)

> Base inicial lista para ir sumando patrones de examen, trampas clásicas y contrastes clave de `SAA-C03` a medida que practiques en el simulador.

---

## 0. Cómo cambian las preguntas de CLF-C02 a SAA-C03

| En el enunciado dice... | En SAA-C03 casi siempre apunta a... |
| :--- | :--- |
| *"Menor sobrecarga operativa (LEAST operational overhead)"* | Servicios **gestionados o serverless** (`Fargate` sobre `EC2`, `Aurora/RDS` sobre BD en `EC2`, `Lambda`, `DynamoDB`, `S3 Lifecycle`). |
| *"Desacoplar componentes / evitar perder pedidos en picos"* | **`Amazon SQS`** entre el productor y los consumidores (+ *Dead-Letter Queue* si fallan reintentos). |
| *"Enviar el mismo evento a múltiples microservicios a la vez"* | Patrón **Fan-out**: **`SNS` → múltiples colas `SQS`**. |
| *"Lambda abre demasiadas conexiones contra RDS y la satura"* | **`Amazon RDS Proxy`**. |
| *"Servir archivos privados de S3 por CloudFront sin hacer público el bucket"* | **Origin Access Control (`OAC`)** + Bucket Policy para CloudFront. |
| *"Permitir a un usuario subir/bajar un archivo puntual de S3 por tiempo limitado"* | **`S3 Presigned URL`** (URL prefirmada). |
| *"Cómputo HPC / Machine Learning de altísimo rendimiento sobre archivos"* | **`Amazon FSx for Lustre`** (integrado con S3). |
| *"Carpetas compartidas Windows SMB con Active Directory"* | **`Amazon FSx for Windows File Server`**. |

---

## 1. Dominio 1 — Arquitecturas Seguras (30%)
*(Se irá completando con tus apuntes y errores de práctica)*

## 2. Dominio 2 — Arquitecturas Resilientes (26%)
*(Se irá completando con tus apuntes y errores de práctica)*

## 3. Dominio 3 — Arquitecturas de Alto Rendimiento (24%)
*(Se irá completando con tus apuntes y errores de práctica)*

## 4. Dominio 4 — Arquitecturas Optimizadas en Costos (20%)
*(Se irá completando con tus apuntes y errores de práctica)*
