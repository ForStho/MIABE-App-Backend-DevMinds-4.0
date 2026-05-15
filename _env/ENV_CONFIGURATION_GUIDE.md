# Guide Complet de Configuration des Variables d'Environnement (.env)

## 📋 Résumé Exécutif

Ce projet **NestJS** utilise une architecture de configuration modulaire avec **15 domaines fonctionnels**. Chaque domaine dispose de son propre fichier de configuration qui définit les variables d'environnement requises et optionnelles.

- **Total de variables d'environnement** : ~60
- **Variables obligatoires** : ~15
- **Variables optionnelles** : ~45
- **Fichiers de configuration** : `src/config/` (15 fichiers)

---

## 🏗️ Architecture de Configuration

La configuration suit ce flux :

```
.env (variables brutes)
    ↓
src/config/{module}.config.ts (lecture + transformation)
    ↓
src/config/configuration.ts (agrégation)
    ↓
app.module.ts (validation via ConfigModule.forRoot)
    ↓
Services (injection via @Inject(getConfigToken()))
```

Chaque fichier de configuration :
1. Définit un **schéma Joi** pour valider les variables
2. Exporte une **interface TypeScript** pour le typage
3. Enregistre la config avec `registerAs()` sous un espace de noms

---

## 1. Configuration Générale (app.config.ts)

### Variables Obligatoires

| Variable | Type | Description | Valeur par Défaut | Exemple |
|----------|------|-------------|-------------------|---------|
| `NODE_ENV` | enum | Environnement d'exécution | `development` | `development` \| `production` \| `test` |
| `BASE_URL` | string (URI) | URL publique de base (liens absolus, webhooks) | ❌ **REQUISE** | `https://api.example.com` |

### Variables Optionnelles

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `PORT` | number | Port du serveur HTTP | `3000` |
| `CORS_ENABLED` | boolean | Activer le mécanisme CORS | `true` |
| `CORS_ALLOWED_ORIGINS` | string (CSV) | Origines CORS autorisées (séparées par virgules) | `*` |
| `LOG_LEVEL` | enum | Niveau de logs | `info` (error, warn, info, debug, verbose) |
| `API_PREFIX` | string | Préfixe des routes API | `api` |

### Exemple

```env
# Application
NODE_ENV=production
BASE_URL=https://api.example.com
PORT=3000
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
LOG_LEVEL=info
API_PREFIX=api
```

---

## 2. Base de Données MongoDB (database.config.ts)

### Variables Obligatoires

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `MONGODB_URI` | string (URI) | URI de connexion MongoDB | ❌ **REQUISE** |

### Variables Optionnelles

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `MONGODB_DEBUG` | boolean | Activer le mode debug Mongoose | `false` |
| `MONGODB_POOL_SIZE` | number | Taille du pool de connexions | `10` |
| `MONGODB_REPLICA_SET` | string | Nom du replica set (si cluster répliqué) | *(absent)* |
| `MONGODB_SSL` | boolean | Activer SSL/TLS | `false` |
| `MONGODB_AUTH_SOURCE` | string | Base de données d'authentification | *(absent)* |
| `MONGODB_RETRY_WRITES` | boolean | Réessai automatique des écritures | `true` |
| `MONGODB_READ_PREFERENCE` | enum | Préférence de lecture | `primary` |

### Exemples

**Développement (local)**
```env
MONGODB_URI=mongodb://localhost:27017/starter
MONGODB_DEBUG=true
MONGODB_POOL_SIZE=5
```

**Production (Atlas)**
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/starter?retryWrites=true&w=majority
MONGODB_SSL=true
MONGODB_POOL_SIZE=10
MONGODB_READ_PREFERENCE=secondaryPreferred
```

**Production (Replica Set local)**
```env
MONGODB_URI=mongodb://mongo1:27017,mongo2:27017,mongo3:27017/starter
MONGODB_REPLICA_SET=rs0
MONGODB_RETRY_WRITES=true
```

---

## 3. Redis (redis.config.ts)

### Mode : Standalone (Par défaut)

| Variable | Type | Description | Valeur par Défaut | Requis |
|----------|------|-------------|-------------------|--------|
| `REDIS_HOST` | string | Hôte Redis | `localhost` | ✅ |
| `REDIS_PORT` | number | Port Redis | `6379` | ❌ |
| `REDIS_PASSWORD` | string | Mot de passe Redis | *(absent)* | ❌ |
| `REDIS_DB` | number | Index de la base Redis | `0` | ❌ |
| `REDIS_TLS` | boolean | Activer TLS | `false` | ❌ |

### Mode : Cluster

| Variable | Type | Description | Requis si Mode |
|----------|------|-------------|----------------|
| `REDIS_CLUSTER_ENABLED` | boolean | Activer le mode cluster | ❌ |
| `REDIS_CLUSTER_NODES` | string (CSV) | Nœuds du cluster (host1:6379,host2:6379) | ✅ si REDIS_CLUSTER_ENABLED=true |

### Mode : Sentinel (Haute Disponibilité)

| Variable | Type | Description | Requis si Mode |
|----------|------|-------------|----------------|
| `REDIS_SENTINEL_ENABLED` | boolean | Activer Sentinel | ❌ |
| `REDIS_SENTINEL_NODES` | string (CSV) | Nœuds Sentinel (sentinel1:26379,sentinel2:26379) | ✅ si REDIS_SENTINEL_ENABLED=true |
| `REDIS_SENTINEL_MASTER_NAME` | string | Nom du master (ex: mymaster) | ✅ si REDIS_SENTINEL_ENABLED=true |

### Exemples

**Standalone local**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

**Standalone production (avec password)**
```env
REDIS_HOST=redis.example.com
REDIS_PORT=6380
REDIS_PASSWORD=your_secure_password
REDIS_TLS=true
```

**Cluster**
```env
REDIS_CLUSTER_ENABLED=true
REDIS_CLUSTER_NODES=redis1:6379,redis2:6379,redis3:6379
```

**Sentinel**
```env
REDIS_SENTINEL_ENABLED=true
REDIS_SENTINEL_NODES=sentinel1:26379,sentinel2:26379,sentinel3:26379
REDIS_SENTINEL_MASTER_NAME=mymaster
```

---

## 4. JWT - Authentification (jwt.config.ts)

### Variables Obligatoires

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `JWT_SECRET` | string | Secret pour signer les access tokens | ❌ **REQUISE** |
| `JWT_REFRESH_SECRET` | string | Secret pour signer les refresh tokens (DISTINCT) | ❌ **REQUISE** |

### Variables Optionnelles

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `JWT_EXPIRES_IN` | string | Durée de validité access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | string | Durée de validité refresh token | `7d` |
| `JWT_ISSUER` | string | Émetteur (iss claim) | *(absent)* |
| `JWT_AUDIENCE` | string | Audience (aud claim) | *(absent)* |

### Formats de Durée Acceptés

- `15m` : 15 minutes
- `7d` : 7 jours
- `2h` : 2 heures
- `3600` : 3600 secondes

### ⚠️ Points Importants

1. **Les deux secrets DOIVENT être différents** pour la sécurité
2. Utilisez des valeurs cryptographiquement fortes (32+ caractères)
3. En production, stockez-les dans un service comme Vault ou AWS Secrets Manager

### Exemple

```env
# Générer des secrets sécurisés :
# openssl rand -base64 32

JWT_SECRET=k9mL2pQ4vX7nR3sT8wF1jH5gB6cD0eA9bN7mK2lP5qY8rZ
JWT_REFRESH_SECRET=x2nP9sK4vL7mR3wQ8bF5jH9gC2dE1aT6yN3oM7pK4qZ0sS
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=my-app
JWT_AUDIENCE=my-app-users
```

---

## 5. Stockage de Fichiers (storage.config.ts)

### Mode : Local (Défaut)

| Variable | Type | Description | Valeur par Défaut | Requis |
|----------|------|-------------|-------------------|--------|
| `STORAGE_DRIVER` | enum | Driver de stockage | `local` | ❌ |
| `LOCAL_STORAGE_PATH` | string | Chemin du répertoire d'upload | *(absent)* | ✅ si STORAGE_DRIVER=local |

### Mode : S3 (AWS / MinIO / DigitalOcean Spaces)

| Variable | Type | Description | Requis si Mode |
|----------|------|-------------|----------------|
| `S3_BUCKET` | string | Nom du bucket S3 | ✅ si STORAGE_DRIVER=s3 |
| `S3_REGION` | string | Région AWS (ex: us-east-1) | ✅ si STORAGE_DRIVER=s3 |
| `S3_ACCESS_KEY` | string | Clé d'accès AWS | ✅ si STORAGE_DRIVER=s3 |
| `S3_SECRET_KEY` | string | Clé secrète AWS | ✅ si STORAGE_DRIVER=s3 |
| `S3_ENDPOINT` | string | Endpoint personnalisé (MinIO, etc.) | ❌ |
| `S3_FORCE_PATH_STYLE` | boolean | Forcer le style de chemin | `false` |

### Exemples

**Local (développement)**
```env
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=./uploads
```

**AWS S3 (production)**
```env
STORAGE_DRIVER=s3
S3_BUCKET=my-app-bucket
S3_REGION=eu-west-1
S3_ACCESS_KEY=AKIA...
S3_SECRET_KEY=...
S3_FORCE_PATH_STYLE=false
```

**MinIO (local)**
```env
STORAGE_DRIVER=s3
S3_BUCKET=uploads
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_ENDPOINT=http://minio:9000
S3_FORCE_PATH_STYLE=true
```

---

## 6. Email (SMTP) (mail.config.ts)

### Variables Obligatoires

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `MAIL_HOST` | string | Hôte du serveur SMTP | ❌ **REQUISE** |
| `MAIL_USER` | string | Identifiant SMTP | ❌ **REQUISE** |
| `MAIL_PASSWORD` | string | Mot de passe / Token API | ❌ **REQUISE** |
| `MAIL_FROM` | email | Adresse d'expédition (From) | ❌ **REQUISE** |

### Variables Optionnelles

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `MAIL_PORT` | number | Port SMTP | `587` |
| `MAIL_SECURE` | boolean | SSL (true) ou STARTTLS (false) | `false` |

### Exemples

**Gmail**
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your_app_password  # App password, not standard password
MAIL_FROM=noreply@example.com
MAIL_SECURE=false
```

**SendGrid**
```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=SG.xxxxxxxxxxxx...
MAIL_FROM=noreply@example.com
MAIL_SECURE=false
```

**AWS SES (port SSL)**
```env
MAIL_HOST=email-smtp.eu-west-1.amazonaws.com
MAIL_PORT=465
MAIL_USER=AKIAIOSFODNN7EXAMPLE
MAIL_PASSWORD=BPxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxM
MAIL_FROM=noreply@example.com
MAIL_SECURE=true
```

---

## 7. Files d'Attente (Bull/Redis) (queue.config.ts)

### Variables

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `QUEUE_REDIS_HOST` | string | Hôte Redis des queues | `localhost` |
| `QUEUE_REDIS_PORT` | number | Port Redis des queues | `6379` |
| `QUEUE_REDIS_PASSWORD` | string | Mot de passe Redis | *(absent)* |
| `QUEUE_REDIS_DB` | number | Index base Redis | `0` |
| `QUEUE_PREFIX` | string | Préfixe des clés Redis | `bull` |

### Configuration des Jobs Par Défaut

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `QUEUE_JOB_ATTEMPTS` | number | Nombre maximal de tentatives | `3` |
| `QUEUE_JOB_BACKOFF_TYPE` | enum | Stratégie de backoff | `exponential` |
| `QUEUE_JOB_BACKOFF_DELAY` | number | Délai initial (ms) | `1000` |
| `QUEUE_JOB_REMOVE_ON_COMPLETE` | boolean | Supprimer après succès | `false` |
| `QUEUE_JOB_REMOVE_ON_FAIL` | boolean | Supprimer après échec | `false` |

### Exemple

```env
QUEUE_REDIS_HOST=redis
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_PASSWORD=
QUEUE_REDIS_DB=1
QUEUE_PREFIX=bull
```

---

## 8. Sécurité (security.config.ts)

### Protection Brute Force

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `BRUTE_FORCE_ENABLED` | boolean | Activer la protection | `true` |
| `BRUTE_FORCE_MAX_ATTEMPTS` | number | Tentatives avant blocage | `5` |
| `BRUTE_FORCE_WINDOW` | number | Fenêtre de temps (s) | `300` |
| `BRUTE_FORCE_BLOCK_DURATION` | number | Durée du blocage (s) | `900` |

### Réputation IP

| Variable | Type | Description | Valeur par Défaut | Requis si |
|----------|------|-------------|-------------------|-----------|
| `IP_REPUTATION_ENABLED` | boolean | Activer la vérification | `false` | ❌ |
| `IP_REPUTATION_API_KEY` | string | Clé API (ex: AbuseIPDB) | *(absent)* | ✅ si IP_REPUTATION_ENABLED=true |

### Audit & Tokens

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `AUDIT_LOG_ENABLED` | boolean | Enregistrer les actions sensibles | `true` |
| `REFRESH_TOKEN_ROTATION_ENABLED` | boolean | Rotation des refresh tokens | `true` |
| `REFRESH_TOKEN_REUSE_DETECTION` | boolean | Détection de réutilisation | `true` |

### Exemple

```env
# Brute force
BRUTE_FORCE_ENABLED=true
BRUTE_FORCE_MAX_ATTEMPTS=5
BRUTE_FORCE_WINDOW=300
BRUTE_FORCE_BLOCK_DURATION=900

# IP Reputation
IP_REPUTATION_ENABLED=false
# IP_REPUTATION_API_KEY=your_api_key_here

# Audit
AUDIT_LOG_ENABLED=true
REFRESH_TOKEN_ROTATION_ENABLED=true
REFRESH_TOKEN_REUSE_DETECTION=true
```

---

## 9. Télémétrie (OpenTelemetry) (telemetry.config.ts)

### Configuration Globale

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `TELEMETRY_ENABLED` | boolean | Activer la collecte des traces | `false` |
| `TELEMETRY_SERVICE_NAME` | string | Nom du service | `backend-starter` |
| `TELEMETRY_EXPORTER` | enum | Exportateur de traces | `console` |

### Exportateurs Supportés

#### Console (Développement)
```env
TELEMETRY_ENABLED=true
TELEMETRY_SERVICE_NAME=backend-starter
TELEMETRY_EXPORTER=console
```

#### OTLP (OpenTelemetry Protocol)
```env
TELEMETRY_ENABLED=true
TELEMETRY_SERVICE_NAME=backend-starter
TELEMETRY_EXPORTER=otlp
TELEMETRY_OTLP_ENDPOINT=http://collector:4318/v1/traces
```

#### Jaeger
```env
TELEMETRY_ENABLED=true
TELEMETRY_SERVICE_NAME=backend-starter
TELEMETRY_EXPORTER=jaeger
TELEMETRY_JAEGER_ENDPOINT=http://jaeger:14268/api/traces
```

#### Zipkin
```env
TELEMETRY_ENABLED=true
TELEMETRY_SERVICE_NAME=backend-starter
TELEMETRY_EXPORTER=zipkin
TELEMETRY_ZIPKIN_ENDPOINT=http://zipkin:9411/api/v2/spans
```

---

## 10. Métriques (Prometheus) (metrics.config.ts)

### Variables

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `METRICS_ENABLED` | boolean | Exposer les métriques | `false` |
| `METRICS_ENDPOINT` | string | Chemin d'accès (/metrics) | `/metrics` |
| `METRICS_PREFIX` | string | Préfixe des noms de métriques | `app_` |

### Exemple

```env
METRICS_ENABLED=true
METRICS_ENDPOINT=/metrics
METRICS_PREFIX=starter_
```

---

## 11. Multi-Tenant / SaaS (tenant.config.ts)

### Configuration Globale

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `MULTI_TENANT_ENABLED` | boolean | Activer le mode multi-tenant | `false` |
| `TENANT_IDENTIFIER` | enum | Méthode d'identification du tenant | `header` |
| `TENANT_DB_ISOLATION` | enum | Niveau d'isolation des données | `none` |

### Méthodes d'Identification

| Valeur | Description | Requis si |
|--------|-------------|-----------|
| `header` | Via un en-tête HTTP (X-Tenant-ID par défaut) | ❌ |
| `subdomain` | Via le sous-domaine (client1.example.com) | ❌ |
| `jwt` | Via une claim du JWT (sub, tenant_id, etc.) | ❌ |

### Niveaux d'Isolation

| Valeur | Description |
|--------|-------------|
| `database` | Base de données distincte par tenant |
| `schema` | Schéma distinct (PostgreSQL) |
| `collection` | Collection distincte (MongoDB) |
| `none` | Données partagées, identifiées par tenantId |

### Variables Conditionnelles

| Variable | Type | Requis si |
|----------|------|-----------|
| `TENANT_HEADER` | string | TENANT_IDENTIFIER=header |

### Exemples

**Mono-tenant (défaut)**
```env
MULTI_TENANT_ENABLED=false
```

**Multi-tenant avec isolation header**
```env
MULTI_TENANT_ENABLED=true
TENANT_IDENTIFIER=header
TENANT_HEADER=X-Tenant-ID
TENANT_DB_ISOLATION=collection
```

**Multi-tenant avec isolation subdomain**
```env
MULTI_TENANT_ENABLED=true
TENANT_IDENTIFIER=subdomain
TENANT_DB_ISOLATION=database
```

---

## 12. Idempotence (idempotency.config.ts)

### Variables

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `IDEMPOTENCY_ENABLED` | boolean | Activer la protection idempotence | `true` |
| `IDEMPOTENCY_TTL` | number | Durée de vie de la clé (s) | `86400` (24h) |
| `IDEMPOTENCY_KEY_HEADER` | string | Nom de l'en-tête idempotence | `Idempotency-Key` |
| `IDEMPOTENCY_PREFIX` | string | Préfixe cache/Redis | `idempotency:` |

### Exemple

```env
IDEMPOTENCY_ENABLED=true
IDEMPOTENCY_TTL=86400
IDEMPOTENCY_KEY_HEADER=Idempotency-Key
IDEMPOTENCY_PREFIX=idempotency:
```

---

## 13. Feature Flags (feature-flags.config.ts)

### Variables

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `FEATURE_FLAGS_ENABLED` | boolean | Système de feature flags actif | `true` |
| `FEATURE_FLAGS_PROVIDER` | enum | Source de vérité | `env` |
| `FEATURE_FLAGS_CACHE_TTL` | number | Durée du cache (s) | `60` |

### Providers

| Valeur | Description |
|--------|-------------|
| `env` | Variables d'environnement (simple) |
| `redis` | Redis (dynamique, performant) |
| `database` | Base de données (persistant) |

### Exemple

```env
FEATURE_FLAGS_ENABLED=true
FEATURE_FLAGS_PROVIDER=env
FEATURE_FLAGS_CACHE_TTL=60
```

---

## 14. Résilience (resilience.config.ts)

### Circuit Breaker

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `CIRCUIT_BREAKER_ENABLED` | boolean | Activer le circuit breaker | `true` |
| `CIRCUIT_BREAKER_TIMEOUT` | number | Timeout (ms) | `5000` |
| `CIRCUIT_BREAKER_ERROR_THRESHOLD` | number | Seuil d'erreur (%) | `50` |
| `CIRCUIT_BREAKER_RESET_TIMEOUT` | number | Durée half-open (ms) | `30000` |

### Retry

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `RETRY_ENABLED` | boolean | Activer les remises en essai | `true` |
| `RETRY_MAX_ATTEMPTS` | number | Nombre maximal de tentatives | `3` |
| `RETRY_BACKOFF` | number | Délai initial (ms) | `1000` |

### Timeout Global

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `TIMEOUT_ENABLED` | boolean | Activer le timeout global | `true` |
| `TIMEOUT_DEFAULT` | number | Timeout par défaut (ms) | `10000` |

### Exemple

```env
# Circuit Breaker
CIRCUIT_BREAKER_ENABLED=true
CIRCUIT_BREAKER_TIMEOUT=5000
CIRCUIT_BREAKER_ERROR_THRESHOLD=50
CIRCUIT_BREAKER_RESET_TIMEOUT=30000

# Retry
RETRY_ENABLED=true
RETRY_MAX_ATTEMPTS=3
RETRY_BACKOFF=1000

# Timeout
TIMEOUT_ENABLED=true
TIMEOUT_DEFAULT=10000
```

---

## 15. Logs d'Activité (activity-logs.config.ts)

### Variables

| Variable | Type | Description | Valeur par Défaut |
|----------|------|-------------|-------------------|
| `ACTIVITY_LOGS_RETENTION_DAYS` | number | Rétention en jours (1-3650) | `90` |

### Exemple

```env
# Rétention 90 jours (par défaut RGPD-compliant)
ACTIVITY_LOGS_RETENTION_DAYS=90

# Ou personnalisé
ACTIVITY_LOGS_RETENTION_DAYS=365
```

---

## 📝 Fichier .env Complet (Exemple)

### Développement

```env
# === APPLICATION ===
NODE_ENV=development
BASE_URL=http://localhost:3000
PORT=3000
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=debug
API_PREFIX=api

# === DATABASE ===
MONGODB_URI=mongodb://localhost:27017/starter
MONGODB_DEBUG=true
MONGODB_POOL_SIZE=5

# === REDIS ===
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# === JWT ===
JWT_SECRET=development-secret-key-not-secure
JWT_REFRESH_SECRET=development-refresh-secret-key-not-secure
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# === STORAGE ===
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=./uploads

# === MAIL ===
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=test@gmail.com
MAIL_PASSWORD=test_password
MAIL_FROM=noreply@localhost
MAIL_SECURE=false

# === QUEUE ===
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_DB=1

# === SECURITY ===
BRUTE_FORCE_ENABLED=true
BRUTE_FORCE_MAX_ATTEMPTS=5
AUDIT_LOG_ENABLED=true

# === TELEMETRY ===
TELEMETRY_ENABLED=false
TELEMETRY_SERVICE_NAME=backend-starter

# === METRICS ===
METRICS_ENABLED=false

# === FEATURE FLAGS ===
FEATURE_FLAGS_ENABLED=true
FEATURE_FLAGS_PROVIDER=env

# === MULTI-TENANT ===
MULTI_TENANT_ENABLED=false

# === RESILIENCE ===
CIRCUIT_BREAKER_ENABLED=true
RETRY_ENABLED=true

# === LOGS ===
ACTIVITY_LOGS_RETENTION_DAYS=90
```

### Production

```env
# === APPLICATION ===
NODE_ENV=production
BASE_URL=https://api.example.com
PORT=3000
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
LOG_LEVEL=info
API_PREFIX=api

# === DATABASE ===
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/starter?retryWrites=true&w=majority
MONGODB_SSL=true
MONGODB_POOL_SIZE=10
MONGODB_READ_PREFERENCE=secondaryPreferred

# === REDIS ===
REDIS_HOST=redis.production.example.com
REDIS_PORT=6380
REDIS_PASSWORD=very_secure_password
REDIS_TLS=true
REDIS_DB=0

# === JWT ===
JWT_SECRET=k9mL2pQ4vX7nR3sT8wF1jH5gB6cD0eA9bN7mK2lP5qY8rZ
JWT_REFRESH_SECRET=x2nP9sK4vL7mR3wQ8bF5jH9gC2dE1aT6yN3oM7pK4qZ0sS
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=my-app
JWT_AUDIENCE=my-app-users

# === STORAGE ===
STORAGE_DRIVER=s3
S3_BUCKET=my-app-bucket
S3_REGION=eu-west-1
S3_ACCESS_KEY=AKIA...
S3_SECRET_KEY=...

# === MAIL ===
MAIL_HOST=email-smtp.eu-west-1.amazonaws.com
MAIL_PORT=465
MAIL_USER=AKIAIOSFODNN7EXAMPLE
MAIL_PASSWORD=BPxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxM
MAIL_FROM=noreply@example.com
MAIL_SECURE=true

# === QUEUE ===
QUEUE_REDIS_HOST=redis.production.example.com
QUEUE_REDIS_PORT=6380
QUEUE_REDIS_PASSWORD=very_secure_password
QUEUE_REDIS_DB=1

# === SECURITY ===
BRUTE_FORCE_ENABLED=true
BRUTE_FORCE_MAX_ATTEMPTS=3
BRUTE_FORCE_WINDOW=600
BRUTE_FORCE_BLOCK_DURATION=1800
IP_REPUTATION_ENABLED=true
IP_REPUTATION_API_KEY=your_abuseipdb_key
AUDIT_LOG_ENABLED=true
REFRESH_TOKEN_ROTATION_ENABLED=true
REFRESH_TOKEN_REUSE_DETECTION=true

# === TELEMETRY ===
TELEMETRY_ENABLED=true
TELEMETRY_SERVICE_NAME=backend-starter
TELEMETRY_EXPORTER=otlp
TELEMETRY_OTLP_ENDPOINT=http://collector.logging.svc.cluster.local:4318/v1/traces

# === METRICS ===
METRICS_ENABLED=true
METRICS_ENDPOINT=/metrics
METRICS_PREFIX=starter_

# === FEATURE FLAGS ===
FEATURE_FLAGS_ENABLED=true
FEATURE_FLAGS_PROVIDER=redis
FEATURE_FLAGS_CACHE_TTL=300

# === MULTI-TENANT ===
MULTI_TENANT_ENABLED=false
TENANT_IDENTIFIER=header
TENANT_DB_ISOLATION=collection

# === RESILIENCE ===
CIRCUIT_BREAKER_ENABLED=true
CIRCUIT_BREAKER_TIMEOUT=5000
CIRCUIT_BREAKER_ERROR_THRESHOLD=50
RETRY_ENABLED=true
RETRY_MAX_ATTEMPTS=3
TIMEOUT_ENABLED=true
TIMEOUT_DEFAULT=10000

# === LOGS ===
ACTIVITY_LOGS_RETENTION_DAYS=365
```

---

## ⚠️ Points Importants

### 1. **Variables Obligatoires (Blocantes au Startup)**
- `BASE_URL`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `MAIL_HOST`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`

Si une de ces variables est manquante, l'application **ne démarrera pas**.

### 2. **Secrets à Générer Avec Sécurité**

```bash
# Générer des secrets JWT sécurisés
openssl rand -base64 32

# Ou en Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. **Gestion Stricte des Secrets**

- ❌ Ne JAMAIS commiter le `.env` en git
- ✅ Utiliser `.env.example` pour documenter la structure
- ✅ En production, utiliser un coffre-fort (Vault, AWS Secrets Manager, etc.)
- ✅ Rotationner régulièrement les secrets

### 4. **Validation au Démarrage**

La validation Joi s'exécute dans le fichier `app.module.ts` :

```typescript
ConfigModule.forRoot({
  validationSchema: combinedSchema,
  validationOptions: { allowUnknown: true },
})
```

Toute variable manquante ou invalide arrêtera l'application.

### 5. **Dépendances Entre Modules**

| Si vous activez... | Vous devez aussi configurer... |
|--------------------|---------------------------------|
| `IP_REPUTATION_ENABLED=true` | `IP_REPUTATION_API_KEY` |
| `REDIS_CLUSTER_ENABLED=true` | `REDIS_CLUSTER_NODES` |
| `REDIS_SENTINEL_ENABLED=true` | `REDIS_SENTINEL_NODES`, `REDIS_SENTINEL_MASTER_NAME` |
| `STORAGE_DRIVER=s3` | `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` |
| `TELEMETRY_EXPORTER=otlp` | `TELEMETRY_OTLP_ENDPOINT` |
| `TELEMETRY_EXPORTER=jaeger` | `TELEMETRY_JAEGER_ENDPOINT` |
| `TELEMETRY_EXPORTER=zipkin` | `TELEMETRY_ZIPKIN_ENDPOINT` |
| `TENANT_IDENTIFIER=header` | `TENANT_HEADER` |

### 6. **Conventions de Nommage**

- **Booléens** : `FEATURE_ENABLED=true` (toujours lowercase "true"/"false")
- **Listes CSV** : `ALLOWED_ORIGINS=origin1,origin2,origin3` (pas d'espaces après virgule)
- **Durées** : Suffixes comme `_TIMEOUT`, `_DELAY`, `_WINDOW` (ms par défaut)
- **Secrets** : Noms contenant `SECRET`, `PASSWORD`, `KEY`, `TOKEN`

---

## 🔍 Commandes Utiles

### Vérifier les variables manquantes

```bash
cd backend
npm run start 2>&1 | grep "ValidationError"
```

### Générer un fichier .env depuis .env.example

```bash
cp .env.example .env
# Puis éditer avec vos valeurs
```

### Valider la configuration au démarrage

L'application log les erreurs de configuration :

```bash
npm run start:dev
# En cas d'erreur : [Nest] 12345 - 03/09/2026, 10:30:45 AM     ERROR [ExceptionHandler] ...
```

---

## 📚 Ressources Complémentaires

- **NestJS Configuration** : https://docs.nestjs.com/techniques/configuration
- **Joi Validation** : https://joi.dev/api/
- **MongoDB URI** : https://www.mongodb.com/docs/manual/reference/connection-string/
- **OpenTelemetry** : https://opentelemetry.io/docs/
- **Bull Queue** : https://docs.bullmq.io/

---

**Dernière mise à jour** : 9 mars 2026  
**Version du projet** : 0.0.1
