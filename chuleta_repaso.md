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
| **Simple** (Simple) | Un único recurso (un solo servidor web). Sin lógica. |
| **Failover** (Conmutación por error) | Activo-pasivo. Si el principal cae, va al secundario (DR). |
| **Weighted** (Ponderado) | Reparte tráfico por **porcentajes** (ej. 80/20, pruebas A/B). |
| **Latency-based** (Basado en latencia) | Manda al endpoint con **menor latencia** (recursos en varias regiones). |
| **Geolocation** (Geolocalización) | Enruta según la **ubicación** del usuario (país/continente). |
| **Geoproximity** (Geoproximidad) | Según distancia geográfica entre usuario y recurso (con "bias"). |
| **Multivalue answer** (Respuesta de varios valores) | Devuelve varias IPs sanas a la vez (health checks). |

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
- **Service Status** (Estado del servicio) — antes "Service Health Dashboard": público, **sin login**, salud **general** de **todos** los servicios de AWS en todas las regiones. "¿AWS está bien en general?"
- **Your Account** (Estado de tu cuenta) — antes "Personal Health Dashboard / PHD": personalizado, **requiere login**, solo eventos que afectan a **tus** recursos. "¿me afecta a mí?"

> Pista: "público / todos los servicios / general" → **Service Status**. "personalizado / mis recursos / me afecta a mí" → **Your Account**.

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
| **Kendra** | Búsqueda inteligente (search) dentro de documentos usando lenguaje natural. |
| **Lex** | Construir **chatbots** / asistentes conversacionales (voz y texto). La tecnología detrás de Alexa. |
| **SageMaker** | Plataforma para crear, entrenar y desplegar modelos de **machine learning** propios. |

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

### Backup: EBS vs EFS (cómo se respalda cada uno)

| | EBS | EFS |
|---|---|---|
| Mecanismo | **Snapshots** (incrementales) | **AWS Backup** |
| Qué pagás | Solo los bloques modificados | El almacenamiento de backup usado en el mes |
| Restaurar | — | **Gratis** (no pagás por restaurar) |
| Automatizar | Data Lifecycle Manager o AWS Backup | AWS Backup |

> **Regla mental:** "snapshot incremental" → **EBS**. "AWS Backup / no pagás restaurar" → **EFS**.
> AWS Backup es un servicio centralizado que respalda varios servicios (EFS, EBS, RDS, DynamoDB...).

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

**Créditos de AWS (cómo se aplican):**
- Se aplican **primero los que vencen antes** (por fecha de expiración).
- Cada crédito solo se usa **donde está permitido** (ciertos servicios).
- Si un servicio no tiene crédito aplicable, se factura completo.

**Qué es gratis (no se cobra):**
- Transferencia de datos de **entrada** desde internet.
- **S3 ↔ EC2 en la misma región**.
- Servicios en sí: IAM, Auto Scaling, CloudFormation, VPC, Organizations (solo pagás los recursos que crean).

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

**Servicios gestionados (RDS, Aurora, DynamoDB, Lambda):**
- AWS se encarga de **parches del SO, backups y mantenimiento**. El cliente **no** tiene acceso SSH al host.
- En servicios gestionados, AWS asume más responsabilidad que en IaaS (EC2), donde el SO invitado lo parchea el cliente.

**Cifrado por defecto (detalle que confunde):**
- **CloudTrail logs** entregados a S3 → cifrados por defecto (SSE-S3).
- **S3** (buckets) → cifrado por defecto.
- **EBS, EFS, RDS** → cifrado **opcional** (lo activás vos).

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

## 7. Cloud Adoption Framework (CAF) — repasar

El **AWS CAF** organiza la adopción de la nube en **6 perspectivas**, agrupadas en negocio (las 3 primeras) y técnicas (las 3 últimas):

| Perspectiva | Grupo | De qué se encarga | Roles típicos |
|---|---|---|---|
| **Business** (Negocio) | Negocio | ROI, caso de negocio, resultados | CEO, CFO, CDO |
| **People** (Personas) | Negocio | Cultura, habilidades, gestión del cambio | RR.HH., CIO |
| **Governance** (Gobernanza) | Negocio | ROI, gestión de cartera/portafolio, riesgos | CIO, PMO |
| **Platform** (Plataforma) | Técnica | Arquitectura, infraestructura, aprovisionar servicios | **CTO, arquitectos, ingenieros** |
| **Security** (Seguridad) | Técnica | Identidad, cumplimiento, protección de datos | CISO, equipos de seguridad |
| **Operations** (Operaciones) | Técnica | Operar, monitorear y recuperar cargas | COO, soporte TI |

> **Trampa:** si la pregunta menciona CTO/ingenieros/arquitectos → perspectiva **Plataforma** (técnica). Si menciona ROI/portafolio/riesgos → **Gobernanza**.

**Buenas prácticas de transformación organizacional (CAF):**
- Organizar equipos en torno a **productos y flujos de valor**.
- Usar **métodos ágiles** para iterar y evolucionar rápido.

### 7 R de migración (estrategias)

| Estrategia | Qué hace |
|---|---|
| **Rehost** (Realojar) | "Lift and shift": mover tal cual, sin cambiar código. |
| **Replatform** (Replataformar) | "Lift, tinker and shift": pequeñas optimizaciones (ej. DB a RDS). |
| **Refactor** (Refactorizar) | Rediseñar/reescribir la app para la nube. |
| **Repurchase** (Recomprar) | Cambiar a otro producto (ej. pasar a un SaaS). |
| **Retain** (Retener) | Dejar algo on-premises (por ahora). |
| **Retire** (Retirar) | Dar de baja lo que ya no se usa. |
| **Relocate** (Reubicar) | Mover sin cambios (ej. VMware Cloud on AWS). |

### Socios (APN)
- **Consulting Partner** → servicios profesionales: diseñar, migrar y gestionar cargas.
- **Technology Partner** → venden software/hardware que corre en AWS.

---

## 8. Global vs Regional — NO confundir los 3 conceptos

Son **tres preguntas distintas** que se parecen. Separalas siempre:

### Eje 1 — ¿Qué es la Infraestructura Global? (piezas FÍSICAS)
- **Regiones + Zonas de Disponibilidad (AZs) + Edge Locations.**
- Son construcciones físicas de AWS; ya existen, vos no las creás.
- VPC, subred y VPN **NO** son infra global (son redes lógicas que definís vos adentro).

### Eje 2 — ¿El servicio es de alcance global o regional?
- **Criterio práctico:** si al crearlo **te pide elegir una región** → regional. Si no te pide región → global.
- (Ojo: muchos globales también los configurás vos, como IAM o Route 53. "Lo definí yo" NO implica regional.)

| Globales (son pocos, memorizarlos) | Regionales (casi todo lo demás) |
|---|---|
| IAM | EC2, S3*, EBS, EFS, RDS |
| Route 53 | DynamoDB, Lambda, VPC |
| CloudFront | SQS, SNS, Rekognition |
| WAF | ... |
| Shield | |
| AWS Organizations | |

> **Regla rápida:** son globales los de **identidad, DNS, borde (edge) y gestión de cuentas**. Si no reconocés un servicio, apostá a **regional** (la mayoría lo son).
>
> **\*Trampa S3:** es **regional**. Confunde porque el **nombre del bucket es único a nivel global**, pero el bucket vive en una región que vos elegís.

### Eje 3 — Dentro de una región, ¿cuántas AZs abarca el recurso?
- **VPC** → abarca **todas las AZs** de su región.
- **Subred** → vive en **una sola AZ**.

> Fijate la clave: una **VPC** es regional (eje 2) y lógica/no-infra-global (eje 1) **a la vez**. Son ejes separados; respondé según lo que pregunte el enunciado.

---

## Estrategia final

- Repasá por **contrastes** (A vs B), no servicio suelto.
- Rehacé los simulacros en **modo Jedi** hasta sacar **85%+** estable.
- Leé la **última línea** de la pregunta primero (MOST/LEAST/NOT).
- En "Selecciona dos/tres": marcá **exactamente** esa cantidad.
