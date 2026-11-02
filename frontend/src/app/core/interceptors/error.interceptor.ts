import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ToastService } from '../services/toast.service';

const SERVER_SIDE_STATUSES = new Set([0, 429, 500, 502, 503, 504]);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && SERVER_SIDE_STATUSES.has(error.status)) {
        const message =
          typeof error.error?.detail === 'string'
            ? error.error.detail
            : 'Something went wrong. Please try again in a moment.';
        toast.error(message);
      }
      return throwError(() => error);
    }),
  );
};
