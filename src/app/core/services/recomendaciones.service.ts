import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RecomendacionesService {
  private api = inject(ApiService);

  getRecomendaciones(idComunidad: number): Observable<Record<string, unknown>> {
    return this.api.get<Record<string, unknown>>('recommendations', `/recomendaciones/${idComunidad}`);
  }

  generarRecomendaciones(comunidadesId: number): Observable<Record<string, unknown>> {
    return this.api.post<Record<string, unknown>>('recommendations', '/generar', {
      comunidades_id: comunidadesId,
    });
  }
}
