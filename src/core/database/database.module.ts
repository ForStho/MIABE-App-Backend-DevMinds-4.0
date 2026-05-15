// src/core/database/database.module.ts
import { Module, DynamicModule, Global } from '@nestjs/common';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';

import { DatabaseService } from './database.service';
import { mongoosePlugins } from '../../common/plugins';

export interface DatabaseConfig {
  uri?: string;
}

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(options?: DatabaseConfig): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (
            configService: ConfigService,
          ): MongooseModuleFactoryOptions => {
            const uri = options?.uri ?? configService.get<string>('database.uri');

            // Récupérer la config MongoDB
            const dbConfig = configService.get('database') || {};

            return {
              uri,
              // Options Mongoose valides
              retryAttempts: 5,
              retryDelay: 1000,

              // Options de connexion MongoDB (directement dans l'objet, pas dans connectionOptions)
              maxPoolSize: dbConfig.poolSize || 10,
              minPoolSize: 1,
              socketTimeoutMS: 30000,
              connectTimeoutMS: 10000,
              serverSelectionTimeoutMS: 5000,
              heartbeatFrequencyMS: 10000,
              retryWrites: dbConfig.retryWrites ?? true,
              retryReads: true,

              // Debug Mongoose
              // debug: dbConfig.debug ?? false,

              // Factory pour les plugins
              connectionFactory: (connection: Connection) => {
                mongoosePlugins.forEach((plugin) => {
                  connection.plugin(plugin);
                });
                return connection;
              },
            };
          },
        }),
      ],
      providers: [DatabaseService],
      exports: [DatabaseService, MongooseModule],
    };
  }
}