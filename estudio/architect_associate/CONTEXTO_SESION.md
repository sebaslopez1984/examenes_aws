# Contexto de Sesión — Preparación AWS Solutions Architect Associate (SAA-C03)

> **Instrucción para el agente:** Leé este archivo junto con `evaluaciones.txt`, `plan_estudio.txt` y `chuleta_repaso.md` dentro de `estudio/architect_associate/` para llevar el seguimiento de Sebastián. Hablale siempre en español argentino (voseo), de forma directa, clara y concisa. Siempre que actualices `chuleta_repaso.md`, regenerá también `chuleta_repaso.docx`.

---

## 1. Punto de Partida de Sebastián
- **Certificación previa aprobada:** **AWS Certified Cloud Practitioner (`CLF-C02`) — APROBADA el 19/11/2026.** 🏆
- **Beneficio disponible:** Cupón oficial del **50% de descuento** en la cuenta de AWS Certification (deja el examen `SAA-C03` en **USD 75** en vez de USD 150).
- **Base ya consolidada de CLF-C02:** `VPC` (IGW, NAT Gateway, Endpoints, Security Groups vs NACLs), `S3` (clases de almacenamiento, ciclo de vida, Object Lock/Versioning, cifrado), `EC2` (modelos de compra RI / Savings Plans / Spot / Dedicated Host), `RDS` (Multi-AZ vs Read Replica vs escalado vertical) y `DynamoDB`, `CloudFront` vs `Global Accelerator`, las 4 estrategias de `Disaster Recovery (DR)`, `IAM` / `Organizations` / `SCPs` y los 6 pilares de `Well-Architected`.

---

## 2. Datos Oficiales del Examen (`SAA-C03`)
- **Cantidad de preguntas:** 65 preguntas *multiple choice* / *multiple response* (50 con puntaje + 15 de prueba sin puntaje).
- **Duración:** 130 minutos (~2 minutos por pregunta).
- **Puntaje mínimo de aprobación:** **720 / 1000 (~72%)**.
- **Pesos por Dominio Oficial:**
  1. **Dominio 1 — Diseño de arquitecturas seguras:** **30%**
  2. **Dominio 2 — Diseño de arquitecturas resilientes:** **26%**
  3. **Dominio 3 — Diseño de arquitecturas de alto rendimiento:** **24%**
  4. **Dominio 4 — Diseño de arquitecturas optimizadas en costos:** **20%**

---

## 3. Próximos Pasos al Arrancar
1. Cargar los primeros bancos `.json` de práctica de `SAA-C03` en `examenes/architect_associate/` y listarlos en `examenes/architect_associate/exams.json`.
2. Arrancar por bloques temáticos en **Modo Padawan** (para aprender cómo AWS combina 2–3 servicios en escenarios de arquitectura: desacoplamiento con `SQS/SNS/EventBridge/Kinesis`, arquitecturas de 3 capas con `ALB + ASG + RDS/Aurora`, permisos avanzados `IAM + KMS + S3 Bucket Policies + OAC`, redes híbridas `Transit Gateway + Direct Connect + VPN`).
3. Pasar a simulacros completos de 65 preguntas en **Modo Jedi** para medir el 72%+ real.
