# 🌍 Configurations Pré-Configurées par Environnement

Ce document fournit des templates `.env` complets et testés pour chaque type de déploiement.

---

## 📋 Table des Matières

1. [🔵 Development (Local)](#-development-local)
2. [🟡 Test (CI/CD)](#-test-cicd)
3. [🟢 Production (AWS)](#-production-aws)
4. [🟣 Production (Kubernetes)](#-production-kubernetes)
5. [🔴 Production (Docker Compose)](#-production-docker-compose)

---

## 🔵 Development (Local)

**Profil** : Développement sur machine locale avec services Docker optionnels  
**Cas** : Développeurs travaillant sur la fonctionnalité

### Stack Recommandé

- **MongoDB** : `docker run -p 27017:27017 mongo`
- **Redis** : `docker run -p 6379:6379 redis`
- **Mail** : Mailtrap (gratuit) ou Mailhog local

### Fichier `.env.development`

```env
# ===============================================
# DEVELOPMENT ENVIRONMENT
# ===============================================

# === GÉNÉRAL ===
NODE_ENV=development
BASE_URL=http://localhost:3000
PORT=3000
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000
LOG_LEVEL=debug
API_PREFIX=api

# === DATABASE ===
MONGODB_URI=mongodb://localhost:27017/starter-dev
MONGODB_DEBUG=true
MONGODB_POOL_SIZE=5
MONGODB_RETRY_WRITES=true

# === REDIS ===
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_TLS=false

# === JWT ===
JWT_SECRET=dev-secret-key-change-in-production-12345
JWT_REFRESH_SECRET=dev-refresh-secret-key-change-in-production-12345
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d
JWT_ISSUER=localhost
JWT_AUDIENCE=dev-client

# === STORAGE ===
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=./uploads

# === MAIL ===
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USER=your_mailtrap_user
MAIL_PASSWORD=your_mailtrap_password
MAIL_FROM=dev@localhost
MAIL_SECURE=false

# === QUEUE ===
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_DB=1

# === SÉCURITÉ ===
BRUTE_FORCE_ENABLED=true
BRUTE_FORCE_MAX_ATTEMPTS=100  # Libéral en dev
AUDIT_LOG_ENABLED=true

# === TELEMETRY ===
TELEMETRY_ENABLED=false
TELEMETRY_SERVICE_NAME=backend-starter-dev
TELEMETRY_EXPORTER=console

# === MÉTRIQUES ===
METRICS_ENABLED=false

# === FEATURE FLAGS ===
FEATURE_FLAGS_ENABLED=true
FEATURE_FLAGS_PROVIDER=env

# === RÉSILIENCE ===
CIRCUIT_BREAKER_ENABLED=false  # Désactiver en dev pour un debugging facile
RETRY_ENABLED=true
RETRY_MAX_ATTEMPTS=1  # Une seule tentative en dev
TIMEOUT_ENABLED=true
TIMEOUT_DEFAULT=30000  # 30s en dev (plus tolérant)

# === LOGS ===
ACTIVITY_LOGS_RETENTION_DAYS=7

# === CUSTOM ===
# Ajouter vos variables de test ici
DEBUG_MODE=true
LOG_SQL_QUERIES=true
```

### Commandes de Démarrage

```bash
# Copier la config
cp .env.development .env

# Démarrer MongoDB et Redis (Docker)
docker-compose -f docker-compose.yml up -d

# Démarrer l'app
npm run start:dev

# Logs restent actifs, hot reload activé
```

---

## 🟡 Test (CI/CD)

**Profil** : Tests d'intégration en pipeline CI/CD  
**Cas** : GitHub Actions, GitLab CI, Jenkins, etc.

### Caractéristiques

- Bases de données isolées
- Services mockés si possible
- Pas de connexions externes
- Logs minimalistes
- Timeouts généreux (pour les runners lents)

### Fichier `.env.test`

```env
# ===============================================
# TEST ENVIRONMENT (CI/CD)
# ===============================================

NODE_ENV=test
BASE_URL=http://localhost:3000
PORT=3000
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=*
LOG_LEVEL=warn
API_PREFIX=api

# === DATABASE ===
# Base de données dédiée aux tests
MONGODB_URI=mongodb://localhost:27017/starter-test
MONGODB_DEBUG=false
MONGODB_POOL_SIZE=2
MONGODB_RETRY_WRITES=false

# === REDIS ===
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=2  # DB isolée pour tests
REDIS_TLS=false

# === JWT ===
JWT_SECRET=test-secret-do-not-use-in-production
JWT_REFRESH_SECRET=test-refresh-secret-do-not-use-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# === STORAGE ===
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=./uploads-test

# === MAIL ===
# Utiliser un service mock ou Mailtrap sandbox
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USER=ci_test_user
MAIL_PASSWORD=ci_test_password
MAIL_FROM=test@test.local
MAIL_SECURE=false

# === QUEUE ===
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_DB=3

# === SÉCURITÉ ===
BRUTE_FORCE_ENABLED=false
AUDIT_LOG_ENABLED=false
REFRESH_TOKEN_ROTATION_ENABLED=false

# === TELEMETRY ===
TELEMETRY_ENABLED=false

# === MÉTRIQUES ===
METRICS_ENABLED=false

# === RÉSILIENCE ===
CIRCUIT_BREAKER_ENABLED=false
RETRY_ENABLED=false
TIMEOUT_ENABLED=true
TIMEOUT_DEFAULT=60000  # 60s pour CI

# === LOGS ===
ACTIVITY_LOGS_RETENTION_DAYS=1
```

### Configuration CI/CD

```yaml
# .github/workflows/test.yml (GitHub Actions example)
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:latest
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
        ports:
          - 27017:27017
      redis:
        image: redis:latest
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm install
      - name: Setup .env
        run: cp .env.test .env
      - name: Run tests
        run: npm run test
```

---

## 🟢 Production (AWS)

**Profil** : Cloud AWS avec services gérés  
**Cas** : ECS, Lambda, EC2 avec RDS, ElastiCache, S3

### Services AWS Utilisés

- **MongoDB** : AWS DocumentDB (compatible MongoDB)
- **Redis** : AWS ElastiCache
- **Mail** : AWS SES
- **Storage** : AWS S3
- **Secrets** : AWS Secrets Manager
- **Monitoring** : CloudWatch, X-Ray

### Fichier `.env.production.aws`

```env
# ===============================================
# PRODUCTION (AWS)
# ===============================================

NODE_ENV=production
BASE_URL=https://api.example.com
PORT=3000
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com,https://app-staging.example.com
LOG_LEVEL=warn
API_PREFIX=api

# === DATABASE ===
# AWS DocumentDB
MONGODB_URI=mongodb://admin:password@my-cluster.us-east-1.docdb.amazonaws.com:27017/starter?retryWrites=true&w=majority&tls=true&tlsCAFile=rds-combined-ca-bundle.pem
MONGODB_POOL_SIZE=10
MONGODB_RETRY_WRITES=true
MONGODB_READ_PREFERENCE=secondaryPreferred

# === REDIS ===
# AWS ElastiCache
REDIS_HOST=my-redis.abc123.ng.0001.use1.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}  # De Secrets Manager
REDIS_TLS=true
REDIS_DB=0

# === JWT ===
JWT_SECRET=${JWT_SECRET}  # De Secrets Manager
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=my-app
JWT_AUDIENCE=my-app-users

# === STORAGE ===
# AWS S3
STORAGE_DRIVER=s3
S3_BUCKET=my-app-uploads-prod
S3_REGION=eu-west-1
S3_ACCESS_KEY=${S3_ACCESS_KEY}  # De Secrets Manager
S3_SECRET_KEY=${S3_SECRET_KEY}
S3_FORCE_PATH_STYLE=false

# === MAIL ===
# AWS SES
MAIL_HOST=email-smtp.eu-west-1.amazonaws.com
MAIL_PORT=465
MAIL_USER=${MAIL_USER}  # De Secrets Manager
MAIL_PASSWORD=${MAIL_PASSWORD}
MAIL_FROM=noreply@example.com
MAIL_SECURE=true

# === QUEUE ===
# Redis pour Bull
QUEUE_REDIS_HOST=my-redis.abc123.ng.0001.use1.cache.amazonaws.com
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_PASSWORD=${REDIS_PASSWORD}
QUEUE_REDIS_DB=1

# === SÉCURITÉ ===
BRUTE_FORCE_ENABLED=true
BRUTE_FORCE_MAX_ATTEMPTS=3
BRUTE_FORCE_WINDOW=600
BRUTE_FORCE_BLOCK_DURATION=1800
IP_REPUTATION_ENABLED=true
IP_REPUTATION_API_KEY=${IP_REPUTATION_API_KEY}
AUDIT_LOG_ENABLED=true
REFRESH_TOKEN_ROTATION_ENABLED=true
REFRESH_TOKEN_REUSE_DETECTION=true

# === TELEMETRY ===
# AWS X-Ray via OpenTelemetry
TELEMETRY_ENABLED=true
TELEMETRY_SERVICE_NAME=backend-starter
TELEMETRY_EXPORTER=otlp
TELEMETRY_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# === MÉTRIQUES ===
# CloudWatch via Prometheus
METRICS_ENABLED=true
METRICS_ENDPOINT=/metrics
METRICS_PREFIX=starter_

# === FEATURE FLAGS ===
FEATURE_FLAGS_ENABLED=true
FEATURE_FLAGS_PROVIDER=redis

# === RÉSILIENCE ===
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

### Configuration ECS Task Definition

```json
{
  "containerDefinitions": [
    {
      "name": "backend",
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "BASE_URL", "value": "https://api.example.com" }
      ],
      "secrets": [
        { "name": "MONGODB_URI", "valueFrom": "arn:aws:secretsmanager:us-east-1:123:secret:mongodb-uri" },
        { "name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:us-east-1:123:secret:jwt-secret" },
        { "name": "REDIS_PASSWORD", "valueFrom": "arn:aws:secretsmanager:us-east-1:123:secret:redis-password" }
      ]
    }
  ]
}
```

---

## 🟣 Production (Kubernetes)

**Profil** : Cluster Kubernetes avec Helm  
**Cas** : EKS, GKE, AKS, or self-managed K8s

### Stack Kubernetes

- **MongoDB** : Helm chart ou managed
- **Redis** : Helm chart Redis Sentinel pour HA
- **Ingress** : NGINX Ingress Controller
- **Secrets** : Kubernetes Secrets
- **Monitoring** : Prometheus + Grafana

### Fichier `.env.production.kubernetes`

```env
# ===============================================
# PRODUCTION (KUBERNETES)
# ===============================================

NODE_ENV=production
BASE_URL=https://api.example.com
PORT=3000
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=https://app.example.com
LOG_LEVEL=info
API_PREFIX=api

# === DATABASE ===
# Service interne Kubernetes
MONGODB_URI=mongodb://mongodb-statefulset-0.mongodb-headless.default.svc.cluster.local:27017,mongodb-statefulset-1.mongodb-headless.default.svc.cluster.local:27017/starter
MONGODB_REPLICA_SET=rs0
MONGODB_POOL_SIZE=10
MONGODB_RETRY_WRITES=true

# === REDIS ===
# via Redis Sentinel pour HA
REDIS_SENTINEL_ENABLED=true
REDIS_SENTINEL_NODES=redis-sentinel-0:26379,redis-sentinel-1:26379,redis-sentinel-2:26379
REDIS_SENTINEL_MASTER_NAME=mymaster
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_DB=0

# === JWT ===
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# === STORAGE ===
# Storage externe (S3 ou équivalent)
STORAGE_DRIVER=s3
S3_BUCKET=my-app-uploads
S3_REGION=eu-west-1
S3_ACCESS_KEY=${S3_ACCESS_KEY}
S3_SECRET_KEY=${S3_SECRET_KEY}

# === MAIL ===
MAIL_HOST=mailserver.mail.svc.cluster.local
MAIL_PORT=587
MAIL_USER=${MAIL_USER}
MAIL_PASSWORD=${MAIL_PASSWORD}
MAIL_FROM=noreply@example.com
MAIL_SECURE=false

# === QUEUE ===
QUEUE_REDIS_SENTINEL_ENABLED=true
QUEUE_REDIS_SENTINEL_NODES=redis-sentinel-0:26379,redis-sentinel-1:26379,redis-sentinel-2:26379
QUEUE_REDIS_SENTINEL_MASTER_NAME=mymaster
QUEUE_REDIS_PASSWORD=${REDIS_PASSWORD}
QUEUE_REDIS_DB=1

# === TELEMETRY ===
# Jaeger ou OTLP collector dans le cluster
TELEMETRY_ENABLED=true
TELEMETRY_SERVICE_NAME=backend-starter
TELEMETRY_EXPORTER=otlp
TELEMETRY_OTLP_ENDPOINT=http://otel-collector.observability.svc.cluster.local:4318/v1/traces

# === MÉTRIQUES ===
METRICS_ENABLED=true
METRICS_ENDPOINT=/metrics
METRICS_PREFIX=starter_

# === RÉSILIENCE ===
CIRCUIT_BREAKER_ENABLED=true
RETRY_ENABLED=true
TIMEOUT_ENABLED=true
TIMEOUT_DEFAULT=10000

# === LOGS ===
ACTIVITY_LOGS_RETENTION_DAYS=90
```

### Helm Values (values.yaml)

```yaml
# Chart values for Kubernetes deployment
env:
  NODE_ENV: production
  BASE_URL: https://api.example.com
  LOG_LEVEL: info
  MONGODB_REPLICA_SET: rs0
  REDIS_SENTINEL_ENABLED: "true"
  TELEMETRY_ENABLED: "true"
  METRICS_ENABLED: "true"

secrets:
  - JWT_SECRET
  - JWT_REFRESH_SECRET
  - MONGODB_URI
  - REDIS_PASSWORD
  - MAIL_PASSWORD
  - S3_ACCESS_KEY
  - S3_SECRET_KEY

resources:
  requests:
    cpu: "250m"
    memory: "512Mi"
  limits:
    cpu: "1000m"
    memory: "1Gi"

replicas: 3
```

---

## 🔴 Production (Docker Compose)

**Profil** : Déploiement multi-conteneurs avec Docker Compose  
**Cas** : VPS, serveur dédié, déploiement simple

### Stack

- **MongoDB** : Service Docker
- **Redis** : Service Docker
- **Mail** : Service Docker (Mailhog) ou externe
- **App** : Service Docker
- **Reverse Proxy** : Nginx

### Fichier `.env.production.docker-compose`

```env
# ===============================================
# PRODUCTION (DOCKER COMPOSE)
# ===============================================

NODE_ENV=production
BASE_URL=https://api.example.com
PORT=3000
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=https://app.example.com
LOG_LEVEL=warn
API_PREFIX=api

# === DATABASE ===
# Service MongoDB Docker
MONGODB_URI=mongodb://mongodb:27017/starter
MONGODB_POOL_SIZE=10
MONGODB_RETRY_WRITES=true
MONGODB_READ_PREFERENCE=primary

# === REDIS ===
# Service Redis Docker
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_TLS=false

# === JWT ===
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# === STORAGE ===
# Stockage local avec volume persistant
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=/app/uploads

# === MAIL ===
# Service mail Docker ou SMTP externe
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=noreply@example.com
MAIL_SECURE=false

# === QUEUE ===
QUEUE_REDIS_HOST=redis
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_DB=1

# === SÉCURITÉ ===
BRUTE_FORCE_ENABLED=true
AUDIT_LOG_ENABLED=true

# === TELEMETRY ===
TELEMETRY_ENABLED=false

# === MÉTRIQUES ===
METRICS_ENABLED=true
METRICS_ENDPOINT=/metrics

# === RÉSILIENCE ===
CIRCUIT_BREAKER_ENABLED=true
RETRY_ENABLED=true
TIMEOUT_ENABLED=true
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    environment:
      MONGO_INITDB_DATABASE: starter
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:latest
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"

  app:
    build: .
    depends_on:
      - mongodb
      - redis
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://mongodb:27017/starter
      REDIS_HOST: redis
    env_file:
      - .env.production.docker-compose
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app

volumes:
  mongodb_data:
  redis_data:
```

---

## 🔧 Choisir le Bon Template

| Environnement | Quand l'utiliser | Complexité | Coût |
|:---:|:---|:---:|:---:|
| **Development** | Développement local | ⭐ Basse | Gratuit |
| **Test** | CI/CD pipelines | ⭐⭐ Moyenne | Gratuit |
| **Production AWS** | Production scalable | ⭐⭐⭐⭐ Haute | $$$ |
| **Production K8s** | Production enterprise | ⭐⭐⭐⭐⭐ Très haute | $$$ |
| **Production Docker Compose** | Production simple | ⭐⭐ Moyenne | $ |

---

## ✅ Checklist de Déploiement

### Avant le Déploiement

- [ ] Fichier `.env` complet avec toutes les variables obligatoires
- [ ] Secrets générés et sécurisés (32+ caractères)
- [ ] Services externes testés (MongoDB, Redis, Mail, S3)
- [ ] CORS configuré correctement pour le domaine
- [ ] Certificats SSL/TLS en place si HTTPS
- [ ] Backups de base configurés
- [ ] Monitoring et alertes activés

### Après le Déploiement

- [ ] Health check répond
- [ ] Logs structurés capturés
- [ ] Métriques exposées
- [ ] Traces distribuées visibles
- [ ] Secrets pas en logs
- [ ] Performance baseline établie

---

## 📞 Troubleshooting

### Docker Compose ne démarre pas

```bash
# Vérifier les services
docker-compose ps

# Logs du service problématique
docker-compose logs app

# Recréer les conteneurs
docker-compose down
docker-compose up -d
```

### Erreur TimeZone en production

```bash
# Ajouter au Dockerfile
ENV TZ=UTC
RUN apt-get update && apt-get install -y tzdata
```

### Redis authentification échoue

```bash
# Vérifier la connexion
redis-cli -h redis.example.com -p 6379 -a password ping

# Debug dans le code
console.log('Redis client:', this.redisService.client.state);
```

---

**Créé** : 9 mars 2026  
**Dernière mise à jour** : 9 mars 2026
