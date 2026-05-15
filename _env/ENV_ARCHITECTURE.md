# 📑 Architecture de Configuration - Vue Globale

## 📊 Layers de Configuration

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. VARIABLES D'ENVIRONNEMENT (.env)                             │
│    ↓ Valeurs brutes lues via process.env                       │
├─────────────────────────────────────────────────────────────────┤
│ 2. FILES DE CONFIG (src/config/*.config.ts)                     │
│    ↓ Regroupement logique + schémas Joi + transformations      │
├─────────────────────────────────────────────────────────────────┤
│ 3. AGGREGATOR (src/config/configuration.ts)                     │
│    ↓ Export d'un tableau de toutes les configs                 │
├─────────────────────────────────────────────────────────────────┤
│ 4. VALIDATION (app.module.ts ConfigModule.forRoot)              │
│    ↓ Validation Joi + rejet si erreur                           │
├─────────────────────────────────────────────────────────────────┤
│ 5. SERVICE (ConfigService)                                      │
│    ↓ Injection via @Inject() dans les modules                  │
├─────────────────────────────────────────────────────────────────┤
│ 6. RUNTIME (Services, Controllers)                              │
│    ✓ Utilisation des configurations typées                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Modules de Configuration (15 Espaces de Noms)

```
config/
├── 1. app.config.ts                    → AppConfig
│   └─ NODE_ENV, PORT, BASE_URL, LOG_LEVEL, CORS, API_PREFIX
│
├── 2. database.config.ts               → DatabaseConfig
│   └─ MONGODB_URI, POOL, DEBUG, SSL, REPLICA_SET
│
├── 3. redis.config.ts                  → RedisConfig
│   └─ HOST, PORT, PASSWORD, CLUSTER_*, SENTINEL_*
│
├── 4. jwt.config.ts                    → JwtConfig
│   └─ SECRET, REFRESH_SECRET, EXPIRES_IN, ISSUER, AUDIENCE
│
├── 5. storage.config.ts                → StorageConfig
│   └─ DRIVER, LOCAL_PATH, S3_* (bucket, region, keys)
│
├── 6. mail.config.ts                   → MailConfig
│   └─ HOST, PORT, USER, PASSWORD, FROM, SECURE
│
├── 7. queue.config.ts                  → QueueConfig
│   └─ REDIS_*, PREFIX, JOB_OPTIONS (attempts, backoff)
│
├── 8. security.config.ts               → SecurityConfig
│   └─ BRUTE_FORCE_*, IP_REPUTATION_*, AUDIT, REFRESH_TOKEN_*
│
├── 9. telemetry.config.ts              → TelemetryConfig
│   └─ ENABLED, SERVICE_NAME, EXPORTER, ENDPOINTS (OTLP/JAEGER/ZIPKIN)
│
├── 10. metrics.config.ts               → MetricsConfig
│   └─ ENABLED, ENDPOINT, PREFIX
│
├── 11. tenant.config.ts                → TenantConfig
│   └─ ENABLED, IDENTIFIER (header/subdomain/jwt), DB_ISOLATION
│
├── 12. idempotency.config.ts           → IdempotencyConfig
│   └─ ENABLED, TTL, KEY_HEADER, PREFIX
│
├── 13. feature-flags.config.ts         → FeatureFlagsConfig
│   └─ ENABLED, PROVIDER (env/redis/db), CACHE_TTL
│
├── 14. resilience.config.ts            → ResilienceConfig
│   └─ CIRCUIT_BREAKER_*, RETRY_*, TIMEOUT_*
│
└── 15. activity-logs.config.ts         → ActivityLogsConfig
    └─ RETENTION_DAYS
```

---

## 🔄 Flux de Validation Joi

```
.env (process.env)
    ↓
┌───────────────────────────────────────┐
│ Joi Schemas (combinés dans app.module) │
├───────────────────────────────────────┤
│ • Obligatoire vs Optionnel            │
│ • Types (string, number, boolean)     │
│ • Valeurs énumérées                   │
│ • Conditions (when)                   │
│ • Valeurs par défaut                  │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│ ✅ Valide → Passer à l'étape suivante │
│ ❌ Invalide → Process.exit(1)         │
└───────────────────────────────────────┘
```

---

## 📋 Variables par Catégorie (Résumé)

### 🔵 OBLIGATOIRES (Blocage au démarrage si absent)

```
8 variables
├─ BASE_URL ..................... URL publique
├─ MONGODB_URI ................... Connexion DB
├─ JWT_SECRET .................... Signature tokens
├─ JWT_REFRESH_SECRET ............ Signature refresh
├─ MAIL_HOST ..................... Serveur SMTP
├─ MAIL_USER ..................... Username SMTP
├─ MAIL_PASSWORD ................. Password SMTP
└─ MAIL_FROM ..................... Adresse expédition
```

### 🟢 OPTIONNELS (Valeurs par défaut appliquées)

```
~52 variables
├─ Application (6)
├─ MongoDB (7)
├─ Redis (5)
├─ Redis Cluster (2)
├─ Redis Sentinel (3)
├─ JWT (4)
├─ Storage Local (1)
├─ Storage S3 (5)
├─ Queue (5)
├─ Security (8)
├─ Telemetry (4)
├─ Metrics (3)
├─ Multi-Tenant (3)
├─ Idempotency (4)
├─ Feature Flags (3)
├─ Resilience (9)
└─ Activity Logs (1)
```

---

## 🎯 Cas d'Usage Courants

### 1️⃣ Développement Local Minimal

**Variables essentielles uniquement:**

```env
NODE_ENV=development
BASE_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/starter
JWT_SECRET=dev-secret
JWT_REFRESH_SECRET=dev-refresh-secret
MAIL_HOST=mailtrap.io
MAIL_USER=test
MAIL_PASSWORD=test
MAIL_FROM=test@test.com
```

+ Valeurs par défaut pour tout le reste

---

### 2️⃣ Production AWS

**Variables complètes pour scalabilité:**

```env
# App
NODE_ENV=production
BASE_URL=https://api.example.com
CORS_ALLOWED_ORIGINS=https://app.example.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
MONGODB_SSL=true
MONGODB_READ_PREFERENCE=secondaryPreferred

# Cache
REDIS_HOST=redis.production.svc
REDIS_PASSWORD=secret
REDIS_TLS=true

# Storage
STORAGE_DRIVER=s3
S3_BUCKET=bucket-name
S3_REGION=eu-west-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...

# Mail
MAIL_HOST=email-smtp.eu-west-1.amazonaws.com
MAIL_PORT=465
MAIL_USER=AKIAIO...
MAIL_PASSWORD=...
MAIL_SECURE=true

# Monitoring
METRICS_ENABLED=true
TELEMETRY_ENABLED=true
TELEMETRY_EXPORTER=otlp
TELEMETRY_OTLP_ENDPOINT=http://collector:4318

# Sécurité
BRUTE_FORCE_ENABLED=true
AUDIT_LOG_ENABLED=true
IP_REPUTATION_ENABLED=true
IP_REPUTATION_API_KEY=...
```

---

### 3️⃣ Production Kubernetes/Docker Compose

**Avec services en cluster:**

```env
# Services internes
MONGODB_URI=mongodb://mongodb:27017/mydb
REDIS_HOST=redis
REDIS_PORT=6379
QUEUE_REDIS_HOST=redis-queue
MAIL_HOST=mailserver

# Télémétrie
TELEMETRY_ENABLED=true
TELEMETRY_EXPORTER=otlp
TELEMETRY_OTLP_ENDPOINT=http://otel-collector:4318/v1/traces

# Métriques
METRICS_ENABLED=true
METRICS_ENDPOINT=/metrics
```

---

## 🚨 Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `ValidationError: "BASE_URL" is required` | `BASE_URL` manquante | Ajouter `BASE_URL=...` au `.env` |
| `Cannot connect to MongoDB` | `MONGODB_URI` invalide | Vérifier URI et credentials |
| `JWT verification failed` | `JWT_SECRET` different en prod | Synchroniser les secrets |
| `Cannot find module...` | Config fusionnée incorrectement | Vérifier imports dans `configuration.ts` |
| `S3 access denied` | Mauvaises clés S3 | Vérifier `S3_ACCESS_KEY` et `S3_SECRET_KEY` |
| `SMTP authentication failed` | Mauvais credentials | Vérifier `MAIL_USER` et `MAIL_PASSWORD` |

---

## 🔍 Debugging

### 1. Afficher les configurations compilées

```typescript
// Dans un service
constructor(private configService: ConfigService) {
  console.log('App config:', this.configService.get('app'));
  console.log('DB config:', this.configService.get('database'));
}
```

### 2. Valider manuellement une variable

```bash
# Terminal
NODE_ENV=production npm run start 2>&1 | grep "ValidationError"
```

### 3. Tester une configuration (Node REPL)

```bash
node -e "
require('dotenv').config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
"
```

---

## 📈 Statistiques de Configuration

| Métrique | Valeur |
|----------|--------|
| **Total de variables** | 60 |
| **Variables obligatoires** | 8 |
| **Variables optionnelles** | 52 |
| **Taux de couverture** | 100% des modules |
| **Fichiers de config** | 15 |
| **Espaces de noms** | 15 |
| **Validations Joi** | 15 schémas |
| **Interfaces TS** | 15 interfaces |

---

## 📚 Documentation Associée

1. **ENV_CONFIGURATION_GUIDE.md** - Guide détaillé complet (recommandé pour mise en place)
2. **ENV_QUICK_REFERENCE.md** - Référence rapide (pour consultation rapide)
3. **.env.example** - Modèle de fichier avec commentaires
4. **Ce fichier** - Vue d'ensemble architecturale

---

## ✨ Bonnes Pratiques

- ✅ Toujours commencer par `.env.example`
- ✅ Ne jamais commiter `.env` en git
- ✅ Utiliser un coffre-fort en production (Vault, AWS Secrets Manager)
- ✅ Rotationner les secrets régulièrement
- ✅ Valider les configs au démarrage (Joi)
- ✅ Documenter les variables non-standard
- ✅ Tester les configurations en CI/CD
- ✅ Utiliser des valeurs par défaut sécurisées
- ✅ Grouper les variables par domaine fonctionnel
- ✅ Activer la télémétrie en production pour le debugging

---

**Créé** : 9 mars 2026  
**Version** : 1.0  
**Audience** : Équipes DevOps, Développeurs Full-Stack, SRE
