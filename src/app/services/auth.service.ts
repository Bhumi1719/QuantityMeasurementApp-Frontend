import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/qms.models';

const USERS_KEY   = 'qms_users';
const SESSION_KEY = 'qms_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<User | null>(this.getSession());
  user$ = this._user$.asObservable();

  get isLoggedIn(): boolean { return !!this._user$.value; }
  get currentUser(): User | null { return this._user$.value; }

  private getUsers(): User[] {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
    catch { return []; }
  }

  private getSession(): User | null {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch { return null; }
  }

  signup(name: string, email: string, password: string): string | null {
    if (!name || !email || !password) return 'Please fill in all fields.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email.';

    const users = this.getUsers();
    if (users.find(u => u.email === email)) return 'Email already registered.';

    const user: User = { name, email, password };
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    this.setSession(user);
    return null;
  }

  login(email: string, password: string): string | null {
    if (!email || !password) return 'Please fill in all fields.';
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return 'Invalid email or password.';
    this.setSession(user);
    return null;
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this._user$.next(null);
  }

  private setSession(user: User): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    this._user$.next(user);
  }
}
