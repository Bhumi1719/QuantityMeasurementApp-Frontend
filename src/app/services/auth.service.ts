import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

const API = 'http://localhost:8080/api/v1/auth';

export interface UserInfo {
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _loggedIn$ = new BehaviorSubject<boolean>(!!localStorage.getItem('jwt_token'));
  loggedIn$ = this._loggedIn$.asObservable();

  constructor(private http: HttpClient) {}

  get isLoggedIn(): boolean { return !!localStorage.getItem('jwt_token'); }

  get currentUser(): UserInfo | null {
    const u = localStorage.getItem('user_info');
    return u ? JSON.parse(u) : null;
  }

  signup(username: string, email: string, password: string): Observable<string> {
    return this.http.post(`${API}/signup`, { username, email, password }, { responseType: 'text' })
      .pipe(tap(token => this.saveSession(token, { name: username, email })));
  }

  login(email: string, password: string): Observable<string> {
    return this.http.post(`${API}/login`, { email, password }, { responseType: 'text' })
      .pipe(tap(token => this.saveSession(token, { name: email.split('@')[0], email })));
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    this._loggedIn$.next(false);
  }

  private saveSession(token: string, user: UserInfo): void {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_info', JSON.stringify(user));
    this._loggedIn$.next(true);
  }
}
