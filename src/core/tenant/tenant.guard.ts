// src/core/tenant/tenant.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TenantService } from './tenant.service';

@Injectable()
export class TenantGuard implements CanActivate {
    constructor(private readonly tenantService: TenantService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const tenantId = request.tenantId; // Sera défini par le middleware

        if (!tenantId) {
            throw new UnauthorizedException('Tenant not identified');
        }

        // Vérifier que le tenant est valide/actif
        const isValid = this.tenantService.validateTenant(tenantId);
        if (!isValid) {
            throw new UnauthorizedException('Invalid or inactive tenant');
        }

        return true;
    }
}