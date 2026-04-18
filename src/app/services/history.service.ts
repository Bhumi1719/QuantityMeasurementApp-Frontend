import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoryRecord } from '../models/qms.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private apiUrl = `${environment.apiUrl}/api/v1/quantities`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<HistoryRecord[]> {
    return this.http.get<HistoryRecord[]>(this.apiUrl);
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }
}
