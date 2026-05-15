
---

# 📁 Dossier `common/` – Briques techniques réutilisables

## 🎯 Rôle

Le dossier `common` contient tous les éléments techniques **transversaux** et **réutilisables** qui ne sont pas liés à un module métier spécifique. Il fournit une boîte à outils pour :

* La gestion de l'authentification (guards, décorateurs)
* Le contrôle des accès (rôles, permissions)
* La transformation des réponses (intercepteurs)
* La gestion des erreurs (filtres)
* La validation des données (pipes)
* Les utilitaires généraux (hash, pagination, sanitization)
* Les plugins Mongoose globaux

Ces composants sont destinés à être utilisés par **tous les modules métier** de manière cohérente.

---

## 📂 Structure

```
common/
├── common.module.ts                 # Module global enregistrant les providers globaux
├── constants/                       # Constantes techniques
│   └── http-status.constants.ts
├── decorators/                      # Décorateurs personnalisés
│   ├── current-user.decorator.ts
│   ├── public.decorator.ts
│   ├── roles.decorator.ts
│   └── permissions.decorator.ts
├── guards/                          # Guards d'authentification et d'autorisation
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts
│   ├── permissions.guard.ts
│   └── rate-limit.guard.ts
├── interceptors/                    # Intercepteurs pour les requêtes/réponses
│   ├── response.interceptor.ts
│   ├── logging.interceptor.ts
│   ├── timeout.interceptor.ts
│   └── cache.interceptor.ts         # (optionnel)
├── filters/                         # Filtres d'exception
│   ├── http-exception.filter.ts
│   └── all-exceptions.filter.ts     # (optionnel)
├── pipes/                           # Pipes de validation et transformation
│   ├── validation.pipe.ts
│   ├── parse-object-id.pipe.ts
│   └── sanitize.pipe.ts             # (optionnel)
├── utils/                           # Utilitaires génériques
│   ├── hash.util.ts
│   ├── pagination.util.ts
│   ├── sanitize.util.ts
│   └── token.util.ts
└── plugins/                         # Plugins Mongoose globaux
    ├── soft-delete.plugin.ts
    └── slug.plugin.ts
```

---

## 🧩 Description des composants

### 1. `constants/`

* **`http-status.constants.ts`** : Définit les codes HTTP sous forme de constantes nommées pour éviter les *magic numbers*.

---

### 2. `decorators/`

* **`@CurrentUser()`** : Injecte l'utilisateur courant (ou une propriété spécifique) dans un paramètre de contrôleur.
* **`@Public()`** : Marque une route comme publique (ignore l'authentification JWT).
* **`@Roles(...)`** : Spécifie les rôles autorisés sur une route.
* **`@RequirePermission(...)`** : Spécifie les permissions requises sur une route.

---

### 3. `guards/`

* **`JwtAuthGuard`** : Guard d'authentification JWT. Vérifie la présence et la validité du token. Respecte le décorateur `@Public()`.
* **`RolesGuard`** : Vérifie que l'utilisateur possède au moins un des rôles requis.
* **`PermissionsGuard`** : Vérifie que l'utilisateur possède toutes les permissions requises.
* **`RateLimitGuard`** : Limite le nombre de requêtes par IP/utilisateur en utilisant Redis.

---

### 4. `interceptors/`

* **`ResponseInterceptor`** : Transforme toutes les réponses en un format standardisé :

```json
{
  "success": true,
  "data": {},
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/users",
  "statusCode": 200
}
```

* **`LoggingInterceptor`** : Enregistre chaque requête (méthode, URL, utilisateur, temps d'exécution).
* **`TimeoutInterceptor`** : Applique un timeout global configurable sur les requêtes.
* **`CacheInterceptor`** *(optionnel)* : Met en cache les réponses `GET` dans Redis (nécessite `CacheService`).

---

### 5. `filters/`

* **`HttpExceptionFilter`** : Capture toutes les exceptions HTTP et les formate en une réponse d'erreur standardisée.
* **`AllExceptionsFilter`** *(optionnel)* : Capture toutes les exceptions non gérées (erreurs système) et renvoie une erreur 500 générique en production.

---

### 6. `pipes/`

* **`ValidationPipe`** : Valide les données entrantes avec `class-validator` et formate les erreurs de validation.
* **`ParseObjectIdPipe`** : Valide qu'une chaîne est un `ObjectId` MongoDB valide.
* **`SanitizePipe`** *(optionnel)* : Nettoie les objets en supprimant les champs sensibles (ex: `password`).

---

### 7. `utils/`

* **`HashUtil`** : Hachage et comparaison de mots de passe avec `bcrypt`.
* **`PaginationUtil`** : Génère des réponses paginées standardisées et calcule le `skip` pour MongoDB.
* **`SanitizeUtil`** : Supprime les champs sensibles d'un objet ou d'un tableau.
* **`TokenUtil`** : Génère des tokens aléatoires (hex, numériques).

---

### 8. `plugins/`

* **`softDeletePlugin`** : Plugin Mongoose pour le soft delete.

  * Ajoute un champ `deletedAt`
  * Filtre automatiquement les documents supprimés

* **`slugPlugin`** : Plugin Mongoose pour générer automatiquement un slug à partir d'un champ (ex: titre).

---

# 🚀 Utilisation

## 1️⃣ Importer `CommonModule` dans `AppModule`

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';

@Module({
  imports: [CommonModule],
})
export class AppModule {}
```

---

## 2️⃣ Utiliser les décorateurs dans les contrôleurs

```typescript
import { Controller, Get, Post } from '@nestjs/common';
import { Roles, Permissions, CurrentUser, Public } from '../common/decorators';
import { Role } from '../shared/constants/roles.enum';
import { Permission } from '../shared/constants/permissions.enum';

@Controller('users')
export class UsersController {
  @Get('profile')
  @Roles(Role.USER)
  getProfile(@CurrentUser() user) {
    return user;
  }

  @Post()
  @Permissions(Permission.CREATE_USER)
  @Public()
  createUser() {
    // ...
  }
}
```

---

## 3️⃣ Utiliser les guards sur des routes spécifiques

```typescript
import { UseGuards, Controller } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../common/guards';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {}
```

---

## 4️⃣ Personnaliser le rate limiting

Le `RateLimitGuard` peut être configuré par route via un décorateur `@Throttle()` (à implémenter si besoin).

Par défaut, il utilise :

* **10 requêtes par minute**
* Par IP ou par utilisateur

---

# ⚙️ Configuration

Certains composants (comme `TimeoutInterceptor`) utilisent `ConfigService` pour obtenir leurs paramètres.

Assurez-vous que la configuration appropriée est définie dans le dossier `config/`
(ex: `resilience.timeout.default`).

---

# ➕ Ajouter un nouveau composant

1. Créez le fichier dans le sous-dossier approprié.
2. Si le composant doit être global (guard, interceptor, filter, pipe), ajoutez-le dans `common.module.ts` avec le token `APP_*`.
3. Si le composant est un utilitaire, exportez-le simplement.
4. Documentez-le avec des commentaires JSDoc.

---

# ✅ Bonnes pratiques

* Toujours commenter les décorateurs, guards, etc., avec des exemples d'utilisation.
* Utiliser les constantes de `http-status.constants.ts` plutôt que des nombres.
* Tester chaque composant unitairement.
* Privilégier l'injection de dépendances plutôt que des singletons statiques (sauf pour les utils).

---

# 🏗 Conclusion

Le dossier `common/` constitue le **cœur technique réutilisable** de l'application.

Il garantit :

* La cohérence des réponses
* L’uniformité des erreurs
* La sécurité globale
* La standardisation des comportements techniques

Il doit rester **strictement technique**, sans logique métier.

---
