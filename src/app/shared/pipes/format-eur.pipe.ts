import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatEur', standalone: true })
export class FormatEurPipe implements PipeTransform {
  transform(value: number | undefined | null): string {
    if (typeof value !== 'number' || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }
}
