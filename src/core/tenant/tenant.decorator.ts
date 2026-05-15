import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantService } from './tenant.service';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const tenantService = ctx.switchToHttp().getRequest().tenantService; // ou via injection
    return tenantService.getCurrentTenant();
  },
);
