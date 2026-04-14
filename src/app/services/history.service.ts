import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoryRecord } from '../models/qms.models';

const API = 'http://localhost:8080/api/v1/quantities';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<HistoryRecord[]> {
    return this.http.get<HistoryRecord[]>(API);
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${API}/${id}`);
  }
}
