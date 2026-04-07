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

  generarInformePreliminar(payload: Record<string, unknown>): Observable<{ blob_path: string; file_name: string }> {
    return this.api.post<{ blob_path: string; file_name: string }>('informes', '/informes/preliminar/generar', payload);
  }

  descargarInformePreliminar(blobPath: string): Observable<Blob> {
    return this.api.postBlob('informes', '/informes/preliminar/descargar', { blob_path: blobPath });
  }
}
