# Chuleta de repaso — AWS Cloud Practitioner (CLF-C02)

> Enfocada en **tus puntos flojos** (según 15 simulacros).
> **Examen objetivo:** 19 de noviembre.
> **Prioridad:** estudiar por **contrastes** (A vs B) y por **qué se mira** (no por palabras sueltas).

### Índice rápido por bloques
- **[0. Errores repetidos y cómo evitar palabras trampa](#0-errores-repetidos-y-cómo-evitar-palabras-trampa--máxima-prioridad)**
- **[1. Cómputo, Contenedores y Desarrollo (EC2, Auto Scaling, Fargate, Híbrido)](#1-cómputo-contenedores-y-desarrollo)**
- **[2. Almacenamiento (S3, EBS, EFS) y Migración de Datos](#2-almacenamiento-storage-y-migración-de-datos)**
- **[3. Bases de Datos y Analítica (RDS, DynamoDB, Redshift, EMR)](#3-bases-de-datos-y-analítica)**
- **[4. Redes, Entrega de Contenido y Firewalls (VPC, Route 53, CloudFront, WAF)](#4-redes-entrega-de-contenido-y-firewalls)**
- **[5. Seguridad, Identidad y Responsabilidad Compartida (IAM, Cognito, Macie, KMS)](#5-seguridad-identidad-y-responsabilidad-compartida)**
- **[6. Monitoreo, Auditoría, Mensajería, IA y Escritorios (CloudTrail/Config, SQS/SNS)](#6-monitoreo-auditoría-mensajería-ia-y-atención-al-cliente)**
- **[7. Facturación, Planes de Support, Well-Architected, CAF y las 7 R de Migración](#7-facturación-planes-de-support-well-architected-y-caf)**
- **[8. Global vs Regional vs Zonal, Resiliencia y Disaster Recovery (RTO/RPO)](#8-global-vs-regional-vs-zonal--no-confundir-los-3-conceptos)**
- **[9. Glosario rápido y Estrategia final](#9-glosario-rápido-términos-que-aparecen-en-las-preguntas)**

---

## 0. Errores repetidos y cómo evitar palabras trampa — MÁXIMA PRIORIDAD

> Tus puntos ciegos reales acumulados en los simulacros (`udemy1` a `1.6` + `Falladas`). Repasar sí o sí antes de cada simulacro.

### Los más repetidos en tus exámenes
- **Planes de Support (fallado 4 veces):** `< 15 min` (sistema crítico caído), **TAM**, **IEM**, revisiones **Well-Architected / operativas** y **Concierge** → **Enterprise**. El más barato con teléfono 24x7, `< 1 hora` y **soporte/orientación de arquitectura** → **Business** (NO tiene TAM).
- **Redshift (fallado 3 veces):** **Data warehouse (OLAP)** para **analizar datos históricos / BI / reportes**. **NO** es para transacciones del día a día (eso es OLTP: RDS, Aurora, DynamoDB).
- **RDS Read Replica vs Multi-AZ vs Escalar vertical (fallado 3 veces):**
  - **Read Replica** = escalabilidad de **lectura** (copias de solo lectura para mejorar rendimiento). **No** da alta disponibilidad.
  - **Multi-AZ** = **alta disponibilidad** (failover automático si cae un datacenter). **No** protege de fallo regional (eso es **Multi-Región**).
  - **Escalar verticalmente (scale up)** = instancia más grande para problemas de **memoria o muchas escrituras** (las Read Replicas no sirven para escrituras).
- **EFS y EFS Standard-IA (fallado 3 veces):**
  - **EFS**: las EC2 acceden en **muchas AZ, regiones y VPC** (y on-premises vía Direct Connect/VPN). Es regional y muy flexible. **No** se limita a 1 AZ.
  - **EFS Standard-IA / Infrequent Access (IA)**: archivos **poco accedidos** pero que deben seguir **disponibles** al instante (ej. registros de auditoría, históricos). Guardarlos sale **más barato**, pero cobra una tarifa cada vez que los leés/escribís. (No es volumen de arranque = EBS, ni objetos = S3).
- **Socios APN vs AMS (fallado 2 veces):**
  - **Consulting Partner** (socio consultor) = **asesora, diseña, migra** y gestiona.
  - **Technology Partner** (socio tecnológico) = **vende software o hardware** (SaaS, herramientas).
  - **AWS Managed Services (AMS)** = **NO es un partner**, es un **equipo de AWS** que opera tu entorno por vos (parches, monitoreo, incidentes).
- **Firewall Manager (fallado 2 veces):** administra de forma **centralizada** reglas de WAF, Shield Advanced y Security Groups en **varias cuentas de AWS Organizations**.
- **Responsabilidad compartida**: AWS "**del**" cloud (infra, hipervisor, SO host) / cliente "**en**" el cloud (datos, config, **SO invitado/guest** en EC2, parches de sus apps).
- **Infraestructura Global** = Regiones + AZs + Edge Locations. VPC, subred y VPN **no** son infra global (son lógicos, los definís vos).
- **EBS snapshots** = incrementales (solo pagás los bloques que cambiaron). **Se guardan en S3** (lo gestiona AWS, no aparecen en tus buckets).
- **AWS Budgets**, 4 tipos: **Cost** (dinero), **Usage** (uso), **RI** (reservas), **Savings Plans**. No existen presupuestos de "hardware/software/recursos".

### Escudo contra palabras trampa (cuando meten una palabra comodín)
En el examen meten palabras como *"cumplimiento"*, *"auditoría"*, *"ahorro"* o *"privado"* para confundirte entre dos servicios. No mires la palabra comodín; mirá **qué objeto toca la oración**:

| Par que te hace dudar | No mires la palabra... | Preguntate esto para decidir en 2 segundos |
|---|---|---|
| **CloudTrail vs Config** | "auditoría", "cumplimiento", "gobernanza" (la usan en los dos) | ¿Mira **QUIÉN hizo una acción / llamada API / actividad de la cuenta**? → **CloudTrail**.<br>¿Mira **CÓMO está configurado un recurso** y su historial de cambios? → **Config**. |
| **Savings Plans vs Reserved Instances** | "1 o 3 años", "hasta 72%", "uso predecible" | ¿Pide **flexibilidad para cambiar región, familia, SO o usar Fargate/Lambda** automáticamente? → **Savings Plans**.<br>¿Es capacidad fija para **EC2 o RDS**? → **RI** (si pide cambiar familia dentro de RI → **Convertible RI**). |
| **Cognito User Pool vs Identity Pool** | "usuarios", "app móvil", "Google/Facebook" | ¿Solo **inicia sesión / registra** en la app (quién sos)? → **User Pool**.<br>¿Da **credenciales temporales de AWS** (para tocar S3/DynamoDB) o **acceso de invitados**? → **Identity Pool**. |
| **Transit Gateway vs PrivateLink** | "conectar VPCs en privado" | ¿Une **muchas redes/VPCs enteras** como un hub central? → **Transit Gateway**.<br>¿Expone **un servicio puntual** en privado sin unir las redes? → **PrivateLink (Interface Endpoint)**. |
| **DataSync vs Transfer Family** | "mover archivos a S3 o EFS" | ¿Dice **automatizar migración de grandes volúmenes** on-prem a AWS? → **DataSync**.<br>¿Dice protocolo **SFTP / FTP / FTPS**? → **Transfer Family**. |
| **Budgets vs Cost Anomaly Detection** | "alerta de costos" | ¿Avisa al superar un **límite fijo** que pusiste vos? → **Budgets**.<br>¿Detecta un **gasto inusual / inesperado con Machine Learning**? → **Cost Anomaly Detection**. |
| **Auto Scaling Predictivo vs Programado** | "escalar antes de que suba el tráfico" | ¿Analiza **patrones históricos con ML** para anticiparse? → **Predictivo**.<br>¿Le ponés vos **día y hora fija**? → **Programado**. |

---

## 1. Cómputo, Contenedores y Desarrollo

### Tipos de instancia EC2 (familias): la palabra que decide

| Familia | Palabra clave | Para qué |
|---|---|---|
| **General Purpose** (M, T) | **equilibrada** | Servidores web, aplicaciones, desarrollo y pruebas. |
| **Compute Optimized** (C) | **CPU** | Procesamiento por lotes, transcodificar video, cálculos científicos, juegos. |
| **Memory Optimized** (R, X) | **RAM** | Bases de datos en memoria, análisis en tiempo real, cachés grandes. |
| **Storage Optimized** (I, D) | **disco local rápido (IOPS)** | Data warehousing, bases con mucho I/O. |
| **Accelerated Computing** (P, G) | **GPU** | Machine learning, gráficos, video. |

> Para recordarlas: **Equilibrada, CPU, RAM, disco, GPU**. Las letras no hace falta memorizarlas; lo que decide es el recurso que la pregunta dice que falta.

### Modelos de compra de EC2 (cuál elegir)

| Modelo | Compromiso | Cuándo conviene |
|---|---|---|
| **On-Demand** (bajo demanda) | Ninguno, pagás por uso | Cargas impredecibles o cortas; probar. |
| **Reservadas (RI)** (2 tipos: **Standard** y **Convertible**, ver abajo) | 1 o 3 años, para un **tipo de instancia** concreto | Uso estable y predecible de una configuración conocida. |
| **Savings Plans** | 1 o 3 años, un **gasto por hora** | Uso estable pero con **flexibilidad** para cambiar región, familia o SO. |
| **Spot** | Ninguno; AWS puede **interrumpirla** con aviso | Cargas que toleran interrupciones (batch, trabajos ad hoc). Hasta ~90% menos. |
| **Dedicated Host** | Servidor físico para vos | **Licencias atadas a socket o núcleo** (BYOL), cumplimiento. |
| **Dedicated Instance** | Hardware aislado para tu cuenta | Aislamiento; no da control de sockets ni de licencias. |

> Pista para "la estrategia **MÁS rentable**": uso **estable y predecible** (por ejemplo, el próximo año) → **Reservadas o Savings Plans**. Trabajos **ad hoc que se pueden interrumpir** → **Spot**. **On-Demand** casi nunca es la más rentable: da flexibilidad, no ahorro. (Te salió en udemy4 #41: la respuesta era Reservadas para lo predecible y Spot para lo interrumpible.)

**Savings Plans vs Reservadas:**
- **Savings Plans (Planes de ahorro):** descuento a cambio de un **compromiso de gasto por hora**. Los *Compute Savings Plans* se aplican **solos** al uso de EC2 sin importar la **familia, tamaño, SO ni región** (también Fargate y Lambda). Pista: "flexibilidad para cambiar de región o familia + descuento automático" → **Savings Plans**.
- **Instancias reservadas (RI):** se compran para **EC2** y **RDS** (también ElastiCache, Redshift, OpenSearch; no para Lambda, S3, IAM). Descuento atado a **tipo de instancia y región** (en las estándar). Menos flexibles. Hay **2 tipos**:

| Tipo de Reservada | Descuento | Flexibilidad | Palabra clave |
|---|---|---|---|
| **Standard RI** | El **mayor** (hasta ~72%) | **Baja**: no podés cambiar la familia de instancia (sí tamaño/AZ en ciertos casos) | Uso **fijo y predecible**, querés el **máximo ahorro** |
| **Convertible RI** | Menor (hasta ~66%) | **Alta**: podés **cambiarla por otra familia, SO o tenencia** de igual o mayor valor | Pensás que vas a **necesitar cambiar** de tipo de instancia |

  Truco: **Standard = más descuento, menos libertad. Convertible = menos descuento, más libertad.**
- **Savings Plans también tiene 2 tipos principales:** **Compute** (el más flexible: EC2, Fargate y Lambda, cualquier región o familia) y **EC2 Instance** (más descuento, pero atado a una **familia y región**). Para el examen alcanza con: *"flexibilidad" → Compute Savings Plans*.
- **Formas de pago de una RI:** **todo por adelantado** (mayor descuento), **parcial por adelantado** y **sin pago anticipado** (No Upfront, se paga mensual). Algunos bancos de preguntas solo listan las dos primeras; si la opción "mensual sin anticipo" aparece, es una modalidad real de AWS.

**Estados de una EC2 y qué se cobra:**
- **Running:** se cobra todo (cómputo + almacenamiento).
- **Stopped:** **solo el almacenamiento EBS**; no se cobra CPU, RAM ni red.
- **Terminated:** no se cobra la instancia.

**Al lanzar una EC2: qué es obligatorio y qué es opcional**
- **Obligatorio:** una **AMI**, un **tipo de instancia**, la **VPC y subred**, un **volumen raíz** (viene de la AMI) y **al menos un Security Group**. Si no elegís uno, AWS asigna el **SG por defecto** de la VPC.
- **Opcional:** **IP elástica** (IP pública **fija** que es tuya y podés mover de una instancia a otra), IP pública (depende de la subred), **key pair** (solo hace falta para entrar por SSH), volúmenes extra, rol de IAM.

### Tipos de escalado de Auto Scaling

| Tipo | Cómo decide | Palabra clave |
|---|---|---|
| **Predictivo** | Analiza el **historial** (con ML) y **se anticipa** a los picos | "patrones históricos", "planificar capacidad futura", "ML" |
| **Programado** | Lo definís **vos** a una hora fija | "todos los lunes a las 9", "evento conocido" |
| **Seguimiento de objetivos** | Mantiene una **métrica en un valor** (ej. CPU al 50%) | "mantener CPU al X%" |
| **Por pasos** | Agrega o quita instancias **según cuánto** se pasó un umbral | "pasos", "escalones" |

> udemy_1.6 #62: "analiza patrones **históricos** para planificar **capacidad futura**" → **Predictivo** (marcaste Programado).

### Session Manager vs EC2 Instance Connect
- **Session Manager**: shell seguro **sin abrir puertos ni IP pública** (lo más seguro).
- **Instance Connect**: necesita abrir el **puerto 22** (SSH).

### Replicar una infraestructura a otra región: AMI vs CloudFormation
- **Una instancia EC2** (con su SO, software y configuración): crear una **AMI** y **copiarla** a la otra región.
- **Toda la infraestructura** (red, instancias, bases, etc.): **CloudFormation** (plantillas, infraestructura como código). Es lo más rápido y repetible.
- **Recuperación ante desastres de EC2:** **AMI** + **snapshots de EBS**. Los snapshots de RDS son para la base de datos, no para las instancias EC2.
- **Latencia para usuarios de otros continentes:** desplegar en **regiones cercanas** a ellos ("Go Global in minutes"), no una región única con más capacidad.

### Contenedores, Serverless y Herramientas de Desarrollo

**ECS vs Fargate vs Lambda:**
- **ECS**: el **orquestador** de contenedores (decide cuáles corren y dónde).
- **Fargate**: motor serverless para contenedores (ECS/EKS) **sin que administres servidores**. Pista: "contenedores **sin administrar infraestructura de servidores**" → **Fargate**.
- **Lambda**: ejecuta código serverless en respuesta a eventos (sin administrar servidores).

| Servicio | Para qué |
|---|---|
| **CodeCommit** | Repositorio Git para el código. |
| **CodeBuild** | **Compila y prueba** el código. |
| **CodeDeploy** | **Despliega** el código en EC2, Lambda o servidores locales. |
| **CodePipeline** | Orquesta todo el flujo de entrega continua (CI/CD). |
| **Device Farm** | **Prueba apps móviles y web en dispositivos reales** con distintas versiones de SO y firmware, sin tener los equipos. |
| **X-Ray** | **Rastrea y depura** aplicaciones distribuidas (microservicios, serverless) para encontrar cuellos de botella. |
| **CloudFormation** | Infraestructura como código: define y despliega recursos con plantillas. |
| **Elastic Beanstalk** | **Subís tu código** (Java, Python, etc.) y AWS lo despliega, escala y balancea sin que administres la infraestructura (PaaS). **No** trae plantillas listas. |
| **Lightsail** | Servidor virtual **simple y de precio fijo** con **plantillas ya armadas** (**WordPress**, LAMP, Node.js). Para blogs y webs chicas, sin configuración compleja. |

> **Beanstalk vs Lightsail:** "**subo mi código** y AWS lo despliega" → **Beanstalk**. "**WordPress / plantilla preconfigurada / blog / rápido y simple / precio fijo**" → **Lightsail**. Si la pregunta dice "PaaS" **y** "plantillas" → **Lightsail** (udemy_1.6 #35; ojo, "PaaS" te tienta a Beanstalk).
> Pista: "probar la app en muchos **dispositivos móviles**" → **Device Farm**. "depurar **microservicios**" → **X-Ray**. "**desplegar** código" → CodeDeploy; "**compilar**" → CodeBuild.

### Entorno híbrido (on-premises + AWS)
- **Systems Manager** y **CodeDeploy** funcionan también sobre servidores locales (con agente).
- Elastic Beanstalk, CloudFormation y Batch trabajan solo sobre infraestructura de AWS.
- **Outposts**: lleva la infraestructura, servicios, APIs y herramientas de AWS a **tu datacenter local** (híbrido con la misma experiencia). Pista: "mismas APIs y herramientas en local y en la nube" → Outposts.
- **Wavelength**: servicios de AWS dentro de redes **5G** de operadores (no confundir con Outposts).
- **Storage Gateway**: conecta tu almacenamiento **local** con el de AWS, con acceso local de baja latencia. Sirve para ampliar capacidad sin migrar todo a la nube. Pista: "ampliar almacenamiento local" + "híbrido" → Storage Gateway.

---

## 2. Almacenamiento (Storage) y Migración de Datos

### Tipos de almacenamiento

| Servicio | Tipo | Notas |
|---|---|---|
| **S3** | Objetos | Clave-valor, estructura plana. Archivos, backups, web estática. |
| **EBS** | Bloques | Disco para **una** instancia EC2, atado a 1 AZ. |
| **EFS** | Archivos NFS | Compartido: acceso multi-AZ + multi-región + multi-VPC + on-premises. |
| **FSx** | Archivos | Para Windows (SMB/AD) o Lustre (HPC). |
| **Instance Store** | Bloques efímero | Atado a la instancia (se pierde al apagar). |

### Clases de S3 (de más caliente a más frío)

**¿Qué es el "fee de recuperación"? (a prueba de boludos)**
Es un cargo EXTRA que pagás **por cada GB que leés o sacás** de esa clase. Es aparte de lo que pagás por tenerlo guardado.
- **Sin fee** = guardar cuesta X y leer es gratis (solo se pagan las solicitudes normales).
- **Con fee** = guardar es más barato, pero cada vez que lo leés pagás un extra por GB.
- Ejemplo: tenés 100 GB y los leés 1 vez. En Standard pagás solo el guardado. En Standard-IA pagás el guardado (más barato) **+ el fee por esos 100 GB leídos**. Si lo leés seguido, IA te sale más caro que Standard.
- Las solicitudes y la salida a internet se cobran aparte en TODAS las clases.

| Clase | Para qué | Guardar | Leer / recuperar | AZs |
|---|---|---|---|---|
| **Standard** | Acceso frecuente | Más caro | **Sin fee** y rápido | 3+ |
| **Intelligent-Tiering** | Acceso desconocido o cambiante, se optimiza solo | Según el nivel | **Sin fee** (cobra un cargo chico de monitoreo) | 3+ |
| **Standard-IA** | Poco frecuente, rápido, datos importantes | Más barato | **Con fee** por GB, rápido | 3+ |
| **One Zone-IA** | Poco frecuente, datos regenerables | Más barato aún | **Con fee** por GB, rápido | **1 sola** (menos durable) |
| **Glacier Instant** | Archivo con acceso en ms | Barato | **Con fee**, milisegundos | 3+ |
| **Glacier Flexible** | Archivo, puedo esperar | Muy barato | **Con fee**, minutos u horas | 3+ |
| **Glacier Deep Archive** | Lo **más barato**, retención 7-10 años (compliance) | El más barato | **Con fee**, **12 h (estándar)** o 48 h (masiva) | 3+ |

**La palabra que decide cada clase:**

| Si la pregunta dice... | Clase |
|---|---|
| acceso **frecuente** | **Standard** |
| acceso **cambiante o desconocido**, que se optimice solo | **Intelligent-Tiering** |
| **poco frecuente**, rápido, datos **importantes** | **Standard-IA** |
| poco frecuente, rápido, datos **regenerables** o menos costo | **One Zone-IA** |
| **archivo** pero con acceso en **milisegundos** | **Glacier Instant Retrieval** |
| **archivo**, puedo esperar **minutos u horas** | **Glacier Flexible Retrieval** |
| **lo más barato**, años, espera de **12 horas o más** | **Glacier Deep Archive** |

> Regla: cuanto más "frío", **más barato guardar, pero más lento y más caro recuperar** (fee por GB). Solo **Standard e Intelligent-Tiering NO cobran** por recuperar.

### Reglas de oro S3
- Cifrado: S3 viene cifrado **por defecto**.
- Durabilidad de **11 nueves** (99,999999999%), es de **objetos** (no bloques, no NoSQL).
- Capacidad: el almacenamiento **total** de un bucket es **ilimitado**, pero el tamaño máximo de **un solo objeto individual es 5 TB**.
- Transferencia de datos de **entrada** desde internet: **gratis**.
- S3 ↔ EC2 en la **misma región**: **gratis**.
- Qué genera costo en S3: almacenamiento (por GB al mes), transferencia **saliente** hacia internet, solicitudes y transiciones de ciclo de vida. **Subir** datos desde internet es gratis.
- "almacenar datos 7-10 años, lo más barato" → **Glacier Deep Archive**.
- "se accede **rara vez** pero cuando hace falta la recuperación debe ser **instantánea**" → **Standard-IA** (milisegundos). Glacier Flexible y Deep Archive tardan minutos u horas.
- Igual que lo anterior pero los datos **se pueden volver a generar** y se acepta menos durabilidad (1 sola AZ) → **One Zone-IA**.
- **Cómo leer estas preguntas:** buscá tres datos: **qué tan seguido** se accede, **qué tan rápido** hace falta el dato y **cuánta durabilidad** se necesita. "Rápido" descarta Glacier Flexible y Deep Archive (tardan minutos u horas). "Se puede volver a generar" o "acepto menos durabilidad" apunta a **One Zone-IA**, aunque no diga "una sola AZ".
- Lifecycle rules (mover entre clases automáticamente) → solo S3.
- Proteger S3 de borrado accidental → **S3 Versioning** (guarda versiones).

### Precios EBS / EFS (detalle que te sale mal)
- **EBS snapshots**: incrementales, solo pagás los bloques modificados. **Se almacenan en S3** (administrado por AWS, no los ves en tus buckets). Son regionales y podés copiarlos a otra región.
- **EFS Infrequent Access (IA)**: **sirve para ahorrar** en archivos que se usan **poco** (acceso infrecuente) dentro de un EFS. Guardarlos es **más barato**, **pero** cobra tarifa cada vez que leés o escribís un archivo.
  - Se usa con **Lifecycle Management**: movés **solos** a IA los archivos que no se tocan hace X días (ej.: 30). Si los volvés a usar, pueden volver a Standard.
  - Es el **equivalente de S3 Standard-IA, pero para EFS** (sistema de archivos compartido).
  - Ejemplo: carpetas compartidas viejas, backups, logs antiguos que quedan en EFS pero casi nadie abre.
  - **No conviene** si los archivos se leen seguido: pagarías la tarifa de acceso todo el tiempo y saldría más caro que Standard.

### Tipos de volumen EBS (cuál elegir)

| Tipo | Qué es | Cuándo usarlo |
|---|---|---|
| **gp3 / gp2** (General Purpose SSD) | Equilibrio entre precio y rendimiento | Uso general, volúmenes de arranque, desarrollo y pruebas. Opción por defecto. |
| **io2 / io1** (Provisioned IOPS SSD) | Máximo rendimiento y baja latencia, con IOPS que vos fijás | Bases de datos críticas y cargas con mucho I/O. |
| **st1** (Throughput Optimized HDD) | Disco magnético con buen caudal en lecturas secuenciales | Big data, data warehouse, logs. Barato. |
| **sc1** (Cold HDD) | El más barato | Datos a los que casi no se accede. |

> Pistas:
> - "base de datos crítica / muchas IOPS / alto rendimiento" → **Provisioned IOPS (io2/io1)**
> - "uso general / volumen de arranque" → **General Purpose SSD (gp3/gp2)**
> - "big data / logs / acceso secuencial / bajo costo" → **st1**
> - "lo más barato / acceso infrecuente" → **sc1**
>
> ⚠️ Los volúmenes **HDD (st1 y sc1) no se pueden usar como volumen de arranque**.
>
> "streaming de video / lectura y escritura **secuencial** de gran tamaño" → **st1** (Throughput Optimized HDD).
> "almacenamiento **muy rápido pero temporal** (buffers, caché), la persistencia no importa" → **Instance Store** (no es EBS, y los datos se pierden al apagar).

### Backup: EBS vs EFS (cómo se respalda cada uno)

| | EBS | EFS |
|---|---|---|
| Mecanismo | **Snapshots** (incrementales) | **AWS Backup** |
| Qué pagás | Solo los bloques modificados | El almacenamiento de backup usado en el mes |
| Restaurar | — | **Gratis** (no pagás por restaurar) |
| Automatizar | Data Lifecycle Manager o AWS Backup | AWS Backup |

> **Regla mental:** "snapshot incremental" → **EBS**. "AWS Backup / no pagás restaurar" → **EFS**.
> AWS Backup es un servicio centralizado que respalda varios servicios (EFS, EBS, RDS, DynamoDB...).

**Snapshots de EBS (detalles que preguntan):** son copias de un momento dado, **incrementales** (no copian el volumen completo cada vez), se guardan de forma duradera en **S3** (lo gestiona AWS) y **no hace falta detener la instancia** para tomarlos. Una **AMI** captura la instancia entera (incluye snapshots de sus volúmenes).

### Mover datos a AWS: DataSync vs Transfer Family vs Storage Gateway vs Direct Connect

| Servicio | Qué hace | Palabra clave |
|---|---|---|
| **DataSync** | **Migra y sincroniza grandes volúmenes** de datos entre on-premises y S3/EFS/FSx, automatizado y rápido | "**migrar grandes volúmenes**", "automatizar", "sincronizar" |
| **Transfer Family** | Transferir archivos por **SFTP/FTP/FTPS** hacia S3 o EFS | "SFTP", "FTP" |
| **Storage Gateway** | **Conecta** tu almacenamiento local con AWS de forma **continua** (híbrido) | "híbrido", "ampliar almacenamiento local" |
| **Direct Connect** | **Cable de red dedicado** a AWS. Es una conexión, **no** mueve ni sincroniza datos solo | "conexión privada dedicada" |
| **Snow Family** | Mover datos **físicamente** en un dispositivo | "sin buena red", "petabytes", "camión" |

> udemy_1.6 #30: "optimizar y automatizar la **migración de grandes volúmenes**" → **DataSync** (marcaste Transfer Family).

---

## 3. Bases de Datos y Analítica

### Bases de datos — RDS y servicios especializados (concepto que fallás seguido)

| Config / Servicio | Para qué |
|---|---|
| **Read Replica** | Escala la **lectura** (copias solo-lectura). Rendimiento. |
| **Multi-AZ** | Alta **disponibilidad** (failover automático a otra AZ). |
| **Multi-Región** | Protege ante fallo de una **región** entera. |
| **Escalar verticalmente (scale up)** | Pasar a una instancia **más grande** (más CPU/memoria). Sirve para problemas de **memoria o de muchas escrituras**. Las réplicas de lectura **no** ayudan con escrituras. |
| **DynamoDB** | NoSQL, serverless, **se ajusta solo a la demanda** (sin preocuparte por aprovisionar), sirve para datos no estructurados o semiestructurados, latencia de milisegundos, HA por defecto (multi-AZ). **No** hace consultas con joins complejos. Los **11 nueves** de durabilidad son de **S3**, no de DynamoDB. |
| **Redshift** | **Data warehouse**: sirve para **analizar** muchos datos históricos (ver tabla de abajo). **No** es para transacciones. |
| **Neptune** | Base de datos de **grafos**. |
| **EMR (Elastic MapReduce)** | Clúster gestionado para **big data** (**Apache Spark / Hadoop / Hive**), procesar enormes volúmenes repartidos en muchas máquinas o ETL masivo. |

### OLTP vs OLAP (a prueba de boludos)

| | **OLTP** = Transacciones | **OLAP** = Análisis |
|---|---|---|
| Qué hace | Guarda y modifica **un dato a la vez**, rápido | Lee **millones de filas** para sacar conclusiones |
| Ejemplo | Una venta, un pago, un pedido nuevo | "¿Cuánto vendimos por mes en los últimos 5 años?" |
| Servicio AWS | **RDS, Aurora, DynamoDB** | **Redshift** (data warehouse) |
| Palabras clave | transacciones, pedidos, la app del día a día | histórico, tendencias, BI, consultas complejas, reportes |

> **Redshift NO es OLTP.** Si la pregunta dice "analizar datos históricos" → **Redshift**.

> **RDS no te da acceso al sistema operativo** (ni RDP ni SSH). Si la pregunta pide **acceso por RDP / control total del SO** (ej.: SQL Server) → **EC2** (con una **AMI con SQL Server preinstalado**, que ya **incluye la licencia**). Si no la pide y querés que AWS administre → RDS. (udemy_1.6 #13)

---

## 4. Redes, Entrega de Contenido y Firewalls

### Conectividad VPC, Híbrida y Endpoints
- **VPN Site-to-Site**: componentes = **Virtual Private Gateway** (lado AWS) + **Customer Gateway** (tu lado). Va por internet público. (No: Internet/NAT/Storage Gateway.)
- **Direct Connect**: enlace privado dedicado on-premises → AWS (no usa internet, tarda ~1 mes).
- **Transit Gateway**: hub central para conectar **muchas** VPC (+ on-premises). Mejor que VPC Peering a escala.
  - **Transit Gateway vs PrivateLink:** TGW **conecta muchas VPC entre sí** (hub, rutas). **PrivateLink** expone **un servicio concreto** a otras VPC o cuentas, en privado, sin conectar las redes enteras. "Acceder a **servicios compartidos** en privado" → PrivateLink (udemy_1.6 #16, ambigua).
- **Varias VPC + datacenter local, la solución más eficiente** → **Transit Gateway + Direct Connect** (te salió así en el Falladas).
- **VPC Peering**: conecta 2 VPC punto a punto (no transitivo, no escala bien).
- **VPC Endpoint**: conecta tu VPC a servicios AWS de forma **privada**, por la **red interna de AWS**, **sin pasar por internet**: no necesitás Internet Gateway, NAT, VPN ni Direct Connect. "VPC Endpoint" es el nombre **general** y tiene 2 tipos:

```
VPC Endpoint (conectar tu VPC a servicios de AWS, en privado)
├── Gateway Endpoint     → solo S3 y DynamoDB
└── Interface Endpoint   → el resto (SQS, SNS...). Usa PrivateLink.
```

| | **Gateway Endpoint** | **Interface Endpoint** (usa **PrivateLink**) |
|---|---|---|
| Servicios | **Solo S3 y DynamoDB** | **La mayoría** (SQS, SNS, Kinesis, CloudWatch, API Gateway, etc.) |
| Cómo funciona | Una **entrada en la tabla de rutas** de la subred | Una **interfaz de red (ENI) con IP privada** dentro de tu subred |
| Costo | **Gratis** | Se cobra **por hora y por GB** |
| Palabra clave | "S3 o DynamoDB, privado, sin costo" | "otro servicio de AWS, privado" / "PrivateLink" |

  - **PrivateLink** es la tecnología detrás de los **Interface Endpoints**: también sirve para exponer **tu propio servicio** (o uno de un partner) a otras VPC o cuentas de forma privada, sin peering ni internet.
  - Para qué: que las instancias de una **subred privada** usen un servicio de AWS **sin salir a internet** (más seguro y sin pagar NAT).
  - Pista: "acceder a **SQS** (o cualquier servicio) **privado**, sin internet" → **Interface Endpoint / PrivateLink**. "acceder a **S3 o DynamoDB** privado" → **Gateway Endpoint**.

### NAT Gateway vs VPC Endpoint vs Internet Gateway (no confundir)

| | **NAT Gateway** | **VPC Endpoint** |
|---|---|---|
| A dónde llegás | **A internet** (cualquier sitio) | **Solo a servicios de AWS** (S3, DynamoDB, SQS...) |
| Por dónde va | **Sale a internet** (pasa por el Internet Gateway) | **Nunca sale a internet**, red interna de AWS |
| Para qué | Instancia privada que **sale** a internet (actualizaciones, APIs externas) | Instancia privada que usa un **servicio de AWS** en privado |
| Dónde vive | En una subred **pública** | Dentro de tu VPC (ruta o IP privada) |
| Costo | Por hora y por GB | Gateway: **gratis**. Interface: se cobra |

> Analogía: **NAT Gateway** = puerta de salida a la **calle** (internet). **VPC Endpoint** = **túnel privado** a un edificio concreto (un servicio de AWS).
> Pista: la palabra **internet** como destino → **NAT Gateway**. Un **servicio de AWS + privado / sin internet** → **VPC Endpoint**.

**Ojo con los "Gateway":**
- **Internet Gateway (IGW):** puerta de la VPC a internet. Permite que las instancias de una subred **pública** se conecten a internet (y reciban conexiones). Es lo que hace falta para "salir a internet" desde una subred pública.
- **NAT Gateway:** permite que las instancias de una subred **privada** **salgan** a internet sin que nadie pueda iniciar una conexión hacia ellas. **Se coloca en una subred pública** (aunque sirve a las privadas).
- **Bastion Host (Jump Box):** una instancia EC2 en la **subred pública** que sirve de "puente" para que un administrador entre por **SSH o RDP** a las instancias de la **subred privada** sin exponerlas a internet. (Alternativa moderna sin abrir puertos ni usar Bastion: **Systems Manager Session Manager**).
- **ELB (Application Load Balancer) público + instancias privadas:** si querés que usuarios de internet accedan a una aplicación web que corre en una **subred privada** sin exponer la instancia, ponés un **ELB en la subred pública** que recibe el tráfico y lo manda a la EC2 en la subred privada.
- **Gateway Endpoint:** atajo **privado** a S3 o DynamoDB, **no va a internet**.
- **API Gateway:** no es de redes, es para crear y publicar APIs.

### Route 53 — políticas de enrutamiento
Route 53 = servicio **DNS** de AWS (traduce dominios a IPs). También registra dominios y hace health checks.

| Política | Cuándo se usa |
|---|---|
| **Simple** (Simple) | Un único recurso (un solo servidor web). Sin lógica **y SIN health checks**. |
| **Failover** (Conmutación por error) | Activo-pasivo. Si el principal cae, va al secundario (DR). Requiere health checks. |
| **Weighted** (Ponderado) | Reparte tráfico por **porcentajes** (ej. 80/20, pruebas A/B). |
| **Latency-based** (Basado en latencia) | Manda al endpoint con **menor latencia** (la respuesta más rápida). |
| **Geolocation** (Geolocalización) | Enruta según el **PAÍS o CONTINENTE** del usuario (ej. Europa ve web en alemán, leyes por país). **En el examen casi siempre es esta.** |
| **Geoproximity** (Geoproximidad) | Según distancia física con **"bias" (sesgo)** para expandir/contraer el radio. (Rara vez es la respuesta salvo que diga *bias*). |
| **Multivalue answer** (Respuesta multivalor) | Devuelve **varias IPs saludables a la vez** usando **health checks** (a diferencia de Simple). |

**Trucos de palabra clave en la pregunta:**

| Si la pregunta dice... | Respuesta |
|---|---|
| "un solo recurso / servidor" | **Simple** |
| "activo-pasivo" / "conmutación por error" | **Failover** |
| "porcentaje" / "X% del tráfico" / "A-B test" | **Weighted** |
| "menor latencia" / "más rápido" | **Latency** |
| "según el país / región del usuario" | **Geolocation** |

### CloudFront vs Global Accelerator
> **"No HTTP"** = tráfico que **no es web**: usa **TCP o UDP** directo (juegos online, VoIP, IoT, streaming en tiempo real, SFTP). HTTP/HTTPS es lo del navegador (páginas, APIs REST, imágenes). Global Accelerator sirve para **los dos**; CloudFront solo para web.

Los dos usan los puntos de borde (edge) de AWS para acercarse al usuario, pero hacen cosas distintas:
- **CloudFront = la tienda con depósitos cerca de tu casa.** Guarda **copias** (caché) del contenido en los edge locations. Si otro usuario cercano pide lo mismo, se lo entrega al instante sin ir al origen.
- **Global Accelerator = la autopista privada con GPS.** **No guarda nada.** Recibe el tráfico en el borde más cercano y lo lleva por la **red privada de AWS** hasta tu servidor, evitando la congestión del internet público.

| | **CloudFront** | **Global Accelerator** |
|---|---|---|
| Idea clave | **Caché** y entrega de contenido | **Ruta** de red de baja latencia |
| Capa | 7 (aplicación: HTTP/HTTPS) | 4 (transporte: TCP/UDP) |
| Protocolos | HTTP, HTTPS, WebSocket | TCP y UDP (cualquier tráfico) |
| ¿Guarda caché? | **Sí** | **No**, solo transporta |
| IPs de entrada | Cambian según los nodos | **2 IPs estáticas** (Anycast) que no cambian |
| Ideal para | Sitios web, imágenes, video, APIs web cacheables | Juegos online, IoT, VoIP, APIs dinámicas que no se pueden cachear, failover rápido entre regiones |

> Pista: "caché / contenido estático / sitio web / video" → **CloudFront**. "IPs estáticas / juegos / VoIP / IoT / no es HTTP / failover entre regiones" → **Global Accelerator**.
> Cómo no confundirlos: si el contenido se **puede guardar y reutilizar** → CloudFront. Si cada petición es única y solo querés que **llegue más rápido** → Global Accelerator.

### Firewalls y protección de red: SG vs NACL vs WAF vs Shield vs Network Firewall

| Servicio | Dónde actúa | Qué hace |
|---|---|---|
| **Security Group** | **Instancia** (EC2) | Firewall con estado (stateful). Solo reglas de **permitir**. |
| **NACL** | **Subred** | Sin estado (stateless). Reglas de **permitir y denegar**. |
| **AWS WAF** | **Capa 7** (HTTP/HTTPS) | Bloquea ataques web (inyección SQL, XSS). Se asocia a CloudFront, ALB, API Gateway. |
| **AWS Shield** | Capas 3/4 | Protección contra **DDoS**. Standard es gratis y automático; Advanced es de pago (incluye equipo DRT). |
| **AWS Network Firewall** | **VPC completa** (perímetro) | Firewall de red **gestionado**: inspecciona el tráfico que entra y sale de la VPC con reglas propias (stateful y stateless), filtrado por dominio/IP y detección de intrusiones. Escala solo. |

**Qué es Network Firewall en una frase:** un firewall gestionado para proteger toda tu VPC, con inspección profunda del tráfico, más potente que un Security Group o una NACL.

> Pistas:
> - "a nivel de instancia, solo permitir" → **Security Group**
> - "a nivel de subred, permitir y denegar" → **NACL**
> - "inyección SQL / XSS / HTTP" → **WAF**
>   - WAF también puede **bloquear todo salvo lo que permitas** y filtrar por IP, URL y encabezados.
>   - La protección contra DDoS de capas 3 y 4 y el equipo DRT son de **Shield Advanced**, no de WAF.
>   - **Trampa (udemy4 #20):** WAF monitoriza y filtra peticiones HTTP/HTTPS, pero **solo de CloudFront, ALB, API Gateway, AppSync y Cognito**. Si la opción dice "peticiones que se reenvían a **Route 53**" (o EC2 directo) → **falsa**: Route 53 es DNS y WAF no se asocia a él. Mirá siempre **a qué servicio** dice que se asocia.
> - "DDoS" → **Shield**
> - "filtrar/inspeccionar el tráfico de toda la VPC, reglas personalizadas, detección de intrusiones" → **Network Firewall**

**Qué se puede poner como origen/destino en una regla de Security Group:**
- Válido: un **rango de IP (CIDR)**, una **lista de prefijos** o **otro Security Group** (de la misma VPC o con peering).
- **No** vale: un **nombre de dominio** ni el **ID de una instancia EC2**.
- Las reglas **entrantes** definen un **origen**; las **salientes** definen un **destino**.

**"Un Security Group solo permite" (qué significa):**
- Todas las reglas de un SG son de tipo **permitir**. **No existe** una regla "denegar". Lo que no permitís explícitamente queda bloqueado por defecto, pero no podés escribir "bloqueá esta IP".
- Ejemplo: querés que todos entren por el 443 **menos** la IP 198.51.100.7. En un SG no se puede declarar ese bloqueo; en una **NACL** o en **WAF** sí.
- En la consola el tipo "HTTP" o "HTTPS" es solo un atajo para TCP puerto 80 o 443: el SG **no ve la URL ni los encabezados**.

| | Security Group | NACL | WAF |
|---|---|---|---|
| Regla por IP o rango | Sí | Sí | Sí |
| Regla por puerto y protocolo | Sí | Sí | No es su función |
| **Bloquear explícitamente una IP** | **No** (solo permite) | Sí | Sí |
| Regla por **URL, encabezados o contenido HTTP** | **No** | **No** | **Sí** |

> Pista: "patrones en la URL / encabezados HTTP / inyección SQL" → **WAF**. "bloquear una IP o un rango a nivel de subred" → **NACL**. "permitir puertos a una instancia" → **Security Group**.

---

## 5. Seguridad, Identidad y Responsabilidad Compartida

### Modelo de Responsabilidad Compartida
- **AWS = seguridad "del" cloud** → hardware, instalaciones, red global, AZs, hipervisor, servicios gestionados (S3, DynamoDB infra).
- **Cliente = seguridad "en" el cloud** → sus datos, cifrado, IAM, config, parches del SO invitado en EC2, grupos de seguridad, licencias de su software.

> **Regla:** si lo **configurás o subís vos** → es tuyo. Si es físico/infra → es de AWS.

**EC2: SO host vs SO guest (invitado):**
- **SO host** (el del servidor físico, el hipervisor): lo parchea **AWS**.
- **SO guest** (el que corre dentro de tu instancia) y tus aplicaciones: lo parchea el **cliente**.
- En un **Dedicated Host** pasa lo mismo: el SO host sigue siendo de **AWS**. Lo que cambia es que ves los sockets y núcleos del servidor y elegís dónde corren tus instancias (útil para licencias BYOL).

**Servicios gestionados (RDS, Aurora, DynamoDB, Lambda):**
- AWS se encarga de **parches del SO, backups y mantenimiento**. El cliente **no** tiene acceso SSH al host.
- En servicios gestionados, AWS asume más responsabilidad que en IaaS (EC2), donde el SO invitado lo parchea el cliente.

**Cifrado por defecto (detalle que confunde):**
- **CloudTrail logs** entregados a S3 → cifrados por defecto (SSE-S3).
- **S3** (buckets) → cifrado por defecto.
- **EBS, EFS, RDS** → cifrado **opcional** (lo activás vos).
- **Storage Gateway** → los datos que viajan entre tu entorno y AWS van **cifrados con SSL** por defecto. (Te salió junto con S3 como "cifrado automático".)

**Controles compartidos (AWS _y_ cliente, cada uno en lo suyo):**

| Control | Qué hace cada uno |
|---|---|
| **Gestión de parches** | AWS parchea la infraestructura; el cliente parchea su SO invitado y sus apps. |
| **Gestión de configuración** | AWS configura sus dispositivos de infra; el cliente configura sus SO, bases y apps. |
| **Concienciación y formación** | AWS forma a sus empleados; el cliente forma a los suyos. |

> Trampa: en preguntas tipo "¿de quién es la gestión de configuración / la formación?", "solo del cliente" y "solo de AWS" son incorrectas → es **compartida** (te salió en udemy3 #39 y udemy_1.1 #44).

### IAM: quién tiene qué

| Entidad | Qué es |
|---|---|
| **Usuario** | Persona o app con credenciales de **largo plazo** (contraseña y **access keys** para CLI/SDK). |
| **Grupo** | Conjunto de usuarios para asignar permisos juntos. **No** tiene credenciales. |
| **Rol** | Credenciales **temporales**, para servicios AWS (ej. EC2 → DynamoDB) o acceso delegado. |
| **Política** | Documento JSON de permisos. No es una identidad. |

**Rol vs Política (para no mezclarlos):**
- La **política** es el **QUÉ**: el documento que dice qué acciones se permiten o se deniegan sobre qué recursos. **Define y aplica los permisos.**
- El usuario, el grupo y el rol son el **QUIÉN**: identidades a las que se les **adjunta** una política.
- **Rol** = identidad **temporal** que se **asume**. Se usa cuando:
  - un **servicio de AWS** (EC2, Lambda) necesita acceder a otro recurso en tu nombre (nunca access keys en código),
  - una **aplicación** necesita credenciales temporales, o
  - un **socio u otra cuenta** necesita acceso temporal.
- **Usuario** = persona o app con credenciales **permanentes / de largo plazo** (contraseña y access keys).

> Pista: "¿qué define los permisos?" → **Política**. "servicio/app que accede a otro servicio" o "acceso temporal" → **Rol**. "credenciales permanentes / access keys para la CLI" → **Usuario**.

**Informe de credenciales de IAM (Credential Report):** un archivo CSV que lista **todos los usuarios IAM** de la cuenta y el **estado de sus credenciales** (contraseña, **MFA**, access keys, últimos usos). Sirve para **auditar** y ver credenciales viejas o sin MFA. (udemy_1.6 #28)

**Permisos sobre S3 (dos tipos de política):**
- **Política de bucket**: basada en el **recurso** (se adjunta al bucket). Sirve para dar acceso a otras cuentas.
- **Política de usuario (IAM)**: basada en la **identidad** (se adjunta al usuario o rol).

### Identidad de usuarios y directorios (Cognito, SSO, AD)

| Servicio | Para qué |
|---|---|
| **Cognito User Pool** | **"Quién sos"**: registro e inicio de sesión de los usuarios de tu app (también con Google, Facebook o Apple). Devuelve tokens; **no da acceso a recursos de AWS**. |
| **Cognito Identity Pool** | **"Qué podés tocar en AWS"**: cambia una identidad (del User Pool, de Google, etc.) por **credenciales temporales de AWS**, y también atiende a **usuarios invitados** sin login. |
| **IAM Identity Center** | Acceso único (SSO) de tu **personal** a varias cuentas de AWS y aplicaciones. |
| **Directory Service** | Directorios compatibles con **Microsoft Active Directory**, o relaciones de confianza con tu AD local. |

> Pista: "usuarios de una app móvil, Google/Facebook, invitados, credenciales temporales de AWS" → **Cognito Identity Pool**. "Active Directory" → **Directory Service**.
> Suelen trabajar juntos: el usuario se loguea (User Pool o Google) y el **Identity Pool** le da las credenciales temporales para que la app use S3, DynamoDB, etc. Pistas que deciden: "**acceso temporal a recursos de AWS**" o "**invitados**" → Identity Pool.

### Servicios de seguridad, claves y certificados: quién hace qué

| Servicio | Qué hace |
|---|---|
| **GuardDuty** | **Detecta amenazas** y actividad sospechosa en tu cuenta (analiza CloudTrail, VPC Flow Logs y DNS con ML). |
| **Inspector** | **Escanea vulnerabilidades** en EC2, contenedores y Lambda. |
| **Macie** | **Descubre y protege datos sensibles (PII)** en **S3** con machine learning. |
| **Firewall Manager** | **Administra de forma centralizada** reglas de WAF, Shield Advanced y Security Groups en **varias cuentas** de Organizations. |
| **Security Hub** | Panel que **centraliza los hallazgos** de seguridad y cumplimiento. |
| **Detective** | **Investiga la causa raíz** de un hallazgo de seguridad. |
| **KMS** | Crea y gestiona **claves de cifrado** (HSM compartido/multitenant, lo normal). |
| **CloudHSM** | HSM de hardware **dedicado** en un solo tenant, exigencia normativa FIPS 140-2 Nivel 3. |
| **Secrets Manager** | Guarda y rota **secretos** (contraseñas, credenciales de bases de datos). **No** es para certificados SSL. |
| **ACM (Certificate Manager) / IAM** | **ACM** emite, gestiona e **importa** certificados SSL/TLS (HTTPS). **IAM** también permite subir certificados de servidor propios. |

> Pistas: "PII / datos sensibles en S3" → **Macie**. "amenazas / actividad maliciosa" → **GuardDuty**. "vulnerabilidades de software" → **Inspector**. "reglas centralizadas en varias cuentas" → **Firewall Manager**.

---

## 6. Monitoreo, Auditoría, Mensajería, IA y Atención al Cliente

### AWS Config vs CloudTrail vs CloudWatch
- **Config**: historial/estado de **configuración** de recursos ("cómo estaba configurado").
- **CloudTrail**: registro de **acciones** y llamadas a la API ("quién hizo qué y cuándo").

> Pista: "**gobernanza, cumplimiento y auditoría de la actividad de la cuenta**" → **CloudTrail**. "historial de **cómo estaba configurado** un recurso" → **Config**.

| Servicio | Qué responde | Palabras clave |
|---|---|---|
| **CloudTrail** | **¿Quién hizo qué, cuándo y desde dónde?** | actividad, auditoría, gobernanza, quién, llamada API |
| **Config** | **¿Cómo está configurado cada recurso y cómo cambió?** (compara con reglas) | configuración de recursos, historial de cambios, cumple la regla |
| **CloudWatch** | **¿Cómo rinde?** Métricas, logs y alarmas | rendimiento, monitoreo, alarma |
| **CloudWatch Logs** | Guarda y **ve los logs** de tus apps (EC2, Lambda). Podés **definir la retención** por grupo de logs. **Las alarmas son CloudWatch Alarms**, no Logs. | logs de aplicaciones, retención |

> Truco: **CloudTrail = quién (actividad)**, **Config = estado (configuración)**, **CloudWatch = rendimiento (métricas)**. (udemy1 #23: "actividad de la cuenta + auditoría" = CloudTrail; elegiste Config por confundir "cumplimiento".)

### Health Dashboard: Service Status vs Your Account
- **Service Status** (Estado del servicio) — antes "Service Health Dashboard": público, **sin login**, salud **general** de **todos** los servicios de AWS en todas las regiones. "¿AWS está bien en general?"
- **Your Account** (Estado de tu cuenta) — antes "Personal Health Dashboard / PHD": personalizado, **requiere login**, solo eventos que afectan a **tus** recursos. "¿me afecta a mí?" Está disponible en **todos los planes de Support**, incluido Basic.

> Pista: "público / todos los servicios / general" → **Service Status**. "personalizado / mis recursos / me afecta a mí" → **Your Account**.

### Las 5 categorías de Trusted Advisor
Revisa tu cuenta y te da **recomendaciones** en **5 categorías**:

| Categoría | Qué te dice | Ejemplos |
|---|---|---|
| **Optimización de costos** | Dónde estás **gastando de más** | EC2 con poco uso, EBS sin adjuntar, IP elásticas sin usar, Reservadas sin aprovechar |
| **Rendimiento** | Dónde podés ir **más rápido** | Instancias sobrecargadas, volúmenes EBS lentos, uso excesivo de reglas de SG |
| **Seguridad** | **Agujeros** de seguridad | Puertos abiertos al mundo en un SG, bucket S3 público, MFA faltante en root, claves IAM sin rotar |
| **Tolerancia a fallos** | Qué pasa si **algo se cae** | Sin Multi-AZ, sin backups o snapshots, sin Auto Scaling, un solo punto de falla |
| **Límites de servicio** | Si **estás llegando o ya llegaste** al tope de **cantidad** de recursos que tu cuenta puede crear (cuota). **No** habla de rendimiento. | Máximo de instancias EC2, VPCs o IP elásticas alcanzado → **no te deja crear más** (ej.: Auto Scaling no lanza instancias) |

> **Límites de servicio ≠ rendimiento.** Son **cuotas de la cuenta** (cuántos recursos te deja crear AWS), se pueden **subir pidiéndolo a Support**. Avisa cuando estás cerca (~80%) **y** cuando ya llegaste. "No me deja crear / lanzar más" → **Límites**. "Anda lento / sobrecargado" → **Rendimiento**. (udemy_1.2 #28: si Auto Scaling no lanza instancias y hay lentitud → **Límites + Rendimiento**.)
> Ojo: Trusted Advisor **recomienda**, no arregla solo. Con el plan **Basic/Developer** ves solo **pocos chequeos** (los **de seguridad principales y límites de servicio**); el set completo requiere **Business o Enterprise**.

### EventBridge vs SQS vs SNS vs Step Functions vs Amazon MQ
- **EventBridge**: **bus de eventos** serverless. Arquitecturas basadas en **eventos**, reglas de filtrado, reacciona en tiempo real (antes CloudWatch Events). También sirve para programar tareas tipo cron.
- **SQS**: **cola** de mensajes, punto a punto. Desacopla productor y consumidor y guarda mensajes de forma **duradera** hasta que se procesen.
- **SNS**: **pub/sub**, envía notificaciones a muchos suscriptores (incluido push y SMS).
- **Step Functions**: **orquesta** flujos de trabajo en secuencia (pasos).
- **Amazon MQ**: migrar brokers **existentes** (ActiveMQ, RabbitMQ, protocolos MQTT/AMQP) sin reescribir código. (SQS/SNS son para apps **nuevas** nativas de AWS).

> Pista: "eventos / reaccionar a cambios" → **EventBridge**. "cola" → **SQS**. "notificar a muchos" → **SNS**. "flujo de pasos" → **Step Functions**. "migrar ActiveMQ / RabbitMQ" → **Amazon MQ**.

**¿Qué es "desacoplar"? (a prueba de boludos)**
Hacer que dos partes de una app **no dependan directamente una de la otra**: si una se cae o va lenta, la otra sigue andando. Es como dejar una **nota en un buzón** en vez de llamar por teléfono y esperar que atiendan.
- **Acoplado:** la web llama directo a facturación y espera. Si facturación se cae, se rompe la web.
- **Desacoplado:** la web deja el mensaje en una **cola (SQS)** o lo **publica (SNS)** y sigue. Facturación lo toma cuando puede; el mensaje no se pierde.

> **"Desacoplar" microservicios → SQS y SNS** (los dos servicios de mensajería, y también EventBridge). **No** son la respuesta: **EC2** y **Lambda** (ejecutan código), **Step Functions** (orquesta pasos de un flujo). (udemy1 #36: respuesta SQS + SNS.)

### Comunicarse con usuarios finales, atención al cliente y escritorios

| Servicio | Qué hace |
|---|---|
| **Pinpoint** | Mensajes por **varios canales** (email, SMS, push) **y medir la participación** (marketing / engagement, si el usuario abrió o respondió). |
| **SES** | Solo **email** (transaccional o masivo). |
| **SNS** | Notificaciones y mensajería pub/sub (incluido push y SMS), sin analítica de participación. |
| **Amazon Connect** | **Centro de contacto** (call center) en la nube, omnicanal (voz y chat). Atención al cliente. |
| **Amazon Chime** | **Colaboración interna**: videollamadas, reuniones y mensajería. |
| **AppStream 2.0** | Transmite **una aplicación** de escritorio al navegador, sin instalarla. |
| **WorkSpaces** | Un **escritorio virtual completo** (DaaS). |

> Pistas:
> - "call center / atención al cliente (voz)" → **Connect**. "reuniones / videollamadas / chat internos" → **Chime**. "pasar archivos por SFTP" → **Transfer Family**. (Falladas_2 #26: "comunicación interna + atención al cliente por voz" = Chime + Connect, no Transfer Family.)
> - **Lex vs Connect:** Lex = **chatbot** (voz y texto). Connect = **call center completo** (omnicanal, enrutamiento, análisis). "Centro de atención al cliente" → **Connect** (udemy_1.6 #36).
> - "una app en el navegador" → **AppStream**. "escritorio completo" → **WorkSpaces**.

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

## 7. Facturación, Planes de Support, Well-Architected y CAF

### Herramientas de costos

| Herramienta | Para qué |
|---|---|
| **Pricing Calculator** | **Estimar** costos **antes** de construir / comparar on-prem vs AWS. |
| **Cost Explorer** | **Visualizar** costos históricos y tendencias. |
| **Budgets** | **Alertas** cuando el costo real/previsto supera un límite. 4 tipos: Cost, Usage, RI, Savings Plans. (CloudWatch Billing Alarm solo mide costo real, no previsto). |
| **Cost & Usage Report (CUR)** | El reporte más detallado de uso y costos (CSV a S3). |
| **Cost Anomaly Detection** | Detecta con **machine learning** un **aumento inesperado** de gasto y avisa. (Budgets avisa solo al pasar un **umbral que fijás vos**.) |

> Pista: "aumento **inesperado** / **anomalía** / machine learning" → **Cost Anomaly Detection**. "alerta al pasar un **límite**" → **Budgets**. "ver el gasto pasado" → **Cost Explorer**. "administrar **varias cuentas** y facturación consolidada" → **Organizations** (Cost Explorer solo analiza; udemy_1.6 #2 y #24).

**Etiquetas de asignación de costes:**
- Hay que **activarlas** por separado (las de AWS y las definidas por usuario).
- Cada clave de etiqueta es única por recurso y tiene **un solo valor**.

**Transferencia de datos y qué es gratis:**
- **Se cobra:** datos **entre regiones** (EC2 en distintas regiones), datos que **salen a internet**, IP elástica que queda **sin usar**.
- **No se cobra (gratis):** datos que **entran** a AWS desde internet (inbound), **S3 ↔ EC2 en la misma región**, tráfico dentro de la misma AZ por IP privada, **IP elástica adjunta a una instancia en ejecución**, y los servicios gratuitos en sí: **IAM, Auto Scaling, CloudFormation, VPC, Organizations** (solo pagás los recursos que crean). (udemy_1.6 #15)

**Créditos de AWS (cómo se aplican):**
- Se aplican **primero los que vencen antes** (por fecha de expiración).
- Cada crédito solo se usa **donde está permitido** (ciertos servicios).
- Si un servicio no tiene crédito aplicable, se factura completo.
- **Ejemplo (udemy1 #29):** crédito 1 = \$100, vence en julio, sirve para S3 o EC2. Crédito 2 = \$50, vence en diciembre, solo EC2. Cargos: EC2 \$1000, S3 \$500.
  1. Se usa **primero el que vence antes** (crédito 1) y se aplica al EC2 → EC2 queda en **\$900**.
  2. Después el crédito 2 (solo EC2) → baja EC2 a **\$850**.
  3. S3 no recibe crédito → sigue en **\$500**.
  Los créditos no se eligen ni se usa uno solo por ciclo: se aplican en orden de vencimiento.

### Planes de AWS Support (de menor a mayor)

| Plan | Qué incluye | Respuesta ante problema grave |
|---|---|---|
| **Basic** | Gratis, solo docs, foros y Health Dashboard. | Sin soporte técnico |
| **Developer** | Email en horario laboral (no 24x7, no teléfono). Guía general. | Horario laboral (en horas) |
| **Business** | El **más barato** con teléfono/chat 24x7 + Trusted Advisor completo + **soporte/orientación de arquitectura** contextual. (**NO** tiene TAM). | Producción caída: **< 1 hora** |
| **Enterprise On-Ramp** | Pool de TAMs compartido, 1 revisión/año. | Sistema crítico caído: **< 30 minutos** |
| **Enterprise** | **TAM dedicado**, **IEM** (Infrastructure Event Management), revisiones **Well-Architected** y de operaciones, **Concierge**. | Sistema crítico caído: **< 15 minutos** |

> Pista: "respuesta en menos de **15 minutos** para un sistema crítico / TAM / IEM / revisiones Well-Architected" → **Enterprise** (te salió así en cuatro exámenes).
> Pista: "beneficio relacionado con el **diseño de soluciones / arquitectura**" en Business → **Soporte de arquitectura**.
> **AWS Health Dashboard – Your Account** está disponible en **todos los planes**, incluido Basic.

> ⚠️ **Aviso:** a fines de 2025 AWS reestructuró los planes de soporte (por ejemplo, [Business Support+ reemplaza a Business](https://on-promise.cloud/en/compendium/what-aws-support-really-costs), y la [documentación oficial de AWS](https://docs.aws.amazon.com/awssupport/latest/user/aws-support-plans.html) confirma que Developer, Business y Enterprise On-Ramp terminan el 1/1/2027). Los bancos de preguntas usan los nombres clásicos. Si el 19 ves nombres nuevos, según esa documentación: **Business Support+** (24x7, respuesta en menos de 30 minutos en sistema crítico caído, con asistencia de IA), **Enterprise** (TAM asignado, respuesta de 15 minutos) y **Unified Operations** (guía de arquitectura de aplicaciones, IEM, y TAM con especialista).

### Herramientas de Gobernanza

| Herramienta | Para qué |
|---|---|
| **AWS Artifact** | Descargar reportes de compliance (PCI, SOC, ISO). |
| **Trusted Advisor** | Recomendaciones en 5 categorías (Costos, Rendimiento, Seguridad, Tolerancia a fallos, Límites de servicio). |
| **Service Catalog** | Catálogo de soluciones TI preaprobadas. |
| **Control Tower** | Crear un entorno **multi-cuenta** seguro (landing zone) con guardrails y buenas prácticas desde el inicio. |
| **Compute Optimizer** | Recomienda tipo de EC2, Auto Scaling, EBS, Lambda (**no** S3/EFS). |

### Well-Architected Framework — 6 pilares
**Una palabra por pilar** (mismo orden que el framework):

| Pilar | En una palabra | Palabras clave en la pregunta |
|---|---|---|
| **Excelencia operativa** | **Operar** | automatizar, operaciones como código, monitorear, mejorar procesos |
| **Seguridad** | **Proteger** | identidad, cifrado, trazabilidad (logs), permisos |
| **Fiabilidad** | **Resistir** | recuperarse de fallos, escalar horizontal, probar la recuperación |
| **Eficiencia del rendimiento** | **Rendir** | recurso del tipo y tamaño correcto, serverless, adaptarse a la demanda |
| **Optimización de costos** | **Ahorrar** | pagar solo lo que usás, evitar gasto innecesario |
| **Sostenibilidad** | **Cuidar el planeta** | impacto ambiental, maximizar la utilización de recursos |

**Truco con las iniciales en inglés: `SCORPS`** (escorpiones 🦂): **S**ecurity, **C**ost optimization, **O**perational excellence, **R**eliability, **P**erformance efficiency, **S**ustainability. Sirve para chequear que no te falte ninguno; el orden no importa.

> **Ejemplos de Excelencia operativa (te salió en un examen):** **cambios pequeños, frecuentes y reversibles** (por ejemplo, actualizaciones incrementales con **CodeDeploy**), **game days** (simular fallos y recuperación para practicar), operaciones como código y aprender de las fallas. Lo manual (consola, ajustar a mano) es lo contrario.
> **Costos vs Rendimiento (se pisan):** ambos hablan de "elegir bien los recursos". Si el énfasis está en **no gastar de más / presupuesto / no sobreaprovisionar** → **Optimización de costos**. Si el énfasis está en **elegir el tipo y tamaño que cumple el requisito y adaptarse a la demanda o a tecnología nueva** → **Eficiencia del rendimiento**.
> ⚠️ **Trampa:** Escalabilidad / Disponibilidad / Elasticidad **no** son pilares.

### Cloud Adoption Framework (CAF) — 6 perspectivas y 4 fases
El **AWS CAF** organiza la adopción de la nube en **6 perspectivas**, agrupadas en negocio (las 3 primeras) y técnicas (las 3 últimas).

> **Truco:** _"**N**egocio, **P**ersonas y **G**obernanza mandan; **P**lataforma, **S**eguridad y **O**peraciones ejecutan."_ (N-P-G | P-S-O)

> **No mezclar con Well-Architected:**
> - **Well-Architected** (6 **pilares**) = cómo **diseñar bien una carga de trabajo / arquitectura**.
> - **CAF** (6 **perspectivas**) = cómo **adoptar la nube como organización** (personas, gobierno, negocio, migración).
> - Pista: "arquitectura / carga de trabajo / buenas prácticas de diseño" → Well-Architected. "adopción / transformación / ROI / personas / organización" → CAF.

| Perspectiva | Grupo | De qué se encarga | Roles típicos |
|---|---|---|---|
| **Business** (Negocio) | Negocio | ROI, caso de negocio, resultados | CEO, CFO, CDO |
| **People** (Personas) | Negocio | Cultura, habilidades, gestión del cambio | RR.HH., CIO |
| **Governance** (Gobernanza) | Negocio | ROI y gestión de beneficios, cartera/portafolio, **gestión de riesgos**, gestión financiera, **gobernanza y curación de datos** | CIO, PMO |
| **Platform** (Plataforma) | Técnica | Arquitectura, infraestructura, aprovisionar servicios | **CTO, arquitectos, ingenieros** |
| **Security** (Seguridad) | Técnica | Identidad, cumplimiento, protección de datos | CISO, equipos de seguridad |
| **Operations** (Operaciones) | Técnica | Operar, monitorear y recuperar cargas | COO, soporte TI |

> **Trampa:** si la pregunta menciona CTO/ingenieros/arquitectos → perspectiva **Plataforma** (técnica). Si menciona ROI/portafolio/riesgos/gobernanza o curación de datos → **Gobernanza**.

**Buenas prácticas de transformación organizacional (CAF):**
- Organizar equipos en torno a **productos y flujos de valor**.
- Usar **métodos ágiles** para iterar y evolucionar rápido.

**Las 4 fases de la transformación (CAF):**

| Fase | En español | Qué se hace | Palabra clave en la pregunta |
|---|---|---|---|
| **Envision** | Visualizar | Definir cómo la nube acelera los resultados de negocio; identificar oportunidades y partes interesadas. | "visión", "oportunidades", "casos de negocio" |
| **Align** | Alinear | Identificar brechas de capacidades entre perspectivas, planes de acción, **planificar y capacitar** equipos. | "brechas", "plan", "capacitación", "alinear a los equipos" |
| **Launch** | Lanzar | Poner en producción **proyectos piloto** y demostrar valor concreto. | "piloto", "primeros proyectos", "probar el modelo operativo" |
| **Scale** | Escalar | Ampliar los pilotos a la escala deseada y obtener todos los beneficios. | "expandir", "llevar a toda la organización", "migrar sistemas críticos" |

> Regla mental: **Visualizar → Alinear → Lanzar → Escalar** (V-A-L-E). "Planificar" **no** es una fase del CAF (es un distractor). Planificación y capacitación ya hechas + primeros pilotos → **Launch (Lanzar)**.

### 7 R de migración (estrategias)

| Estrategia (las 7 R) | Apodo / Idea corta | Ejemplo clásico en el examen |
|---|---|---|
| **1. Rehost** (Realojar) | **Lift and Shift** (levantar y mover sin tocar nada) | Pasar un servidor físico/VM tal como está a **Amazon EC2**. |
| **2. Relocate** (Reubicar) | Mover el hipervisor entero sin convertir VMs | Mover máquinas de VMware local a **VMware Cloud on AWS**. |
| **3. Replatform** (Replataformar) | **Lift, Tinker and Shift** (cambiar a servicio gestionado sin reescribir código) | Pasar una base de datos MySQL en EC2 a **Amazon RDS** (o app a Elastic Beanstalk). |
| **4. Refactor / Re-architect** (Refactorizar) | Rediseñar el código a **cloud-native / serverless** | Pasar un monolito a microservicios con **AWS Lambda y DynamoDB**. |
| **5. Repurchase** (Recomprar) | Cambiar por un **SaaS** comercial ("Drop and Shop") | Dejar el CRM propio y contratar **Salesforce** (o Workday). |
| **6. Retain** (Retener) | Dejarlo **on-premises** por ahora | App con regulación estricta, hardware viejo o próxima a jubilarse. |
| **7. Retire** (Retirar) | **Apagar y dar de baja** lo que no se usa | Servidores duplicados o sin uso que se apagan para ahorrar. |

#### 1. Rehost (Realojar) — "Agarrar los muebles y meterlos en el camión"
- **La idea:** Es el famoso **Lift and Shift** (levantar y mover). Llevás el servidor tal como está a una instancia de Amazon EC2, sin modificar el código de la aplicación.
- **Ejemplo:** Tenés un servidor Linux con una aplicación antigua. Creás una imagen del servidor y la ejecutás en EC2 con la misma configuración.
- **Cuándo se usa:** Cuando hay poco tiempo para salir del centro de datos, por ejemplo, porque está por vencer el contrato del edificio.

#### 2. Relocate (Reubicar) — "Mudarte de edificio sin sacar nada de las cajas"
- **La idea:** Es parecido a Rehost, pero movés una plataforma virtualizada completa —por ejemplo, a nivel de hipervisor— sin convertir cada máquina virtual ni reescribir las aplicaciones.
- **Ejemplo:** Migrás máquinas virtuales de VMware local a VMware Cloud on AWS, conservando la plataforma VMware.
- **Diferencia clave con Rehost:** En Rehost, migrás servidores individuales a servicios como EC2. En Relocate, movés el entorno virtualizado como un conjunto, manteniendo la tecnología base.

#### 3. Replatform (Replataformar) — "Llevarte la mesa, pero cambiarle las patas"
- **La idea:** Es **Lift, Tinker and Shift** (levantar, retocar un poco y mover). Conservás la aplicación, pero hacés algunos cambios para aprovechar servicios administrados de AWS.
- **Ejemplo:** En vez de mantener MySQL en una instancia EC2 y encargarte de sus parches y respaldos, migrás la base de datos a Amazon RDS.
- **Cuándo se usa:** Cuando querés reducir el trabajo operativo sin iniciar un proyecto largo de reescritura.

#### 4. Refactor / Re-architect (Refactorizar o rediseñar) — "Demoler y construir a medida"
- **La idea:** Rediseñás la aplicación para aprovechar capacidades de la nube. Puede requerir cambios importantes en el código y la arquitectura.
- **Ejemplo:** Transformás una aplicación monolítica en servicios independientes que usan AWS Lambda y DynamoDB.
- **Cuándo se usa:** Cuando necesitás escalar más, incorporar funcionalidades que la arquitectura anterior no soporta o mejorar costos y agilidad a largo plazo. Suele requerir más tiempo e inversión que las otras estrategias.

#### 5. Repurchase (Recomprar) — "Tirar tu cocina y contratar un catering"
- **La idea:** Reemplazás el software actual por otro producto, normalmente una solución SaaS, y dejás de mantener la aplicación anterior.
- **Ejemplo:** Reemplazás un CRM instalado en tus servidores por un servicio como Salesforce, o un sistema de gestión de empleados por Workday.

#### 6. Retain (Retener) — "Dejar algunas cosas en la casa vieja por ahora"
- **La idea:** Decidís no migrar ciertas aplicaciones y mantenerlas en tus servidores locales (on-premises).
- **Por qué hacerlo:** La aplicación puede depender de hardware específico, estar sujeta a requisitos legales o regulatorios, o tener fecha de retiro próxima, haciendo que migrarla no valga la pena.

#### 7. Retire (Retirar) — "Tirar lo que no sirve antes de mudarte"
- **La idea:** Durante el inventario, encontrás servidores o aplicaciones que ya no se usan, están duplicados o no aportan valor, y los apagás y das de baja.
- **Beneficio:** Evitás gastar tiempo y dinero migrando recursos innecesarios y reducís sus costos operativos.

### Socios (APN) vs AWS Managed Services (AMS)
- **Consulting Partner** (socio **consultor**) → servicios profesionales: **asesorar**, diseñar, migrar y gestionar cargas. Pista: "asesoramiento / migración" → consultor. (Falladas_2 #3.)
- **Technology Partner** → venden **software o hardware** (SaaS, PaaS, seguridad, herramientas) que corre en AWS. (udemy_1.6 #38: "proveedores de software" → Technology.)
- **AWS Managed Services (AMS)** **no es un partner**: es un **equipo de AWS** que **opera tu entorno por vos** (parches, monitoreo, incidentes, gobernanza). Pista: "**equipo de AWS** que opera/mantiene mi nube" → **AMS**. (udemy_1.6 #37)

---

## 8. Global vs Regional vs Zonal — NO confundir los 3 conceptos

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
> **\*Trampa S3:** es **regional**. Confunde porque el **nombre del bucket es único a nivel global**, pero el bucket vive en una región que vos elegís.

### Eje 3 — Dentro de una región, ¿cuántas AZs abarca el recurso?
- **VPC** → abarca **todas las AZs** de su región.
- **Subred** → vive en **una sola AZ**.

**Zonal vs Regional: cómo darte cuenta**
- **Regla práctica:** al crearlo, ¿te pide elegir una **AZ o una subred**? → es **zonal**. Si no te lo pide y AWS lo replica solo entre AZ → es **regional**.

| Alcance | Servicios | Regla mental |
|---|---|---|
| **Zonal** (1 AZ) | **EC2**, **EBS**, **Instance Store**, subred, NAT Gateway | Es una máquina o un disco atado a una AZ. |
| **Zonal por defecto** | **RDS**, **Redshift** | Usan instancias por debajo; para alta disponibilidad hay que activar **Multi-AZ**. |
| **Regional** (varias AZ) | **S3**, **DynamoDB**, **EFS**, **Lambda**, **SQS**, **SNS**, **ELB**, VPC | No elegís AZ para los datos; AWS replica solo. |
| **Global** | IAM, Route 53, CloudFront, WAF, Shield, Organizations | No te pide región. |

> **Excepciones que conviene saber:** **S3 One Zone-IA** y **EFS One Zone** guardan en **una sola AZ** a propósito (más baratos, menos resistentes). En **ELB** vos elegís en qué AZ lo habilitás, pero el servicio sigue siendo regional.

**Cómo deducirlo sin memorizar (3 preguntas):**
1. ¿Hay un **servidor, o un disco pegado a un servidor**, detrás? (EC2, EBS, Instance Store, la instancia de RDS o Redshift) → **zonal**.
2. ¿Es un **servicio "puro"** donde no ves servidores y AWS copia los datos solo entre AZ? (S3, DynamoDB, EFS, SQS, SNS, Lambda) → **regional**.
3. Prueba final: **¿sobrevive solo a la caída de una AZ?** Si tenés que hacer algo (activar Multi-AZ, tomar snapshots) → zonal. Si ya sobrevive solo → regional.

> El **tipo** de almacenamiento (bloque, objeto, archivo) **no decide** el alcance. **EBS** es bloque y es **zonal**; **S3** es objeto y es **regional**; **EFS** es archivo y es **regional**. Un volumen EBS solo se conecta a una EC2 de **su misma AZ**.

**Palabras mínimas para no confundirte**

| S3 | Qué recordar |
|---|---|
| **Bucket** | **Regional**: lo creás en una región y ahí vive. AWS copia los datos entre varias AZ solo. |
| **Nombre del bucket** | **Único en todo el mundo.** Solo el *nombre* es global; la consola los muestra todos juntos, pero cada bucket tiene su región. |
| **One Zone-IA** | **1 sola AZ** (la excepción). |
| **Replicación entre regiones (CRR)** | Para tener una copia en **otra región**. |

| EC2 | Qué recordar |
|---|---|
| **Instancia** y **volumen EBS** | **Zonales**: viven en una AZ (la de su subred). |
| **AMI, snapshot de EBS, Security Group, key pair, IP elástica** | **Regionales**. |
| **Auto Scaling y ELB** | **Regionales**: reparten las instancias entre AZ. |

> Regla corta: **lo que corre y su disco = zonal. Lo que lo describe o lo respalda = regional.**
> Fijate la clave: una **VPC** es regional (eje 2) y lógica/no-infra-global (eje 1) **a la vez**. Son ejes separados; respondé según lo que pregunte el enunciado.

### Resiliencia: qué te protege de qué

| Despliegue | Si falla una AZ (un datacenter) | Si falla una región entera |
|---|---|---|
| **Una sola AZ** | Cae todo | Cae todo |
| **Varias AZ, una región** (Multi-AZ) | Sigue funcionando | Cae todo |
| **Una AZ en cada una de varias regiones** | Esa región cae; las otras siguen | Siguen las otras regiones |
| **Varias AZ en varias regiones** | Cada región sigue sola | Siguen las otras regiones |

> Pistas: "caída de un datacenter / alta disponibilidad" → **Multi-AZ**. "desastre regional / usuarios en varios continentes" → **varias regiones**. "el nivel más alto de resiliencia" → **varias AZ en varias regiones**.

### Recuperación ante Desastres (Disaster Recovery - DR): RTO vs RPO y las 4 estrategias

#### 1. RTO vs RPO (no mezclarlas)
- **RTO (Recovery Time Objective) = TIEMPO CAÍDO** (*mirando hacia adelante desde el corte*): ¿Cuánto **tiempo máximo** puede estar el sistema **fuera de servicio** hasta que vuelve a funcionar? (Ej.: *"el banco exige volver a operar en menos de 30 minutos"* → **RTO = 30 min**).
- **RPO (Recovery Point Objective) = PÉRDIDA DE DATOS** (*mirando hacia atrás hacia el último backup*): ¿Cuántos **datos generados** (medidos en tiempo) tolerás **perder**? (Ej.: *"hacemos backup cada 4 horas; si cae a las 14:00 perdemos 2 horas de datos desde las 12:00"* → **RPO**).

> **Truco mental:** **RTO** (**T**ime) = **T**iempo sin servicio (inactividad). **RPO** (**P**oint) = **P**érdida de datos (hasta qué **p**unto en el pasado volvés).

#### 2. Las 4 estrategias de DR (de más barata/lenta a más cara/instantánea)

| Estrategia | Analogía criolla | Qué hay encendido en la región secundaria | RTO / RPO | Palabra clave en la pregunta |
|---|---|---|---|---|
| **1. Backup and Restore** (Respaldo y restauración) | *"Guardé los planos y las cajas en un depósito"* | **Nada de cómputo.** Solo backups (S3, snapshots, AMIs). Si hay desastre, creás los servidores desde cero. | Horas / Horas (el **más lento y más barato**) | "menor costo posible", "solo backups y AMIs, sin cómputo activo" |
| **2. Pilot Light** (Luz piloto — como el calefón) | *"La llamita del calefón está prendida, pero los quemadores apagados"* | **Solo la base de datos replicándose en vivo** (el núcleo). Los servidores de aplicación (EC2) están **apagados** y se prenden en el desastre. | Decenas de min / Minutos | "base de datos sincronizada/replicada, pero servidores de apps apagados" |
| **3. Warm Standby** (Espera tibia / activa reducida) | *"El auto en marcha regulando en la puerta, pero un auto chiquito"* | **Toda la arquitectura (BD + servidores web/apps) está encendida y funcionando**, pero en **tamaño mínimo / escala reducida**. Ante el desastre, solo hace falta escalar (scale out/up). | Minutos / Segundos | "versión reducida a escala", "mínima capacidad operativa siempre encendida" |
| **4. Multi-Site Active-Active** (Activo-Activo) | *"Dos locales iguales abiertos al público al mismo tiempo"* | **Todo encendido al 100% de capacidad en 2+ regiones**, recibiendo tráfico real en simultáneo (con Route 53). | **Cero (tiempo real)** / Casi cero (el **más caro**) | "RTO/RPO cercanos a cero", "tráfico activo en ambas regiones a capacidad completa" |

> **Cómo diferenciar `Pilot Light` de `Warm Standby` (la trampa clásica):**
> - ¿Los servidores de aplicaciones (EC2) están **apagados** y solo la **base de datos** está activa? → **Pilot Light**.
> - ¿Los servidores de aplicaciones **YA están encendidos** corriendo todo el stack pero en **tamaño chiquito (escala reducida)**? → **Warm Standby**.

---

## 9. Glosario rápido (términos que aparecen en las preguntas)

| Término | Qué es |
|---|---|
| **Multipart Upload** (S3) | Subir un archivo grande **partido en pedazos que se suben en paralelo**; S3 los junta al final. Es más rápido y, si un pedazo falla, repetís solo ese. Principio: **aprovechar el procesamiento paralelo**. |
| **ETL** | **E**xtraer datos de un lado, **T**ransformarlos (limpiarlos, ordenarlos) y **C**argarlos en otro lado (Load). |
| **Apache Spark / Hadoop** | Herramientas para procesar **enormes volúmenes de datos repartidos en muchas máquinas**. |
| **EMR** (Elastic MapReduce) | Servicio que te arma un **clúster ya listo** para correr Spark o Hadoop, sin que instales nada. Pista: "big data / Spark / Hadoop / ETL masivo" → EMR. |
| **BYOL** (Bring Your Own License) | **"Traé tu propia licencia"**: usás en AWS una licencia de software que **ya compraste**, en vez de pagar la que viene incluida en el precio ("License Included"). En RDS estándar: **Oracle** admite BYOL; **SQL Server** viene con licencia incluida; **MySQL y PostgreSQL** son de código abierto (sin licencia que pagar). En EC2, para licencias atadas a servidor físico → **Dedicated Host**. |
| **RDP** (Remote Desktop Protocol) | Protocolo para **controlar el escritorio de una máquina Windows** a distancia. Puerto **3389**. |
| **SSH** | Lo mismo para máquinas **Linux**, pero por línea de comandos. Puerto **22**. |
| **Pinpoint** | Servicio de **marketing / engagement**: manda mensajes por email, SMS y push **y mide** si el usuario los abrió o respondió. |
| **Gobernanza de datos / curación de datos** | Capacidades de la perspectiva de **Gobernanza** del CAF: definir **reglas y responsables** de los datos, y mantenerlos **organizados y con buena calidad**. |

**Puertos que suelen aparecer:** SSH **22**, HTTP **80**, HTTPS **443**, RDP **3389**, MySQL **3306**.

---

## Estrategia final

- Repasá por **contrastes** (A vs B), no servicio suelto.
- Rehacé los simulacros en **modo Jedi** hasta sacar **85%+** estable.
- Leé la **última línea** de la pregunta primero (MOST/LEAST/NOT).
- En "Selecciona dos/tres": marcá **exactamente** esa cantidad.
- Si **sabés que las opciones que conocés no cumplen** lo que pide la pregunta, elegí la que **no conocés**. Descartar por eliminación funciona aunque no sepas qué es.
