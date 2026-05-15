## 📁 Dossier `core/` – Infrastructure centralisée

### 🎯 Rôle du dossier `core`

Le dossier `core` contient toute l'infrastructure technique de l'application, indépendante du métier. Il regroupe les composants transversaux tels que la connexion à la base de données, le cache Redis, le logging, les événements, les health checks, les queues, le tracing, les métriques, le multi-tenant, l'idempotence, les feature flags, la résilience et la sécurité avancée.

**Objectifs :**
- Séparer clairement l'infrastructure du code métier.
- Fournir des modules réutilisables et configurables.
- Permettre d'activer/désactiver des fonctionnalités via des options.
- Garantir une base solide et scalable pour tous les projets.

---

### 📂 Structure du dossier

```
core/
├── core.module.ts                  # Module global assemblant tous les sous-modules
├── database/                       # Connexion MongoDB (Mongoose)
│   ├── database.constants.ts
│   ├── database.module.ts
│   └── database.service.ts
├── redis/                          # Client Redis (standalone, cluster, sentinel)
│   ├── redis.constants.ts
│   ├── redis.module.ts
│   ├── redis.service.ts
│   ├── cache.service.ts
│   ├── rate-limit.store.ts
│   └── blacklist.service.ts
├── logger/                         # Logging centralisé (Winston)
│   ├── logger.constants.ts
│   ├── logger.module.ts
│   └── logger.service.ts
├── events/                         # Event bus interne (EventEmitter2)
│   ├── events.constants.ts
│   ├── events.module.ts
│   └── event-bus.service.ts
├── health/                         # Health checks (Terminus)
│   ├── health.module.ts
│   ├── health.controller.ts
│   └── health.service.ts
├── queue/                          # Abstraction pour Bull (queues)
│   ├── queue.constants.ts
│   ├── queue.module.ts
│   └── queue.service.ts
├── telemetry/                      # Tracing distribué (OpenTelemetry)
│   ├── telemetry.constants.ts
│   ├── telemetry.module.ts
│   ├── telemetry.service.ts
│   └── telemetry.middleware.ts
├── metrics/                        # Métriques Prometheus
│   ├── metrics.constants.ts
│   ├── metrics.module.ts
│   ├── metrics.interceptor.ts
│   └── metrics.service.ts
├── tenant/                         # Multi-tenant
│   ├── tenant.constants.ts
│   ├── tenant.module.ts
│   ├── tenant.middleware.ts
│   ├── tenant.service.ts
│   └── tenant.decorator.ts
├── idempotency/                    # Idempotence des requêtes
│   ├── idempotency.constants.ts
│   ├── idempotency.module.ts
│   ├── idempotency.middleware.ts
│   └── idempotency.service.ts
├── feature-flags/                  # Feature flags dynamiques
│   ├── feature-flags.constants.ts
│   ├── feature-flags.module.ts
│   ├── feature-flags.service.ts
│   ├── feature-flags.decorator.ts
│   └── feature-flags.guard.ts
├── resilience/                     # Circuit breaker, retry, timeout, fallback
│   ├── resilience.constants.ts
│   ├── resilience.module.ts
│   ├── circuit-breaker.decorator.ts
│   ├── retry.decorator.ts
│   ├── timeout.decorator.ts
│   └── fallback.decorator.ts
└── security/                       # Brute force, audit logs, IP reputation
    ├── security.constants.ts
    ├── security.module.ts
    ├── brute-force.service.ts
    ├── brute-force.guard.ts
    ├── audit-log.service.ts
    └── ip-reputation.service.ts
```

---

### 🧱 Principes de conception

1. **Modularité** : Chaque domaine technique est isolé dans son propre module. Chaque module expose ses services et peut être importé indépendamment.
2. **Configurabilité** : Tous les modules utilisent `ConfigService` pour lire leur configuration depuis le dossier `config/`. Des options peuvent être passées via `forRoot()`.
3. **Extensibilité** : L'ajout d'un nouveau service d'infrastructure se fait en créant un nouveau sous-dossier et en l'intégrant dans `CoreModule`.
4. **Découplage** : Les modules métier n'importent jamais directement les détails d'infrastructure (ex: ils utilisent `QueueService` plutôt que Bull directement). Cela permet de changer de bibliothèque sans impacter le métier.
5. **Production-ready** : Gestion des erreurs, des reconnexions, des événements de cycle de vie, et des health checks.
6. **Scalabilité** : Support natif des clusters Redis, replica sets MongoDB, et des patterns de résilience.

---

### 🚀 Utilisation dans l'application

#### 1. Importer `CoreModule` dans `AppModule`

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    CoreModule.forRoot({
      // Vous pouvez désactiver certains modules optionnels
      enableTelemetry: process.env.TELEMETRY_ENABLED === 'true',
      enableMetrics: process.env.METRICS_ENABLED === 'true',
      enableTenant: process.env.MULTI_TENANT_ENABLED === 'true',
      // Tous les autres sont activés par défaut
    }),
    // ... autres modules
  ],
})
export class AppModule {}
```

#### 2. Accéder aux services dans vos modules métier

```typescript
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../core/database/database.service';
import { CacheService } from '../core/redis/cache.service';
import { EventBusService } from '../core/events/event-bus.service';

@Injectable()
export class UsersService {
  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
    private eventBus: EventBusService,
  ) {}

  async createUser(data: any) {
    // Utilisation de la base de données
    const user = await this.databaseService.getModel('User').create(data);
    // Mise en cache
    await this.cacheService.set(`user:${user.id}`, user, 3600);
    // Émission d'un événement
    this.eventBus.emit('user.created', user);
    return user;
  }
}
```

#### 3. Utilisation des décorateurs de résilience

```typescript
import { Injectable } from '@nestjs/common';
import { CircuitBreaker, Retry, Timeout, Fallback } from '../core/resilience';

@Injectable()
export class ExternalApiService {
  @CircuitBreaker({ timeout: 3000, errorThresholdPercentage: 50 })
  @Retry({ maxAttempts: 3, backoff: 1000 })
  @Timeout(5000)
  @Fallback('default value')
  async callExternalApi() {
    // Appel à un service externe
  }
}
```

#### 4. Protection contre le brute force

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BruteForceGuard } from '../core/security/brute-force.guard';

@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(BruteForceGuard) // Protège contre le brute force
  async login(@Body() credentials) {
    // ...
  }
}
```

---

### 🧩 Description des modules

| Module | Description | Dépendances |
|--------|-------------|-------------|
| **Database** | Connexion MongoDB via Mongoose avec support replica set, transactions, plugins globaux. | ConfigService |
| **Redis** | Client Redis supportant standalone, cluster, sentinel. Fournit des services de cache, rate limiting, blacklist. | ConfigService |
| **Logger** | Logging structuré avec Winston, niveaux configurables, format JSON en production, support correlation ID. | ConfigService |
| **Events** | Bus d'événements interne (EventEmitter2) avec wildcards, asynchrone. | - |
| **Health** | Health checks pour MongoDB, Redis, et endpoints liveness/readiness pour Kubernetes. | DatabaseService, RedisService |
| **Queue** | Abstraction pour Bull (queues). Fournit un service pour ajouter des jobs et des processeurs prédéfinis. | Redis (via Config) |
| **Telemetry** | Tracing distribué avec OpenTelemetry, export vers Jaeger/Zipkin/OTLP. Middleware pour injecter traceId. | ConfigService |
| **Metrics** | Métriques Prometheus : compteurs HTTP, histogrammes, endpoint /metrics. | - |
| **Tenant** | Gestion multi-tenant : extraction de l'ID depuis header/sous-domaine, isolation par base/schéma/collection. | ConfigService |
| **Idempotency** | Idempotence des requêtes via clé Idempotency-Key, stockage Redis. | RedisService, ConfigService |
| **Feature Flags** | Feature flags dynamiques avec provider env/redis/database. Décorateur et guard pour activer des routes. | ConfigService, RedisService (optionnel) |
| **Resilience** | Décorateurs pour circuit breaker (opossum), retry, timeout, fallback. | ConfigService |
| **Security** | Protection brute force (Redis), audit logs, vérification de réputation IP (optionnel). | RedisService, ConfigService |

---

### ➕ Ajouter un nouveau module dans `core`

1. Créer un sous-dossier (ex: `new-feature/`).
2. Définir des constantes, un module, un service, et éventuellement des contrôleurs/middlewares/guards.
3. Dans `new-feature.module.ts`, exporter les services nécessaires.
4. Dans `core.module.ts`, ajouter une option pour activer/désactiver le module (si optionnel).
5. Importer le module conditionnellement dans `forRoot()` et l'exporter.

Exemple de structure :

```typescript
// core/new-feature/new-feature.module.ts
@Module({})
export class NewFeatureModule {
  static forRoot(): DynamicModule {
    return {
      module: NewFeatureModule,
      providers: [NewFeatureService],
      exports: [NewFeatureService],
    };
  }
}
```

Puis dans `core.module.ts` :

```typescript
if (options?.enableNewFeature) {
  imports.push(NewFeatureModule.forRoot());
}
```

---

### ✅ Bonnes pratiques

- **Toujours utiliser `ConfigService`** pour les paramètres, jamais de `process.env` directement dans les services.
- **Documenter** chaque service avec des commentaires JSDoc.
- **Gérer les erreurs** et les événements de cycle de vie (OnModuleInit, OnModuleDestroy).
- **Privilégier l'injection de dépendances** plutôt que l'utilisation de singletons globaux.
- **Tester** chaque module indépendamment avec des mocks.

---

### 📚 Exemples concrets

Pour chaque module, des exemples d'utilisation sont disponibles dans la documentation respective (à venir). Le starter inclut déjà des cas d'usage typiques.

---

Ce README sert de guide pour comprendre et étendre l'infrastructure du projet. Il est vivement recommandé de le conserver à jour au fur et à mesure des évolutions.