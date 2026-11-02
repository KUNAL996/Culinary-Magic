import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { getCookie } from '../utils/cookie.util';
import { SILENT_AUTH_CHECK } from '../utils/http-context';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const AUTH_ENDPOINTS_WITHOUT_RETRY = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  let clonedReq = req.clone({ withCredentials: true });

  if (MUTATING_METHODS.has(req.method)) {
    const csrfToken = getCookie('csrf_token');
    if (csrfToken) {
      clonedReq = clonedReq.clone({ setHeaders: { 'X-CSRF-Token': csrfToken } });
    }
  }

  const isAuthEndpoint = AUTH_ENDPOINTS_WITHOUT_RETRY.some((path) => req.url.includes(path));

  return next(clonedReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const csrfToken = getCookie('csrf_token');
            let retryReq = req.clone({ withCredentials: true });
            if (MUTATING_METHODS.has(req.method) && csrfToken) {
              retryReq = retryReq.clone({ setHeaders: { 'X-CSRF-Token': csrfToken } });
            }
            return next(retryReq);
          }),
          catchError((refreshError: unknown) => {
            authService.clearUser();
            if (!req.context.get(SILENT_AUTH_CHECK)) {
              router.navigate(['/login']);
            }
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
