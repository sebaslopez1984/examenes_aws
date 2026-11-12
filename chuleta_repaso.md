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

### AWS Config vs CloudTrail
- **Config**: historial/estado de **configuración** de recursos ("cómo estaba configurado").
- **CloudTrail**: registro de **acciones** y llamadas a la API ("quién hizo qué y cuándo").

> Pista: "**gobernanza, cumplimiento y auditoría de la actividad de la cuenta**" → **CloudTrail**. "historial de **cómo estaba configurado** un recurso" → **Config**.

### Health Dashboard: Service Status vs Your Account
- **Service Status** (Estado del servicio) — antes "Service Health Dashboard": público, **sin login**, salud **general** de **todos** los servicios de AWS en todas las regiones. "¿AWS está bien en general?"
- **Your Account** (Estado de tu cuenta) — antes "Personal Health Dashboard / PHD": personalizado, **requiere login**, solo eventos que afectan a **tus** recursos. "¿me afecta a mí?"

> Pista: "público / todos los servicios / general" → **Service Status**. "personalizado / mis recursos / me afecta a mí" → **Your Account**.

### Amazon MQ vs SQS / SNS
- **Amazon MQ**: migrar brokers **existentes** (ActiveMQ, RabbitMQ) sin reescribir código.
- **SQS / SNS**: para apps **nuevas** nativas de AWS (SQS = colas, SNS = pub/sub notificaciones).

### EventBridge vs SQS vs SNS vs Step Functions
- **EventBridge**: **bus de eventos** serverless. Arquitecturas basadas en **eventos**, reglas de filtrado, reacciona en tiempo real (antes CloudWatch Events). También sirve para programar tareas tipo cron.
- **SQS**: **cola** de mensajes, punto a punto. Desacopla productor y consumidor.
- **SNS**: **pub/sub**, envía notificaciones a muchos suscriptores.
- **Step Functions**: **orquesta** flujos de trabajo en secuencia.

> Pista: "eventos / reaccionar a cambios" → **EventBridge**. "cola" → **SQS**. "notificar a muchos" → **SNS**. "flujo de pasos" → **Step Functions**.

**Cuándo SQS (y cuándo no):**
- SÍ: **desacoplar** componentes y guardar mensajes de forma **duradera** hasta que se procesen.
- NO: protocolos estándar MQTT/AMQP → **Amazon MQ**. Coordinar un flujo de trabajo → **Step Functions**. Notificaciones push a móviles → **SNS**.

**Comunicarse con usuarios finales:**
- **Pinpoint**: mensajes por **varios canales** (email, SMS, push) **y medir la participación** (marketing / engagement).
- **SES**: solo **email** (transaccional o masivo).
- **SNS**: notificaciones y mensajería pub/sub (incluido push y SMS), sin analítica de participación.

### Entorno híbrido (on-premises + AWS)
- **Systems Manager** y **CodeDeploy** funcionan también sobre servidores locales (con agente).
- Elastic Beanstalk, CloudFormation y Batch trabajan solo sobre infraestructura de AWS.
- **Outposts**: lleva la infraestructura, servicios, APIs y herramientas de AWS a **tu datacenter local** (híbrido con la misma experiencia). Pista: "mismas APIs y herramientas en local y en la nube" → Outposts.
- **Wavelength**: servicios de AWS dentro de redes **5G** de operadores (no confundir con Outposts).
- **Storage Gateway**: conecta tu almacenamiento **local** con el de AWS, con acceso local de baja latencia. Sirve para ampliar capacidad sin migrar todo a la nube. Pista: "ampliar almacenamiento local" + "híbrido" → Storage Gateway.

### Session Manager vs EC2 Instance Connect
- **Session Manager**: shell seguro **sin abrir puertos ni IP pública** (lo más seguro).
- **Instance Connect**: necesita abrir el **puerto 22** (SSH).

### KMS vs CloudHSM
- **KMS**: gestión de claves, HSM compartido/multitenant (lo normal).
- **CloudHSM**: HSM de hardware **dedicado**, exigencia normativa FIPS 140-2 Nivel 3.

### Firewalls y protección de red: SG vs NACL vs WAF vs Shield vs Network Firewall

| Servicio | Dónde actúa | Qué hace |
|---|---|---|
| **Security Group** | **Instancia** (EC2) | Firewall con estado (stateful). Solo reglas de **permitir**. |
| **NACL** | **Subred** | Sin estado (stateless). Reglas de **permitir y denegar**. |
| **AWS WAF** | **Capa 7** (HTTP/HTTPS) | Bloquea ataques web (inyección SQL, XSS). Se asocia a CloudFront, ALB, API Gateway. |
| **AWS Shield** | Capas 3/4 | Protección contra **DDoS**. Standard es gratis y automático; Advanced es de pago. |
| **AWS Network Firewall** | **VPC completa** (perímetro) | Firewall de red **gestionado**: inspecciona el tráfico que entra y sale de la VPC con reglas propias (stateful y stateless), filtrado por dominio/IP y detección de intrusiones. Escala solo. |

**Qué es Network Firewall en una frase:** un firewall gestionado para proteger toda tu VPC, con inspección profunda del tráfico, más potente que un Security Group o una NACL.

> Pistas:
> - "a nivel de instancia, solo permitir" → **Security Group**
> - "a nivel de subred, permitir y denegar" → **NACL**
> - "inyección SQL / XSS / HTTP" → **WAF**
>   - WAF también puede **bloquear todo salvo lo que permitas** y filtrar por IP, URL y encabezados.
>   - La protección contra DDoS de capas 3 y 4 y el equipo DRT son de **Shield Advanced**, no de WAF.
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

### Servicios de seguridad: quién hace qué

| Servicio | Qué hace |
|---|---|
| **GuardDuty** | **Detecta amenazas** y actividad sospechosa en tu cuenta (analiza CloudTrail, VPC Flow Logs y DNS con ML). |
| **Inspector** | **Escanea vulnerabilidades** en EC2, contenedores y Lambda. |
| **Macie** | **Descubre y protege datos sensibles (PII)** en **S3** con machine learning. |
| **Firewall Manager** | **Administra de forma centralizada** reglas de WAF, Shield Advanced y Security Groups en **varias cuentas** de Organizations. |
| **Security Hub** | Panel que **centraliza los hallazgos** de seguridad y cumplimiento. |
| **Detective** | **Investiga la causa raíz** de un hallazgo de seguridad. |
| **KMS** | Crea y gestiona **claves de cifrado**. |
| **Secrets Manager** | Guarda y rota **secretos** (contraseñas, credenciales de bases de datos). |

> Pistas: "PII / datos sensibles en S3" → **Macie**. "amenazas / actividad maliciosa" → **GuardDuty**. "vulnerabilidades de software" → **Inspector**. "reglas centralizadas en varias cuentas" → **Firewall Manager**.

### Herramientas de desarrollo y despliegue

| Servicio | Para qué |
|---|---|
| **CodeCommit** | Repositorio Git para el código. |
| **CodeBuild** | **Compila y prueba** el código. |
| **CodeDeploy** | **Despliega** el código en EC2, Lambda o servidores locales. |
| **CodePipeline** | Orquesta todo el flujo de entrega continua (CI/CD). |
| **Device Farm** | **Prueba apps móviles y web en dispositivos reales** con distintas versiones de SO y firmware, sin tener los equipos. |
| **X-Ray** | **Rastrea y depura** aplicaciones distribuidas (microservicios, serverless) para encontrar cuellos de botella. |
| **CloudFormation** | Infraestructura como código: define y despliega recursos con plantillas. |
| **Elastic Beanstalk** | Despliega aplicaciones web sin administrar la infraestructura (PaaS). |

> Pista: "probar la app en muchos **dispositivos móviles**" → **Device Farm**. "depurar **microservicios**" → **X-Ray**. "**desplegar** código" → CodeDeploy; "**compilar**" → CodeBuild.

### Comunicación, atención al cliente y escritorios

| Servicio | Qué hace |
|---|---|
| **Amazon Connect** | **Centro de contacto** (call center) en la nube, omnicanal (voz y chat). Atención al cliente. |
| **Amazon Chime** | **Colaboración interna**: videollamadas, reuniones y mensajería. |
| **AppStream 2.0** | Transmite **una aplicación** de escritorio al navegador, sin instalarla. |
| **WorkSpaces** | Un **escritorio virtual completo** (DaaS). |

> Pista: "call center / atención al cliente" → **Connect**. "reuniones / videollamadas internas" → **Chime**. "una app en el navegador" → **AppStream**. "escritorio completo" → **WorkSpaces**.

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
| **Glacier Deep Archive** | Lo **más barato**, retención 7-10 años (compliance). Recuperación en **12 h (estándar)** o 48 h (masiva). |

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

> Regla: cuanto más "frío", **más barato guardar pero más lento (y con fee) recuperar**. Solo Standard e Intelligent-Tiering no cobran por recuperar.

### Reglas de oro S3
- Cifrado: S3 viene cifrado **por defecto**.
- Durabilidad de **11 nueves** (99,999999999%), almacenamiento **ilimitado**, es de **objetos** (no bloques, no NoSQL).
- Transferencia de datos de **entrada** desde internet: **gratis**.
- S3 ↔ EC2 en la **misma región**: **gratis**.
- "almacenar datos 7-10 años, lo más barato" → **Glacier Deep Archive**.
- "se accede **rara vez** pero cuando hace falta la recuperación debe ser **instantánea**" → **Standard-IA** (milisegundos). Glacier Flexible y Deep Archive tardan minutos u horas.
- Igual que lo anterior pero los datos **se pueden volver a generar** y se acepta menos durabilidad (1 sola AZ) → **One Zone-IA**.
- **Cómo leer estas preguntas:** buscá tres datos: **qué tan seguido** se accede, **qué tan rápido** hace falta el dato y **cuánta durabilidad** se necesita. "Rápido" descarta Glacier Flexible y Deep Archive (tardan minutos u horas). "Se puede volver a generar" o "acepto menos durabilidad" apunta a **One Zone-IA**, aunque no diga "una sola AZ".
- Lifecycle rules (mover entre clases automáticamente) → solo S3.

### Precios EBS / EFS (detalle que te sale mal)
- **EBS snapshots**: incrementales, solo pagás los bloques modificados.
- **EFS Infrequent Access (IA)**: más barato de almacenar **pero** cobra tarifa cada vez que leés o escribís un archivo.
- Proteger S3 de borrado accidental → **S3 Versioning** (guarda versiones).

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

### Replicar una infraestructura a otra región: AMI vs CloudFormation
- **Una instancia EC2** (con su SO, software y configuración): crear una **AMI** y **copiarla** a la otra región.
- **Toda la infraestructura** (red, instancias, bases, etc.): **CloudFormation** (plantillas, infraestructura como código). Es lo más rápido y repetible.
- **Recuperación ante desastres de EC2:** **AMI** + **snapshots de EBS**. Los snapshots de RDS son para la base de datos, no para las instancias EC2.
- **Latencia para usuarios de otros continentes:** desplegar en **regiones cercanas** a ellos ("Go Global in minutes"), no una región única con más capacidad.

### Bases de datos — RDS (concepto que fallás seguido)

| Config | Para qué |
|---|---|
| **Read Replica** | Escala la **lectura** (copias solo-lectura). Rendimiento. |
| **Multi-AZ** | Alta **disponibilidad** (failover automático a otra AZ). |
| **Multi-Región** | Protege ante fallo de una **región** entera. |
| **DynamoDB** | NoSQL, serverless, **se ajusta solo a la demanda** (sin preocuparte por aprovisionar), sirve para datos no estructurados o semiestructurados, latencia de milisegundos, HA por defecto (multi-AZ). **No** hace consultas con joins complejos. Los **11 nueves** de durabilidad son de **S3**, no de DynamoDB. |
| **Redshift** | **Data warehouse** (OLAP): consultas complejas sobre grandes volúmenes históricos y BI. RDS es transaccional (OLTP). |
| **Neptune** | Base de datos de **grafos**. |

---

## 4. Gobierno / Soporte / Facturación

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

> Para repasar: tapá la columna del medio y tratá de decir la palabra de cada pilar.

> **Ejemplos de Excelencia operativa (te salió en un examen):** **cambios pequeños, frecuentes y reversibles** (por ejemplo, actualizaciones incrementales con **CodeDeploy**), **game days** (simular fallos y recuperación para practicar), operaciones como código y aprender de las fallas. Lo manual (consola, ajustar a mano) es lo contrario.

> **Costos vs Rendimiento (se pisan):** ambos hablan de "elegir bien los recursos". Si el énfasis está en **no gastar de más / presupuesto / no sobreaprovisionar** → **Optimización de costos**. Si el énfasis está en **elegir el tipo y tamaño que cumple el requisito y adaptarse a la demanda o a tecnología nueva** → **Eficiencia del rendimiento**. Los bancos de preguntas no son consistentes en esto: leé qué palabra pesa más.

> ⚠️ **Trampa:** Escalabilidad / Disponibilidad / Elasticidad **no** son pilares.

### Planes de AWS Support (de menor a mayor)

| Plan | Qué incluye |
|---|---|
| **Basic** | Gratis, solo docs y foros. |
| **Developer** | Email, horario laboral (no 24x7, no teléfono). |
| **Business** | El **más barato** con teléfono/chat 24x7 + Trusted Advisor completo. |
| **Enterprise On-Ramp / Enterprise** | Agregan TAM, mayor SLA, más caros. **Enterprise** suma soporte proactivo: Infrastructure Event Management (IEM), revisiones **Well-Architected** y de operaciones. |

> Pista: "TAM / IEM / revisiones Well-Architected y de operaciones" → **Enterprise**.

**Tiempos de respuesta (referencia del examen):**

| Plan | Respuesta ante un problema grave |
|---|---|
| **Developer** | Horario laboral, en horas (sin teléfono). |
| **Business** | Producción caída: menos de **1 hora**. |
| **Enterprise On-Ramp** | Sistema crítico caído: menos de **30 minutos**. |
| **Enterprise** | Sistema crítico caído: menos de **15 minutos**. |

> Pista: "respuesta en menos de **15 minutos** para un sistema crítico" → **Enterprise**. Si pide TAM, IEM, revisiones o <15 min, casi siempre es Enterprise (te salió así en cuatro exámenes).

**Más detalles que preguntan los bancos:**
- **Business** agrega, respecto de Developer y Basic: **soporte de arquitectura / orientación arquitectónica** (guía contextual para tu caso; Developer solo tiene guía general), teléfono/chat 24x7 y Trusted Advisor completo.
- **TAM no está en Business.** Es de **Enterprise** (en On-Ramp, un grupo de TAMs compartido). El **Concierge** también es de los planes Enterprise.
- Pista: "beneficio relacionado con el **diseño de soluciones / arquitectura**" en Business → **Soporte de arquitectura**.
- **AWS Health Dashboard – Your Account** está disponible en **todos los planes**, incluido Basic.

> ⚠️ **Aviso:** a fines de 2025 AWS reestructuró los planes de soporte (por ejemplo, [Business Support+ reemplaza a Business](https://on-promise.cloud/en/compendium/what-aws-support-really-costs), y la [documentación oficial de AWS](https://docs.aws.amazon.com/awssupport/latest/user/aws-support-plans.html) confirma que Developer, Business y Enterprise On-Ramp terminan el 1/1/2027). Los bancos de preguntas usan los nombres clásicos. Si el 17 ves nombres nuevos, según esa documentación: **Business Support+** (24x7, respuesta en menos de 30 minutos en sistema crítico caído, con asistencia de IA), **Enterprise** (TAM asignado, respuesta de 15 minutos) y **Unified Operations** (guía de arquitectura de aplicaciones, IEM, y TAM con especialista). Para el examen, la escalera clásica de arriba es la que usan los bancos; no sé cuál versión tendrá el examen.

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

**Instancias reservadas (RI) se compran para:** **EC2** y **RDS** (también ElastiCache, Redshift, OpenSearch). No para Lambda, S3, IAM, etc.

**Formas de pago de una RI:** **todo por adelantado** (mayor descuento), **parcial por adelantado** y **sin pago anticipado** (No Upfront, se paga mensual). Algunos bancos de preguntas solo listan las dos primeras; si la opción "mensual sin anticipo" aparece, es una modalidad real de AWS.

**Tipos de instancia EC2 (familias): la palabra que decide**

| Familia | Palabra clave | Para qué |
|---|---|---|
| **General Purpose** (M, T) | **equilibrada** | Servidores web, aplicaciones, desarrollo y pruebas. |
| **Compute Optimized** (C) | **CPU** | Procesamiento por lotes, transcodificar video, cálculos científicos, juegos. |
| **Memory Optimized** (R, X) | **RAM** | Bases de datos en memoria, análisis en tiempo real, cachés grandes. |
| **Storage Optimized** (I, D) | **disco local rápido (IOPS)** | Data warehousing, bases con mucho I/O. |
| **Accelerated Computing** (P, G) | **GPU** | Machine learning, gráficos, video. |

> Para recordarlas: **Equilibrada, CPU, RAM, disco, GPU**. Las letras no hace falta memorizarlas; lo que decide es el recurso que la pregunta dice que falta.

**Modelos de compra de EC2 (cuál elegir):**

| Modelo | Compromiso | Cuándo conviene |
|---|---|---|
| **On-Demand** (bajo demanda) | Ninguno, pagás por uso | Cargas impredecibles o cortas; probar. |
| **Reservadas (RI)** | 1 o 3 años, para un **tipo de instancia** concreto | Uso estable y predecible de una configuración conocida. |
| **Savings Plans** | 1 o 3 años, un **gasto por hora** | Uso estable pero con **flexibilidad** para cambiar región, familia o SO. |
| **Spot** | Ninguno; AWS puede **interrumpirla** con aviso | Cargas que toleran interrupciones (batch, trabajos ad hoc). Hasta ~90% menos. |
| **Dedicated Host** | Servidor físico para vos | **Licencias atadas a socket o núcleo** (BYOL), cumplimiento. |
| **Dedicated Instance** | Hardware aislado para tu cuenta | Aislamiento; no da control de sockets ni de licencias. |

> Pista para "la estrategia **MÁS rentable**": uso **estable y predecible** (por ejemplo, el próximo año) → **Reservadas o Savings Plans**. Trabajos **ad hoc que se pueden interrumpir** → **Spot**. **On-Demand** casi nunca es la más rentable: da flexibilidad, no ahorro. (Te salió en udemy4 #41: la respuesta era Reservadas para lo predecible y Spot para lo interrumpible.)

**Savings Plans vs Reservadas:**
- **Savings Plans (Planes de ahorro):** descuento a cambio de un **compromiso de gasto por hora**. Los *Compute Savings Plans* se aplican **solos** al uso de EC2 sin importar la **familia, tamaño, SO ni región** (también Fargate y Lambda). Pista: "flexibilidad para cambiar de región o familia + descuento automático" → **Savings Plans**.
- **Instancias reservadas:** descuento atado a **tipo de instancia y región** (en las estándar). Menos flexibles.

**Estados de una EC2 y qué se cobra:**
- **Running:** se cobra todo (cómputo + almacenamiento).
- **Stopped:** **solo el almacenamiento EBS**; no se cobra CPU, RAM ni red.
- **Terminated:** no se cobra la instancia.

**Al lanzar una EC2: qué es obligatorio y qué es opcional**
- **Obligatorio:** una **AMI**, un **tipo de instancia**, la **VPC y subred**, un **volumen raíz** (viene de la AMI) y **al menos un Security Group**. Si no elegís uno, AWS asigna el **SG por defecto** de la VPC.
- **Opcional:** **IP elástica** (IP pública **fija** que es tuya y podés mover de una instancia a otra), IP pública (depende de la subred), **key pair** (solo hace falta para entrar por SSH), volúmenes extra, rol de IAM.

**Qué genera costo en S3:** almacenamiento (por GB al mes), transferencia **saliente** hacia internet, solicitudes y transiciones de ciclo de vida. **Subir** datos desde internet es gratis.

**Qué es gratis (no se cobra):**
- Transferencia de datos de **entrada** desde internet.
- **S3 ↔ EC2 en la misma región**.
- Servicios en sí: IAM, Auto Scaling, CloudFormation, VPC, Organizations (solo pagás los recursos que crean).

### Herramientas de "qué servicios usar / gobernar"

| Herramienta | Para qué |
|---|---|
| **AWS Artifact** | Descargar reportes de compliance (PCI, SOC, ISO). |
| **Trusted Advisor** | Recomendaciones en 5 categorías: costos, rendimiento, seguridad, tolerancia a fallos y **límites de servicio**. Si Auto Scaling no lanza instancias nuevas, mirar **límites de servicio** (cuota de EC2) y **rendimiento**. |
| **Service Catalog** | Catálogo de soluciones TI preaprobadas. |
| **Control Tower** | Crear un entorno **multi-cuenta** seguro (landing zone) con guardrails y buenas prácticas desde el inicio. |
| **Compute Optimizer** | Recomienda tipo de EC2, Auto Scaling, EBS, Lambda (**no** S3/EFS). |

---

## 5. Responsabilidad compartida

- **AWS = seguridad "del" cloud** → hardware, instalaciones, red global, AZs, hipervisor, servicios gestionados (S3, DynamoDB infra).
- **Cliente = seguridad "en" el cloud** → sus datos, cifrado, IAM, config, parches del SO invitado en EC2, grupos de seguridad.

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

**IAM: quién tiene qué**

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
  - un **servicio de AWS** (EC2, Lambda) necesita acceder a otro recurso en tu nombre,
  - una **aplicación** necesita credenciales temporales, o
  - un **socio u otra cuenta** necesita acceso temporal.
- **Usuario** = persona o app con credenciales **permanentes** (contraseña y access keys).

> Pista: "¿qué define los permisos?" → **Política**. "servicio/app que accede a otro servicio" o "acceso temporal" → **Rol**. "credenciales permanentes / access keys para la CLI" → **Usuario**.

**Permisos sobre S3 (dos tipos de política):**
- **Política de bucket**: basada en el **recurso** (se adjunta al bucket). Sirve para dar acceso a otras cuentas.
- **Política de usuario (IAM)**: basada en la **identidad** (se adjunta al usuario o rol).

**Certificados SSL/TLS (HTTPS):**
- **AWS Certificate Manager (ACM)**: emite y gestiona certificados, y permite **importar** los de terceros.
- **IAM** también permite subir certificados de servidor propios.
- Secrets Manager (secretos genéricos) y Cognito (autenticación de usuarios) **no** son para certificados.

**Identidad de usuarios y directorios:**

| Servicio | Para qué |
|---|---|
| **Cognito User Pool** | **"Quién sos"**: registro e inicio de sesión de los usuarios de tu app (también con Google, Facebook o Apple). Devuelve tokens; **no da acceso a recursos de AWS**. |
| **Cognito Identity Pool** | **"Qué podés tocar en AWS"**: cambia una identidad (del User Pool, de Google, etc.) por **credenciales temporales de AWS**, y también atiende a **usuarios invitados** sin login. |
| **IAM Identity Center** | Acceso único (SSO) de tu **personal** a varias cuentas de AWS y aplicaciones. |
| **Directory Service** | Directorios compatibles con **Microsoft Active Directory**, o relaciones de confianza con tu AD local. |

> Pista: "usuarios de una app móvil, Google/Facebook, invitados, credenciales temporales de AWS" → **Cognito Identity Pool**. "Active Directory" → **Directory Service**.
> Suelen trabajar juntos: el usuario se loguea (User Pool o Google) y el **Identity Pool** le da las credenciales temporales para que la app use S3, DynamoDB, etc. Pistas que deciden: "**acceso temporal a recursos de AWS**" o "**invitados**" → Identity Pool.

**Identidad en IAM según el plazo:** credenciales **permanentes / de largo plazo** para una aplicación o integración → **Usuario de IAM** (access keys). Credenciales **temporales** → **Rol**.

---

## 6. Networking

- **VPN Site-to-Site**: componentes = **Virtual Private Gateway** (lado AWS) + **Customer Gateway** (tu lado). Va por internet público. (No: Internet/NAT/Storage Gateway.)
- **Direct Connect**: enlace privado dedicado on-premises → AWS (no usa internet, tarda ~1 mes).
- **Transit Gateway**: hub central para conectar **muchas** VPC (+ on-premises). Mejor que VPC Peering a escala.
- **Varias VPC + datacenter local, la solución más eficiente** → **Transit Gateway + Direct Connect** (te salió así en el Falladas).
- **VPC Peering**: conecta 2 VPC punto a punto (no transitivo, no escala bien).
- **VPC Endpoint**: conecta tu VPC a servicios AWS de forma privada.
  - **Interface Endpoint** (PrivateLink) = la mayoría de servicios (SQS, SNS...).
  - **Gateway Endpoint** = **solo S3 y DynamoDB**.
- **Infra Global** = Regiones, AZs, Edge Locations. (VPC/subred/VPN no son infra global.)
- **Internet Gateway (IGW):** permite que las instancias de una subred **pública** se conecten a internet (y reciban conexiones). Es lo que hace falta para "salir a internet" desde una subred pública.
- **NAT Gateway:** permite que las instancias de una subred **privada** **salgan** a internet sin que nadie pueda iniciar una conexión hacia ellas. Se coloca en una subred pública. (La instancia NAT es la versión que administrás vos; el NAT Gateway lo administra AWS.)
- **API Gateway** no es de redes: es para crear y publicar APIs.

---

## 7. Cloud Adoption Framework (CAF) — repasar

El **AWS CAF** organiza la adopción de la nube en **6 perspectivas**, agrupadas en negocio (las 3 primeras) y técnicas (las 3 últimas).

> **Truco:** _"**N**egocio, **P**ersonas y **G**obernanza mandan; **P**lataforma, **S**eguridad y **O**peraciones ejecutan."_ (N-P-G | P-S-O)

> **No mezclar con Well-Architected:**
> - **Well-Architected** (6 **pilares**) = cómo **diseñar bien una carga de trabajo / arquitectura**.
> - **CAF** (6 **perspectivas**) = cómo **adoptar la nube como organización** (personas, gobierno, negocio, migración).
> - Pista: "arquitectura / carga de trabajo / buenas prácticas de diseño" → Well-Architected. "adopción / transformación / ROI / personas / organización" → CAF.
> - "Seguridad" aparece en los dos (pilar y perspectiva), pero son cosas distintas.

| Perspectiva | Grupo | De qué se encarga | Roles típicos |
|---|---|---|---|
| **Business** (Negocio) | Negocio | ROI, caso de negocio, resultados | CEO, CFO, CDO |
| **People** (Personas) | Negocio | Cultura, habilidades, gestión del cambio | RR.HH., CIO |
| **Governance** (Gobernanza) | Negocio | ROI y gestión de beneficios, cartera/portafolio, **gestión de riesgos**, gestión financiera, **gobernanza y curación de datos** | CIO, PMO |
| **Platform** (Plataforma) | Técnica | Arquitectura, infraestructura, aprovisionar servicios | **CTO, arquitectos, ingenieros** |
| **Security** (Seguridad) | Técnica | Identidad, cumplimiento, protección de datos | CISO, equipos de seguridad |
| **Operations** (Operaciones) | Técnica | Operar, monitorear y recuperar cargas | COO, soporte TI |

> **Trampa:** si la pregunta menciona CTO/ingenieros/arquitectos → perspectiva **Plataforma** (técnica). Si menciona ROI/portafolio/riesgos → **Gobernanza**.

**Buenas prácticas de transformación organizacional (CAF):**
- Organizar equipos en torno a **productos y flujos de valor**.
- Usar **métodos ágiles** para iterar y evolucionar rápido.

### Las 4 fases de la transformación (CAF)

Son **iterativas** (se pueden repetir), y van en este orden:

| Fase | En español | Qué se hace | Palabra clave en la pregunta |
|---|---|---|---|
| **Envision** | Visualizar | Definir cómo la nube acelera los resultados de negocio; identificar oportunidades y partes interesadas. | "visión", "oportunidades", "casos de negocio" |
| **Align** | Alinear | Identificar brechas de capacidades entre perspectivas, planes de acción, **planificar y capacitar** equipos. | "brechas", "plan", "capacitación", "alinear a los equipos" |
| **Launch** | Lanzar | Poner en producción **proyectos piloto** y demostrar valor concreto. | "piloto", "primeros proyectos", "probar el modelo operativo" |
| **Scale** | Escalar | Ampliar los pilotos a la escala deseada y obtener todos los beneficios. | "expandir", "llevar a toda la organización", "migrar sistemas críticos" |

> Regla mental: **Visualizar → Alinear → Lanzar → Escalar** (V-A-L-E).
> "Planificar" **no** es una fase del CAF (es un distractor).
> Planificación y capacitación ya hechas + primeros pilotos → **Launch (Lanzar)**.

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

### Zonal vs Regional: cómo darte cuenta

**Regla práctica:** al crearlo, ¿te pide elegir una **AZ o una subred**? → es **zonal**. Si no te lo pide y AWS lo replica solo entre AZ → es **regional**.

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

**ECS vs Fargate:** **ECS** es el orquestador de contenedores (decide cuáles corren y dónde). **Fargate** es el modo en que corren **sin que administres servidores**. Pista: "contenedores **sin administrar infraestructura de servidores**" → **Fargate**.

**Puertos que suelen aparecer:** SSH **22**, HTTP **80**, HTTPS **443**, RDP **3389**, MySQL **3306**.

---

## Estrategia final

- Repasá por **contrastes** (A vs B), no servicio suelto.
- Rehacé los simulacros en **modo Jedi** hasta sacar **85%+** estable.
- Leé la **última línea** de la pregunta primero (MOST/LEAST/NOT).
- En "Selecciona dos/tres": marcá **exactamente** esa cantidad.
- Si **sabés que las opciones que conocés no cumplen** lo que pide la pregunta, elegí la que **no conocés**. Descartar por eliminación funciona aunque no sepas qué es.
