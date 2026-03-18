import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment, ApiBaseKey } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private getBase(key: ApiBaseKey): string {
    return environment.api[key];
  }

  get<T>(baseKey: ApiBaseKey, path: string): Observable<T> {
    return this.http.get<T>(`${this.getBase(baseKey)}${path}`);
  }

  post<T>(baseKey: ApiBaseKey, path: string, body?: unknown): Observable<T> {
    return this.http.post<T>(`${this.getBase(baseKey)}${path}`, body ?? {});
  }

  patch<T>(baseKey: ApiBaseKey, path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.getBase(baseKey)}${path}`, body);
  }

  upload<T>(baseKey: ApiBaseKey, path: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.getBase(baseKey)}${path}`, formData);
  }

  postNoAuth<T>(baseKey: ApiBaseKey, path: string, body?: unknown): Observable<T> {
    const headers = new HttpHeaders({ 'X-Skip-Auth': 'true' });
    return this.http.post<T>(`${this.getBase(baseKey)}${path}`, body ?? {}, { headers });
  }
}
