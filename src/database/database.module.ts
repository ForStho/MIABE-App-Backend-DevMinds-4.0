/**
 * Module optionnel pour regrouper les services liés à la base de données
 * (par exemple, un service pour exécuter des requêtes natives).
 * Ce module n'est pas indispensable car la plupart des interactions
 * se font via les modules métier. Il peut être utile pour des scripts
 * ou des tâches d'administration.
 */
import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
