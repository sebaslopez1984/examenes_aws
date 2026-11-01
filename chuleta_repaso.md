# Chuleta de repaso — AWS Cloud Practitioner (CLF-C02)

> Enfocada en **tus puntos flojos** (según 5 simulacros).
> **Examen objetivo:** 17 de noviembre.
> **Prioridad:** estudiar por **contrastes** (A vs B), que es donde pifias.

---

## 0. Errores repetidos — MÁXIMA PRIORIDAD

> Fallados en **udemy3 _y_ udemy5**: todavía no se fijaron. Repasar sí o sí.

- **EFS**: las EC2 acceden en **muchas AZ, regiones y VPC** (y on-premises vía Direct Connect/VPN). Es regional y muy flexible. **No** se limita a 1 AZ.
- **EFS Standard-IA**: caso de uso = archivos poco accedidos pero que deben seguir **disponibles** (ej. registros de auditoría, históricos). No es volumen de arranque (eso es EBS) ni objetos (eso es S3).
- **RDS Read Replica** = escalabilidad de **lectura** (copias de solo lectura).
  - **No** da disponibilidad → eso es **Multi-AZ**.
  - **No** protege de fallo regional → eso es **Multi-Región**.
- **Responsabilidad compartida**: AWS "**del**" cloud (infra) / cliente "**en**" el cloud (datos, config, SO invitado en EC2). Ver sección 5.
- **Infraestructura Global** = Regiones + AZs + Edge Locations. VPC, subred y VPN **no** son infra global (son lógicos, los definís vos).
- **EBS snapshots** = incrementales (solo pagás los bloques que cambiaron).
- **EFS Infrequent Access (IA)** = cobra una tarifa cada vez que leés/escribís.
- **AWS Budgets**, 4 tipos: **Cost** (dinero), **Usage** (uso), **RI** (reservas), **Savings Plans**. No existen presupuestos de "hardware/software/recursos".

---

## 1. Route 53 — políticas de enrutamiento

Route 53 = servicio **DNS** de AWS (traduce dominios a IPs). También registra dominios y hace health checks.

| Política | Cuándo se usa |
|---|---|
| **Simple** | Un único recurso (un solo servidor web). Sin lógica. |
| **Failover** | Activo-pasivo. Si el principal cae, va al secundario (DR). |
| **Weighted** | Reparte tráfico por **porcentajes** (ej. 80/20, pruebas A/B). |
| **Latency-based** | Manda al endpoint con **menor latencia** (recursos en varias regiones). |
| **Geolocation** | Enruta según la **ubicación** del usuario (país/continente). |
| **Geoproximity** | Según distancia geográfica entre usuario y recurso (con "bias"). |
| **Multivalue answer** | Devuelve varias IPs sanas a la vez (health checks). |

**Trucos de palabra clave en la pregunta:**

| Si la pregunta dice... | Respuesta |
|---|---|
| "un solo recurso / servidor" | **Simple** |
| "activo-pasivo" / "conmutación por error" | **Failover** |
| "porcentaje" / "X% del tráfico" / "A-B test" | **Weighted** |
| "menor latencia" / "más rápido" | **Latency** |
| "según el país / región del usuario" | **Geolocation** |

---

## 2. Pares que se confunden (tu mayor fuente de errores)

### CloudFront vs Global Accelerator
- **CloudFront**: CDN, **cachea** contenido web en edge locations (HTTP/S, estático/streaming).
- **Global Accelerator**: IPs estáticas Anycast, optimiza **ruta de red**, sirve TCP/UDP no-HTTP (juegos, VoIP, IoT).

### AWS Config vs CloudTrail
- **Config**: historial/estado de **configuración** de recursos ("cómo estaba configurado").
- **CloudTrail**: registro de **acciones** y llamadas a la API ("quién hizo qué y cuándo").

### Health Dashboard: Service Status vs Your Account
- **Service Status**: público/global, salud de **todos** los servicios de AWS.
- **Your Account**: personalizado, solo eventos que afectan a **tus** recursos.

### Amazon MQ vs SQS / SNS
- **Amazon MQ**: migrar brokers **existentes** (ActiveMQ, RabbitMQ) sin reescribir código.
- **SQS / SNS**: para apps **nuevas** nativas de AWS (SQS = colas, SNS = pub/sub notificaciones).

### Session Manager vs EC2 Instance Connect
- **Session Manager**: shell seguro **sin abrir puertos ni IP pública** (lo más seguro).
- **Instance Connect**: necesita abrir el **puerto 22** (SSH).

### KMS vs CloudHSM
- **KMS**: gestión de claves, HSM compartido/multitenant (lo normal).
- **CloudHSM**: HSM de hardware **dedicado**, exigencia normativa FIPS 140-2 Nivel 3.

### Servicios de IA (asociar entrada → salida)

| Servicio | Qué hace |
|---|---|
| **Translate** | Traduce **texto** entre idiomas. |
| **Transcribe** | Voz → texto. |
| **Polly** | Texto → voz (audio). |
| **Rekognition** | Analiza imágenes y video (caras, objetos). |
| **Comprehend** | NLP, análisis de sentimiento / entidades en texto. |

---

## 3. Storage (tu tema más flojo — repasar fuerte)

### Tipos

| Servicio | Tipo | Notas |
|---|---|---|
| **S3** | Objetos | Clave-valor, estructura plana. Archivos, backups, web estática. |
| **EBS** | Bloques | Disco para **una** instancia EC2, atado a 1 AZ. |
| **EFS** | Archivos NFS | Compartido: acceso multi-AZ + multi-región + multi-VPC + on-premises. |
| **FSx** | Archivos | Para Windows (SMB/AD) o Lustre (HPC). |
| **Instance Store** | Bloques efímero | Atado a la instancia (se pierde al apagar). |

### Clases de S3 (de más caliente a más frío)

| Clase | Característica |
|---|---|
| **Standard** | Acceso frecuente. **Sin** fee de recuperación. |
| **Intelligent-Tiering** | Mueve datos solo según uso. **Sin** fee de recuperación. |
| **Standard-IA** | Acceso poco frecuente, multi-AZ. **Con** fee de recuperación. |
| **One Zone-IA** | Igual que IA pero 1 sola AZ (más barato, menos durable). |
| **Glacier Instant** | Archivo con acceso en ms. |
| **Glacier Flexible** | Archivo, recuperación en minutos/horas. |
| **Glacier Deep Archive** | Lo **más barato**, retención 7-10 años (compliance). 12-48 h. |

### Reglas de oro S3
- Cifrado: S3 viene cifrado **por defecto**.
- Transferencia de datos de **entrada** desde internet: **gratis**.
- S3 ↔ EC2 en la **misma región**: **gratis**.
- "almacenar datos 7-10 años, lo más barato" → **Glacier Deep Archive**.
- Lifecycle rules (mover entre clases automáticamente) → solo S3.

### Precios EBS / EFS (detalle que te sale mal)
- **EBS snapshots**: incrementales, solo pagás los bloques modificados.
- **EFS Infrequent Access (IA)**: más barato de almacenar **pero** cobra tarifa cada vez que leés o escribís un archivo.
- Proteger S3 de borrado accidental → **S3 Versioning** (guarda versiones).

### Bases de datos — RDS (concepto que fallás seguido)

| Config | Para qué |
|---|---|
| **Read Replica** | Escala la **lectura** (copias solo-lectura). Rendimiento. |
| **Multi-AZ** | Alta **disponibilidad** (failover automático a otra AZ). |
| **Multi-Región** | Protege ante fallo de una **región** entera. |
| **DynamoDB** | NoSQL, serverless, HA por defecto (multi-AZ sola). |

---

## 4. Gobierno / Soporte / Facturación

### Well-Architected Framework — 6 pilares
Mnemotecnia: **"Sos FERS"** → **S**ostenibilidad, **E**xcelencia operativa, **F**iabilidad, **E**ficiencia del rendimiento, optimización de costes (**R**... Rendimiento de costos), **S**eguridad.

Pilares formales: Sostenibilidad, Excelencia Operativa, Fiabilidad, Eficiencia del Rendimiento, Optimización de Costes, Seguridad.

> ⚠️ **Trampa:** Escalabilidad / Disponibilidad / Elasticidad **no** son pilares.

### Planes de AWS Support (de menor a mayor)

| Plan | Qué incluye |
|---|---|
| **Basic** | Gratis, solo docs y foros. |
| **Developer** | Email, horario laboral (no 24x7, no teléfono). |
| **Business** | El **más barato** con teléfono/chat 24x7 + Trusted Advisor completo. |
| **Enterprise On-Ramp / Enterprise** | Agregan TAM, mayor SLA, más caros. |

### Herramientas de costos

| Herramienta | Para qué |
|---|---|
| **Pricing Calculator** | **Estimar** costos **antes** de construir / comparar on-prem vs AWS. |
| **Cost Explorer** | **Visualizar** costos históricos y tendencias. |
| **Budgets** | **Alertas** cuando el costo real/previsto supera un límite. 4 tipos: Cost, Usage, RI, Savings Plans. |
| **Cost & Usage Report** | El reporte más detallado de uso y costos (CSV a S3). |

**Etiquetas de asignación de costes:**
- Hay que **activarlas** por separado (las de AWS y las definidas por usuario).
- Cada clave de etiqueta es única por recurso y tiene **un solo valor**.

### Herramientas de "qué servicios usar / gobernar"

| Herramienta | Para qué |
|---|---|
| **AWS Artifact** | Descargar reportes de compliance (PCI, SOC, ISO). |
| **Trusted Advisor** | Recomendaciones (costos, seguridad, rendimiento, límites, tolerancia). |
| **Service Catalog** | Catálogo de soluciones TI preaprobadas. |
| **Compute Optimizer** | Recomienda tipo de EC2, Auto Scaling, EBS, Lambda (**no** S3/EFS). |

---

## 5. Responsabilidad compartida

- **AWS = seguridad "del" cloud** → hardware, instalaciones, red global, AZs, hipervisor, servicios gestionados (S3, DynamoDB infra).
- **Cliente = seguridad "en" el cloud** → sus datos, cifrado, IAM, config, parches del SO invitado en EC2, grupos de seguridad.

> **Regla:** si lo **configurás o subís vos** → es tuyo. Si es físico/infra → es de AWS.

---

## 6. Networking

- **VPN Site-to-Site**: componentes = **Virtual Private Gateway** (lado AWS) + **Customer Gateway** (tu lado). Va por internet público. (No: Internet/NAT/Storage Gateway.)
- **Direct Connect**: enlace privado dedicado on-premises → AWS (no usa internet, tarda ~1 mes).
- **Transit Gateway**: hub central para conectar **muchas** VPC (+ on-premises). Mejor que VPC Peering a escala.
- **VPC Peering**: conecta 2 VPC punto a punto (no transitivo, no escala bien).
- **VPC Endpoint**: conecta tu VPC a servicios AWS de forma privada.
  - **Interface Endpoint** (PrivateLink) = la mayoría de servicios (SQS, SNS...).
  - **Gateway Endpoint** = **solo S3 y DynamoDB**.
- **Infra Global** = Regiones, AZs, Edge Locations. (VPC/subred/VPN no son infra global.)

---

## Estrategia final

- Repasá por **contrastes** (A vs B), no servicio suelto.
- Rehacé los simulacros en **modo Jedi** hasta sacar **85%+** estable.
- Leé la **última línea** de la pregunta primero (MOST/LEAST/NOT).
- En "Selecciona dos/tres": marcá **exactamente** esa cantidad.
