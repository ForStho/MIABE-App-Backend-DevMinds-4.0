/**
 * Script pour créer tous les indexes manquants dans MongoDB.
 * Utile après un déploiement ou pour s'assurer que les indexes sont en place.
 * Il peut être exécuté via l'application NestJS.
 *
 * Utilisation :
 *   ts-node src/database/scripts/create-indexes.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('CreateIndexes');
  logger.log('Starting index creation...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const connection = app.get<Connection>(getConnectionToken());

  try {
    // Récupérer tous les modèles enregistrés
    const modelNames = connection.modelNames();
    logger.log(`Found ${modelNames.length} models`);

    for (const modelName of modelNames) {
      const model = connection.model(modelName);
      logger.log(`Ensuring indexes for model: ${modelName}`);
      await model.ensureIndexes();
    }

    logger.log('Index creation completed successfully');
  } catch (error) {
    logger.error(`Index creation failed: ${error.message}`, error.stack);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
