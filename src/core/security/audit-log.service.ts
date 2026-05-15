import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

/**
 * Interface pour les métadonnées d'audit
 */
export interface AuditMetadata {
  ip?: string;
  userAgent?: string;
  changes?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Service de journalisation des actions d'audit.
 * Enregistre toutes les actions sensibles pour traçabilité.
 */
@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  /**
   * Enregistre une action d'audit.
   * @param userId - ID de l'utilisateur ayant effectué l'action
   * @param action - Type d'action (ex: 'CREATE', 'UPDATE', 'DELETE', 'LOGIN')
   * @param resource - Type de ressource concernée (ex: 'user', 'order')
   * @param resourceId - ID de la ressource (optionnel)
   * @param metadata - Métadonnées supplémentaires (IP, userAgent, changes, etc.)
   */
  async log(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: AuditMetadata,
  ): Promise<AuditLogDocument> {
    const log = new this.auditLogModel({
      userId,
      action,
      resource,
      resourceId,
      metadata,
      timestamp: new Date(),
    });
    
    return log.save();
  }

  /**
   * Récupère les logs d'audit pour un utilisateur.
   * @param userId - ID de l'utilisateur
   * @param limit - Nombre maximum de logs à retourner (défaut: 100)
   * @param skip - Nombre de logs à sauter (pour pagination)
   */
  async findByUser(
    userId: string,
    limit = 100,
    skip = 0,
  ): Promise<AuditLogDocument[]> {
    return this.auditLogModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  /**
   * Récupère les logs d'audit pour une ressource spécifique.
   * @param resource - Type de ressource
   * @param resourceId - ID de la ressource
   * @param limit - Nombre maximum de logs
   */
  async findByResource(
    resource: string,
    resourceId: string,
    limit = 50,
  ): Promise<AuditLogDocument[]> {
    return this.auditLogModel
      .find({ resource, resourceId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Récupère les logs d'audit pour une période donnée.
   * @param startDate - Date de début
   * @param endDate - Date de fin
   * @param limit - Nombre maximum de logs
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit = 1000,
  ): Promise<AuditLogDocument[]> {
    return this.auditLogModel
      .find({
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Supprime les logs plus anciens qu'une certaine date (pour nettoyage).
   * @param olderThan - Date limite de conservation
   */
  async deleteOldLogs(olderThan: Date): Promise<number> {
    const result = await this.auditLogModel
      .deleteMany({
        timestamp: { $lt: olderThan },
      })
      .exec();
    
    return result.deletedCount ?? 0;
  }
}