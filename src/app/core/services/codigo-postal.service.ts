import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodigoPostalService {

  // TODO BACKEND: 
  // Inyectar HttpClient en el constructor y cambiar esta lógica para que 
  // llame a tu endpoint de producción. Ejemplo:
  // return this.http.get<string[]>(`/api/codigos-postales?provincia=${provincia}&municipio=${municipio}`);

  public getCodigosPostales(provincia: string, municipio: string): Observable<string[]> {
    
    // MOCK DATA PARA PRUEBAS (Se puede borrar cuando se conecte al Backend)
    if (!provincia || !municipio) {
      return of([]);
    }

    // Devolvemos 5 códigos ficticios basados en la primera letra del municipio para simular que son dinámicos
    const prefix = municipio.length >= 2 ? municipio.substring(0,2).toUpperCase() : 'XX';
    const mockData = [
      `28001`, `28002`, `28003`, `28004`, `28005`, `28006` // Datos genéricos
    ];
    
    // Si el municipio es muy conocido como "Móstoles", mandamos unos más reales
    if (municipio.toLowerCase().includes('móstoles') || municipio.toLowerCase().includes('mostoles')) {
      return of(['28931', '28932', '28933', '28934', '28935', '28936', '28937', '28938']).pipe(delay(400));
    }
    
    if (municipio.toLowerCase().includes('madrid')) {
       return of(['28001', '28002', '28003', '28004', '28005', '28006', '28007', '28008', '28012', '28013']).pipe(delay(400));
    }

    return of(mockData).pipe(delay(400));
  }
}
