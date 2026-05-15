import { Module, DynamicModule, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios'; // Import nécessaire pour HttpService
import { BruteForceService } from './brute-force.service';
import { BruteForceGuard } from './brute-force.guard';
import { AuditLogService } from './audit-log.service';
import { IpReputationService } from './ip-reputation.service';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';

@Global()
@Module({})
export class SecurityModule {
  static forRoot(): DynamicModule {
    return {
      module: SecurityModule,
      imports: [
        // Enregistrement du schéma AuditLog dans Mongoose
        MongooseModule.forFeature([
          { name: AuditLog.name, schema: AuditLogSchema }
        ]),
        // Configuration de HttpModule pour IpReputationService
        HttpModule.registerAsync({
          useFactory: () => ({
            timeout: 5000,
            maxRedirects: 3,
            baseURL: 'https://api.abuseipdb.com/api/v2', // URL de base optionnelle
          }),
        }),
      ],
      providers: [
        BruteForceService,
        BruteForceGuard,
        AuditLogService,
        IpReputationService,
      ],
      exports: [
        BruteForceService, 
        AuditLogService, 
        IpReputationService,
        MongooseModule, // Export pour que les modèles soient disponibles ailleurs
      ],
    };
  }
}