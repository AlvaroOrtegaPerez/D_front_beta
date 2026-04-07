import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SubvencionesService {
  private api = inject(ApiService);

  getSubvenciones(idComunidad: number): Observable<Record<string, unknown>> {
    return this.api.get<Record<string, unknown>>('subvenciones', `/subvenciones?comunidadId=${idComunidad}`);
  }

  generarSubvenciones(payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.api.post<Record<string, unknown>>('subvenciones', '/subvenciones', payload);
  }
}
