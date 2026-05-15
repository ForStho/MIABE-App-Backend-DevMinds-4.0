import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class TenantService {
  private readonly storage = new AsyncLocalStorage<{ tenantId: string }>();

  setCurrentTenant(tenantId: string): void {
    this.storage.enterWith({ tenantId });
  }

  getCurrentTenant(): string | undefined {
    return this.storage.getStore()?.tenantId;
  }

  runWithTenant<T>(tenantId: string, callback: () => T): T {
    return this.storage.run({ tenantId }, callback);
  }

  /**
   * Vérifie si un tenant est valide
   */
  validateTenant(tenantId: string): boolean {
    if (!tenantId) {
      return false;
    }

    // Exemple simple : vérifier format
    if (tenantId.length < 2) {
      return false;
    }

    return true;
  }
}