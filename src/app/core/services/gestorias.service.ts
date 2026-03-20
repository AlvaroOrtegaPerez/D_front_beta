import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class GestoriasService {
  private api = inject(ApiService);

  getExpedientesByComunidad(comunidadId: number): Observable<unknown[]> {
    return this.api.get<unknown[]>('gestorias', `/gestorias/expedientes?comunidadId=${comunidadId}`);
  }

  postExpediente(payload: {
    comunidades_id: number;
    programa: string;
    fecha_limite: string | null;
    observaciones: string;
  }): Observable<Record<string, unknown>> {
    return this.api.post<Record<string, unknown>>('gestorias', '/gestorias/expedientes', payload);
  }

  patchExpediente(expedienteId: number, payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.api.patch<Record<string, unknown>>('gestorias', `/gestorias/expedientes/${expedienteId}`, payload);
  }

  getDocumentos(expedienteId: number): Observable<unknown[]> {
    return this.api.get<unknown[]>('gestorias', `/gestorias/documentos?expedienteId=${expedienteId}`);
  }

  uploadDocumento(expedienteId: number, tipoDocumento: string, formData: FormData): Observable<Record<string, unknown>> {
    return this.api.upload<Record<string, unknown>>('gestorias', `/gestorias/documentos?expedienteId=${expedienteId}&tipoDocumento=${tipoDocumento}`, formData);
  }

  patchDocumento(documentoId: number, payload: Record<string, unknown>): Observable<Record<string, unknown>> {
    return this.api.patch<Record<string, unknown>>('gestorias', `/gestorias/documentos/${documentoId}`, payload);
  }
}
