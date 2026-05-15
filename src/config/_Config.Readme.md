
---

# 📁 Dossier `config/` – Configuration modulaire et validation

## 🎯 Objectif

Ce dossier centralise **toute la configuration de l'application** de manière **modulaire**, **validée** et **extensible**. Chaque domaine fonctionnel (base de données, Redis, JWT, stockage, etc.) possède son propre fichier de configuration, ce qui permet :

- Une **maintenabilité** accrue (chaque équipe/module peut gérer sa config)
- Une **validation fine** grâce à Joi, avec des règles conditionnelles (ex: certaines variables ne sont requises que si une fonctionnalité est activée)
- Une **documentation vivante** via les commentaires et les schémas Joi
- Une **extensibilité** simple : ajouter une nouvelle config ne casse pas les existantes
- Une **sécurité** : les variables manquantes ou invalides bloquent le démarrage de l'application

---

## 📂 Structure des fichiers

```
src/config/
├── configuration.ts           # Point d’entrée : exporte toutes les configs (tableau)
├── app.config.ts              # Configuration générale (port, CORS, logs, etc.)
├── database.config.ts         # Connexion MongoDB (URI, pool, replica set, SSL...)
├── redis.config.ts            # Redis (standalone, cluster, sentinel)
├── jwt.config.ts              # JWT (secrets, expiration)
├── storage.config.ts          # Stockage de fichiers (local, S3)
├── queue.config.ts            # Bull (connexion Redis, options des jobs)
├── mail.config.ts             # SMTP (optionnel)
├── telemetry.config.ts        # OpenTelemetry (tracing)
├── metrics.config.ts          # Prometheus (métriques)
├── tenant.config.ts           # Multi-tenant (isolation, identification)
├── idempotency.config.ts      # Idempotence des requêtes
├── feature-flags.config.ts    # Feature flags (provider, cache)
├── resilience.config.ts       # Circuit breaker, retry, timeout
├── security.config.ts         # Brute force, IP reputation, audit logs
├── activity-logs.config.ts    # Rétention des logs d’activité (audit)
└── validation.schema.ts       # Fusion de tous les schémas Joi (validation globale)
```

---

## 🔧 Principes de fonctionnement

### 1. Modules `registerAs`

Chaque fichier exporte une fonction `registerAs('namespace', () => ({...}))`. Cela crée un espace de noms dans la configuration globale. Par exemple, `database.config.ts` exporte sous le nom `'database'`. On pourra ensuite récupérer les valeurs via `configService.get('database.uri')`.

### 2. Validation Joi par domaine

Chaque fichier définit également un schéma Joi (`export const xxxConfigSchema`) qui décrit :

- Les types attendus (string, number, boolean, etc.)
- Les valeurs par défaut
- Les contraintes (min, max, enum, etc.)
- Les dépendances conditionnelles (`when`)

Cette approche permet de valider les variables d’environnement **avant même que l’application ne démarre**. Si une variable requise est manquante, NestJS lèvera une erreur explicative.

### 3. Point d’entrée `configuration.ts`

Ce fichier importe toutes les configurations individuelles et les exporte sous forme de tableau. Il est utilisé dans `app.module.ts` avec `ConfigModule.forRoot({ load: configuration })`.

### 4. Validation globale `validation.schema.ts`

Ce fichier fusionne tous les schémas individuels en un seul objet Joi en utilisant la méthode `concat`. Il est passé à `ConfigModule.forRoot({ validationSchema })` pour une validation unique de toutes les variables.

---

## 🚀 Utilisation dans les services

Pour accéder à une variable de configuration, injectez `ConfigService` :

```typescript
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MyService {
  constructor(private configService: ConfigService) {}

  someMethod() {
    const dbUri = this.configService.get<string>('database.uri');
    const redisHost = this.configService.get<string>('redis.host');
    // Accès à un sous-objet
    const s3Bucket = this.configService.get('storage.s3.bucket');
  }
}
```

> **Note** : La méthode `get()` est typée grâce aux types TypeScript inférés des schémas.

---

## ➕ Ajouter une nouvelle configuration

1. **Créer le fichier** `ma-nouvelle-config.config.ts` dans `src/config/`.
2. **Définir le schéma Joi** : exporter `maNouvelleConfigSchema` (obligatoire pour la validation globale).
3. **Définir la configuration** avec `registerAs('monNamespace', () => ({...}))`.
4. **Importer et exporter** dans `configuration.ts` (ajouter la ligne d’import et l’ajouter au tableau).
5. **Ajouter le schéma** dans `validation.schema.ts` en concaténant `maNouvelleConfigSchema`.
6. **Documenter** les variables dans le fichier (commentaires) et éventuellement dans ce README.

---

## 🧩 Gestion des dépendances conditionnelles

Certaines configurations sont optionnelles et activées via des flags (ex: `TELEMETRY_ENABLED`). Les schémas Joi utilisent `when` pour rendre certaines variables **conditionnellement requises**. Par exemple, dans `mail.config.ts` :

```typescript
MAIL_HOST: Joi.when('MAIL_ENABLED', {
  is: true,
  then: Joi.string().required(),
  otherwise: Joi.optional(),
})
```

Cela garantit que si le module mail est activé, toutes les variables nécessaires sont présentes.

---

## 📝 Bonnes pratiques

- **Toujours documenter** chaque variable avec `.description()` dans le schéma Joi. Cette description apparaîtra en cas d’erreur de validation.
- **Utiliser des valeurs par défaut** lorsque c’est pertinent, pour simplifier le développement.
- **Ne pas mélanger les domaines** : chaque fichier ne concerne qu’un seul aspect technique ou métier.
- **Garder les noms de variables d’environnement cohérents** : préfixez‑les par le domaine (ex: `DATABASE_URI`, `REDIS_HOST`).
- **Tester la configuration** : dans vos tests, vous pouvez surcharger la configuration avec `ConfigModule.forRoot({ load: [testConfig] })`.
- **Ne pas exposer les secrets** : les mots de passe et clés API ne doivent jamais être versionnés. Utilisez toujours des variables d’environnement (fichiers `.env` ignorés par git) ou un gestionnaire de secrets en production.

---

## 🔐 Sécurité

Ne committez jamais de secrets (mots de passe, clés API) dans les fichiers de configuration. Utilisez toujours des variables d’environnement. En production, ces variables peuvent être injectées via Docker/Kubernetes secrets ou un service de gestion de secrets.

---

## 📚 Exemple de fichier `.env` typique

```env
# App
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=http://localhost:4200

# Database
MONGODB_URI=mongodb://localhost:27017/starter
MONGODB_DEBUG=true
MONGODB_POOL_SIZE=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_CLUSTER_ENABLED=true
# REDIS_CLUSTER_NODES=host1:6379,host2:6379

# JWT
JWT_SECRET=mysecret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=myrefreshsecret
JWT_REFRESH_EXPIRES_IN=7d

# Storage
STORAGE_DRIVER=local
LOCAL_STORAGE_PATH=./uploads

# Feature flags
FEATURE_MAIL=false
FEATURE_TELEMETRY=false

# Activity logs
ACTIVITY_LOGS_RETENTION_DAYS=90
```

---

