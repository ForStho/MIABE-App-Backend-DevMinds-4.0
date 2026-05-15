import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession, ConnectionStates, Model } from 'mongoose';

/**
 * Service encapsulant la connexion MongoDB et fournissant des utilitaires.
 *
 * Ce service permet de :
 * - Surveiller l'état de la connexion (via les événements Mongoose)
 * - Exécuter des transactions
 * - Accéder au modèle brut pour des opérations génériques
 * - Vérifier l'état de la connexion
 *
 * Il implémente OnModuleInit et OnModuleDestroy pour gérer proprement le cycle de vie.
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    // Injection de la connexion Mongoose par défaut
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  /**
   * Hook appelé lors de l'initialisation du module.
   * On enregistre des listeners pour surveiller les événements de connexion MongoDB.
   */
  onModuleInit(): void {
    // Connexion établie
    this.connection.on('connected', () => {
      this.logger.log('MongoDB connected successfully');
    });

    // Erreur de connexion (perte de connexion, etc.)
    this.connection.on('error', (err: Error) => {
      this.logger.error(`MongoDB connection error: ${err.message}`, err.stack);
    });

    // Déconnexion (volontaire ou non)
    this.connection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
    });

    // Reconnexion automatique (Mongoose tente de se reconnecter)
    this.connection.on('reconnected', () => {
      this.logger.log('MongoDB reconnected');
    });
  }

  /**
   * Hook appelé lors de la destruction du module (arrêt de l'application).
   * On ferme proprement la connexion MongoDB.
   */
  async onModuleDestroy(): Promise<void> {
    await this.connection.close();
    this.logger.log('MongoDB connection closed');
  }

  /**
   * Retourne l'objet de connexion brut pour des opérations avancées
   * (par exemple, accéder à la base native, démarrer des sessions, etc.).
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Vérifie si la connexion est actuellement active (readyState = 1).
   *
   * @returns true si connecté, false sinon
   */
  isConnected(): boolean {
    return this.connection.readyState === ConnectionStates.connected;
  }

  /**
   * Exécute une fonction dans une transaction MongoDB.
   *
   * Nécessite que MongoDB soit configuré en replica set.
   *
   * @param fn - Fonction asynchrone recevant la session et retournant un résultat
   * @returns Le résultat de la fonction
   * @throws L'erreur originale en cas d'échec (après annulation de la transaction)
   */
  async runTransaction<T>(
    fn: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = await this.connection.startSession();

    try {
      session.startTransaction(); // Début de la transaction

      const result = await fn(session); // Exécution de la logique métier

      await session.commitTransaction(); // Validation si tout est OK

      return result;
    } catch (error: unknown) {
      // En cas d'erreur, on annule la transaction
      await session.abortTransaction();

      // Log de l'erreur
      if (error instanceof Error) {
        this.logger.error(`Transaction failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('Transaction failed: unknown error');
      }

      throw error; // On relance l'erreur pour que l'appelant puisse la gérer
    } finally {
      // Toujours terminer la session
      await session.endSession();
    }
  }

  /**
   * Retourne un modèle Mongoose pour une collection donnée.
   * Utile pour des opérations génériques où le modèle n'est pas injecté.
   *
   * @param collectionName - Nom de la collection (ou du modèle)
   * @returns Le modèle Mongoose typé
   */
  getModel<T>(collectionName: string): Model<T> {
    return this.connection.model<T>(collectionName);
  }
}
