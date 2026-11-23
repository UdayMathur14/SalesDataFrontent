import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from './auth-session.service';
import { SALES_ROUTE_ACCESS } from './sales-permissions';

export const permissionGuard: CanActivateFn = route => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const required = route.data['permissions'] as readonly string[] | undefined;

  if (!required?.length || authSession.hasAnyPermission(required)) return true;

  const firstAllowed = SALES_ROUTE_ACCESS.find(item =>
    authSession.hasAnyPermission(item.permissions),
  );

  return router.parseUrl(firstAllowed?.path ?? '/access-denied');
};
