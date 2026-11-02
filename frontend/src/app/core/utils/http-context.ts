import { HttpContextToken } from '@angular/common/http';

/** When true, a failed refresh on this request must not redirect to /login (used for the silent app-boot auth check). */
export const SILENT_AUTH_CHECK = new HttpContextToken<boolean>(() => false);
