import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class GestoriasService {
  private api = inject(ApiService);

  getExpedientesByComunidad(comunidadId: number): Observable<unknown[]> {
    return this.api.get<unknown[]>('gestorias', `/expedientes/${comunidadId}`);
  }

  postExpediente(payload: {
    comunidades_id: number;
    programa: string;
    fecha_limite: string | null;
    observaciones: string;
  }): Observable<Record<string, unknown>> {
    return this.api.post<Record<string, unknown>>('gestorias', '/expedientes', payload);
  }

  patchExpediente(expedienteId: number, payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.api.patch<Record<string, unknown>>('gestorias', `/expedientes/${expedienteId}`, payload);
  }

  getDocumentos(expedienteId: number): Observable<unknown[]> {
    return this.api.get<unknown[]>('gestorias', `/documentos?expediente_id=${expedienteId}`);
  }

  uploadDocumento(formData: FormData): Observable<Record<string, unknown>> {
    return this.api.upload<Record<string, unknown>>('gestorias', '/documentos', formData);
  }

  patchDocumento(documentoId: number, payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.api.patch<Record<string, unknown>>('gestorias', `/documentos/${documentoId}`, payload);
  }
}
