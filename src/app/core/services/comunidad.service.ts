import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Comunidad } from '../../models/comunidad.model';

@Injectable({ providedIn: 'root' })
export class ComunidadService {
  private api = inject(ApiService);

  getComunidades(): Observable<Comunidad[]> {
    return this.api.get<Comunidad[]>('comunidades', '/comunidades');
  }

  getComunidadById(id: number): Observable<Record<string, unknown>> {
    return this.api.get<Record<string, unknown>>('comunidades', `/comunidades/${id}`);
  }

  postComunidad(payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.api.post<Record<string, unknown>>('comunidades', '/comunidades', payload);
  }

  patchComunidad(id: number, payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.api.patch<Record<string, unknown>>('comunidades', `/comunidades/${id}`, payload);
  }

  archivarComunidad(id: number): Observable<Record<string, unknown>> {
    return this.api.patch<Record<string, unknown>>('comunidades', `/comunidades/${id}/archivar`, {
      comunidades_id: id,
    });
  }
}
