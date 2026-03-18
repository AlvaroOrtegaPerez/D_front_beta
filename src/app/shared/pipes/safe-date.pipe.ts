import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'safeDate', standalone: true })
export class SafeDatePipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '—';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    return dt.toLocaleDateString('es-ES');
  }
}
