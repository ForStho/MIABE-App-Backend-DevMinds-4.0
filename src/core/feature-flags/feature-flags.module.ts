import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FeatureFlagsService } from './feature-flags.service';

/**
 * Module global pour la gestion des feature flags.
 *
 * Il fournit le service `FeatureFlagsService` qui permet de vérifier
 * et de modifier les flags. Le service s'adapte au provider configuré
 * (env, redis, database) pour charger les flags.
 */
@Global()
@Module({})
export class FeatureFlagsModule {
  /**
   * Initialise le module de feature flags.
   *
   * @returns Un module dynamique avec les providers nécessaires
   */
  static forRoot(): DynamicModule {
    return {
      module: FeatureFlagsModule,
      imports: [ConfigModule], // Pour accéder à la configuration
      providers: [FeatureFlagsService],
      exports: [FeatureFlagsService],
    };
  }
}
