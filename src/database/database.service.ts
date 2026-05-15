/**
 * Service optionnel pour interagir directement avec la base de données
 * en dehors des modèles Mongoose. Par exemple, pour exécuter des commandes
 * d'agrégation complexes ou des opérations natives.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  /**
   * Retourne la connexion Mongoose brute.
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Vérifie si la connexion à la base de données est établie.
   */
  private isConnected(): boolean {
    return this.connection.readyState === 1;
  }

  /**
   * Exécute une commande d'agrégation sur une collection.
   * @param collection Nom de la collection
   * @param pipeline Pipeline d'agrégation
   */
  async aggregate(collection: string, pipeline: Record<string, unknown>[]): Promise<unknown[]> {
    if (!this.isConnected()) {
      this.logger.error('Cannot execute aggregation: Database not connected');
      return [];
    }

    try {
      return await this.connection
        .collection(collection)
        .aggregate(pipeline)
        .toArray();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Aggregation failed on collection ${collection}: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Exécute une commande native (ex: createIndex, dropCollection).
   * @param command Commande MongoDB à exécuter
   */
  async runCommand(command: Record<string, unknown>): Promise<unknown> {
    if (!this.isConnected()) {
      this.logger.error('Cannot run command: Database not connected');
      throw new Error('Database not connected');
    }

    // Vérification que db existe
    if (!this.connection.db) {
      this.logger.error('Database instance not available');
      throw new Error('Database instance not available');
    }

    try {
      return await this.connection.db.command(command);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Command failed: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Vérifie si une collection existe.
   * @param collectionName Nom de la collection
   */
  async collectionExists(collectionName: string): Promise<boolean> {
    if (!this.isConnected() || !this.connection.db) {
      return false;
    }

    try {
      const collections = await this.connection.db.listCollections({ name: collectionName }).toArray();
      return collections.length > 0;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to check collection existence: ${err.message}`, err.stack);
      return false;
    }
  }
}