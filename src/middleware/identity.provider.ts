import { Request } from 'express';

export class IdentityProvider {
  getUserId(req: Request): string | null {
    console.log('Fetching user ID from request headers...');
    const userId = req.header('identity-user-id');
    console.log(`User ID found: ${userId}`);
    return userId || null;
  }

  getTenantId(req: Request): string | null {
    console.log('Fetching tenant ID from request headers...');
    const tenantId = req.header('identity-tenant-id');
    console.log(`Tenant ID found: ${tenantId}`);
    return tenantId || null;
  }
}