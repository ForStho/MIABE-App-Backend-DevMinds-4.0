import { Module, DynamicModule, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusService } from './event-bus.service';

/**
 * Module global pour la gestion des événements.
 *
 * Il encapsule `EventEmitterModule` et fournit le service `EventBusService`.
 * La configuration par défaut active les wildcards (par exemple, 'user.*') et
 * utilise le point comme délimiteur.
 *
 * @Global() permet d'avoir une seule instance du bus dans toute l'application.
 */
@Global()
@Module({})
export class EventsModule {
  /**
   * Initialise le module de manière dynamique avec les options fournies.
   *
   * @param options - Options de configuration pour l'EventEmitter
   * @returns Un module dynamique avec EventEmitterModule.forRoot() configuré
   */
  static forRoot(options?: {
    wildcard?: boolean;
    delimiter?: string;
  }): DynamicModule {
    return {
      module: EventsModule,
      imports: [
        EventEmitterModule.forRoot({
          wildcard: options?.wildcard ?? true, // Permet les patterns comme 'user.*'
          delimiter: options?.delimiter ?? '.', // Séparateur pour les namespaces
          newListener: false, // Ne pas émettre d'événement quand un listener est ajouté
          removeListener: false, // Idem pour la suppression
          maxListeners: 20, // Nombre max de listeners par événement (alerte en cas de fuite)
          verboseMemoryLeak: true, // Affiche un avertissement détaillé en cas de fuite mémoire
          ignoreErrors: false, // Ne pas ignorer les erreurs dans les listeners (elles remontent)
        }),
      ],
      providers: [EventBusService],
      exports: [EventBusService],
    };
  }
}
