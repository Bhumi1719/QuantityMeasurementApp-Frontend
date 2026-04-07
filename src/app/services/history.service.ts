import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HistoryRecord } from '../models/qms.models';

const HIST_KEY = 'qms_history';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  constructor(private auth: AuthService) {}

  private histKey(): string | null {
    const user = this.auth.currentUser;
    return user ? `${HIST_KEY}_${user.email}` : null;
  }

  getAll(): HistoryRecord[] {
    const key = this.histKey();
    if (!key) return [];
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  }

  save(record: Omit<HistoryRecord, 'id' | 'timestamp'>): void {
    const key = this.histKey();
    if (!key) return;
    const hist = this.getAll();
    hist.unshift({ ...record, id: Date.now(), timestamp: Date.now() });
    localStorage.setItem(key, JSON.stringify(hist.slice(0, 200)));
  }

  clear(): void {
    const key = this.histKey();
    if (key) localStorage.removeItem(key);
  }
}
