import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private tenantService: TenantService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Extraire l'ID du tenant selon la configuration (header, sous-domaine, JWT)
    const tenantId = this.extractTenantId(req);
    if (tenantId) {
      this.tenantService.setCurrentTenant(tenantId);
    }
    next();
  }

  private extractTenantId(req: Request): string | null {
    // Exemple : header X-Tenant-ID
    const header = req.headers['x-tenant-id'];
    if (header) return Array.isArray(header) ? header[0] : header;
    // Autres méthodes : sous-domaine, etc.
    return null;
  }
}
