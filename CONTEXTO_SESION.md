# Contexto de Sesión — Preparación AWS Cloud Practitioner (CLF-C02)

> **Instrucción para el agente en la otra máquina:** Leé este archivo junto con `evaluaciones.txt`, `plan_estudio.txt` y `chuleta_repaso.md` para retomar exactamente desde donde dejamos. Hablale a Sebastián en español argentino (voseo), de forma directa, clara y concisa.

---

## 1. Fecha del Examen Oficial y Objetivo
- **Fecha del examen:** Jueves 19 de noviembre de 2026.
- **Estado actual (Martes 17/11 por la noche):**
  - Sebastián rindió una primera vez anteriormente donde aprobó **Dominio 2 (Seguridad, 30%)** y necesitaba reforzar **Dominio 1 (Conceptos, 24%)**, **Dominio 3 (Tecnología, 34%)** y **Dominio 4 (Facturación y Soporte, 12%)**.
  - En los últimos días levantó muchísimo el nivel en los 4 dominios:
    - `Examen_EC2_S3_VPC` (86 preg): **73/86 (85%)**
    - `Examen_Dominio1_CAF_WellArchitected` (50 preg): **47/50 (94%)**
    - `Examen_Dominio4` (45 preg): **41/45 (91%)** (100% de acierto en Planes de Soporte)
    - `Examen_Mix_Dom1_Dom4_Dificil` (45 preg estilo examen real con trampas): **35/45 (78%)**
    - `Examen_S3_EC2_Udemy` (1 a 50): **37/50 (74%)**
    - `Examen_Popurri_S3_EC2_45` (45 preg seleccionadas de la 51 a la 218 sin repetidas): **33/45 (73% - 76%)**

---

## 2. Plan para Mañana Miércoles 18/11 (Víspera del Examen)
1. Hacer **`Examen_practica_udemy6.json`** (65 preguntas nuevas) en **Modo Jedi**.
2. Al terminar, Sebastián copia el **`Resumen rápido`** desde la pantalla de **📊 Ver puntaje** de la app (ej. `10 D, 15 C, 17 B y E...`) y lo pega en el chat para analizar cada error.
3. Repaso liviano de la **Sección 0** de `chuleta_repaso.docx` / `chuleta_repaso.md` (errores repetidos y tabla de palabras trampa).
4. **Regla importante:** Si se modifica `chuleta_repaso.md`, regenerar siempre `chuleta_repaso.docx` (hay un script en Python puro que genera el `.docx` nativo sin dependencias externas).

---

## 3. Últimas Correcciones Fijadas Hoy (Martes 17/11)

### Del Mix Difícil de Dominio 1 y 4 (`35/45 = 78%`):
- **Excelencia Operativa vs Eficiencia del Rendimiento:**
  - *Excelencia Operativa* = cómo trabaja el equipo y despliega código (cambios pequeños/frecuentes/reversibles, operaciones como código, runbooks, *Game Days*).
  - *Eficiencia del Rendimiento* = qué tecnología elegís para baja latencia y alto rendimiento (serverless, ir global en minutos, evaluar nuevas familias de instancias).
- **Sostenibilidad vs Optimización de Costos:** Comprar *Savings Plans* o *Reserved Instances* solo ahorra dinero (*Costos*). *Sostenibilidad* requiere reducir energía/hardware físico (*AWS Graviton*, *Serverless*, apagar recursos ociosos, comprimir datos).
- **7 R — `Replatform` vs `Relocate`:**
  - *Relocate* = SOLO cuando menciona **VMware (`VMware Cloud on AWS`)**.
  - *Replatform* = pasar una BD a **RDS** o una app a **Elastic Beanstalk** sin tocar el código.
- **CAF Fases y Perspectivas:**
  - Poner **proyectos piloto en producción** para demostrar valor = **Launch (Lanzar)** (*Scale* viene después).
  - Observabilidad, incidentes, parches y SLAs día a día = **Operaciones (Operations)** (*Plataforma* diseña la arquitectura).
- **Support Plans:** Guía arquitectónica **contextual (adaptada a tu caso de uso)** + **AWS Support API** arranca en **Business Support** (*Developer* solo da guía general y no tiene API).
- **Servicios gratuitos:** *IAM*, *Auto Scaling*, *CloudFormation*, *Elastic Beanstalk*, *VPC* y *Organizations* son gratis (solo pagás los recursos que crean). *Redshift* y *NAT Gateway* son pagos.
- **AWS Marketplace + AWS Artifact:** Comprar firewall de terceros (Palo Alto/Fortinet) en factura AWS = *Marketplace*; bajar reportes ISO/SOC/PCI = *Artifact*.

### De `Examen_S3_EC2_Udemy` (1–50) y `Examen_Popurri_S3_EC2_45`:
- **Clases S3:**
  - Acceso infrecuente pero rápido (milisegundos) = `S3 Standard-IA`.
  - Menor disponibilidad (1 sola AZ, 99.5%) = `S3 One Zone-IA`.
  - Única clase sin duración mínima de almacenamiento = `S3 Standard` (las IA tienen mínimo 30 días; Glacier 90/180 días).
  - Si un archivo se usa mucho al principio y poco después = `S3 Standard` + `S3 Lifecycle` a los 30 días.
- **EBS Snapshots y EFS-IA:** Snapshots de EBS son **incrementales**; `EFS-IA` cobra tarifa al leer/escribir; `AWS Backup` **sí cobra** por restaurar datos.
- **S3 Seguridad:**
  - Evitar borrado accidental o sobrescritura = `S3 Versioning` (mientras que WORM legal inmutable = `S3 Object Lock` / `Glacier Vault Lock`).
  - Cifrar datos **ANTES de enviarlos a S3** = `Client-Side Encryption` (SDK de cifrado).
- **EC2 Compra y Facturación:**
  - Licencias ligadas a sockets/núcleos físicos (BYOL) = `Dedicated Host` (no *Dedicated Instance*).
  - Plazo de **3 años** en RI ahorra más que 1 año (incluso con pago parcial vs total de 1 año).
  - Facturación por segundo de EC2 Linux tiene un **mínimo obligatorio de 60 segundos**.
- **Escalado Horizontal vs Vertical:** Sumar *Read Replicas* en RDS o usar *ELB* = **Horizontal (elasticidad)**. Subir CPU/RAM de una instancia = **Vertical**.
- **AWS Compute Optimizer:** Analiza **EC2, Auto Scaling Groups, EBS y Lambda** (NO analiza S3 ni EFS).
- **Storage Gateway vs S3 Gateway Endpoint:** *Storage Gateway* conecta tu datacenter **on-premises** con S3; *Gateway Endpoint* conecta tu **VPC** con S3.
- **Terminal en EC2 Linux privada:** `Session Manager` + `EC2 Instance Connect` (*Direct Connect* es enlace físico de red, no consola SSH).
