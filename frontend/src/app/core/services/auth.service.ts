import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, User } from '../models/user.model';
import { SILENT_AUTH_CHECK } from '../utils/http-context';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly usersUrl = `${environment.apiBaseUrl}/users`;

  readonly currentUser = signal<User | null>(null);

  private refreshing$: Observable<User> | null = null;

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<User> {
    return this.http
      .post<User>(`${this.baseUrl}/register`, data, { withCredentials: true })
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  login(data: LoginRequest): Observable<User> {
    return this.http
      .post<User>(`${this.baseUrl}/login`, data, { withCredentials: true })
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.currentUser.set(null)));
  }

  fetchCurrentUser(options: { silent?: boolean } = {}): Observable<User> {
    return this.http
      .get<User>(`${this.usersUrl}/me`, {
        withCredentials: true,
        context: new HttpContext().set(SILENT_AUTH_CHECK, !!options.silent),
      })
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  /** Deduplicates concurrent refresh attempts triggered by simultaneous 401s. */
  refreshToken(): Observable<User> {
    if (!this.refreshing$) {
      this.refreshing$ = this.http.post<User>(`${this.baseUrl}/refresh`, {}, { withCredentials: true }).pipe(
        tap((user) => this.currentUser.set(user)),
        finalize(() => (this.refreshing$ = null)),
        shareReplay(1),
      );
    }
    return this.refreshing$;
  }

  clearUser(): void {
    this.currentUser.set(null);
  }
}
