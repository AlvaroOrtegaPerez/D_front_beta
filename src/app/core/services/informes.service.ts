import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class InformesService {
  private api = inject(ApiService);

  generarCertificado(comunidadId: number): Observable<Record<string, unknown>> {
    return this.api.post<Record<string, unknown>>('informes', '/informes/certificado/generar', {
      comunidades_id: comunidadId,
    });
  }

  getInformesByComunidad(comunidadId: number): Observable<unknown[]> {
    return this.api.get<unknown[]>('informes', `/informes?comunidadId=${comunidadId}`);
  }
}
