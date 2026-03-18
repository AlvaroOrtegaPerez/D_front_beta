import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatPct', standalone: true })
export class FormatPctPipe implements PipeTransform {
  transform(value: number | undefined | null): string {
    if (typeof value !== 'number' || Number.isNaN(value)) return '—';
    return `${Math.round(value)}%`;
  }
}
