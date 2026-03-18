import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { RecomendacionesService } from '../../core/services/recomendaciones.service';
import { SubvencionesService } from '../../core/services/subvenciones.service';
import { ToastService } from '../../core/services/toast.service';
import { RecomendacionAPI, SubvencionAPI, isRecomendacionAPI, isSubvencionAPI, getResumenRecomendacionText } from '../../models/recomendacion.model';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card';
import { EcoButtonComponent } from '../../shared/components/eco-button/eco-button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import { FormatEurPipe } from '../../shared/pipes/format-eur.pipe';
import { FormatPctPipe } from '../../shared/pipes/format-pct.pipe';

@Component({
  selector: 'app-recomendaciones',
  standalone: true,
  imports: [GlassCardComponent, MetricCardComponent, EcoButtonComponent, LoadingSpinnerComponent, FormatEurPipe, FormatPctPipe, DecimalPipe],
  templateUrl: './recomendaciones.html',
  styleUrl: './recomendaciones.css'
})
export class RecomendacionesPage implements OnInit {
  private recsService = inject(RecomendacionesService);
  private subvsService = inject(SubvencionesService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(true);
  recs = signal<RecomendacionAPI | null>(null);
  subvs = signal<SubvencionAPI | null>(null);
  resumenText = signal('');
  comunidadId = signal<number | null>(null);

  ngOnInit(): void {
    const id = sessionStorage.getItem('comunidades_id');
    if (!id) {
      this.toast.error('No se encontró la comunidad');
      this.router.navigateByUrl('/mis-comunidades');
      return;
    }
    this.comunidadId.set(Number(id));
    this.loadData(Number(id));
  }

  private loadData(id: number): void {
    this.loading.set(true);

    this.recsService.generarRecomendaciones(id).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (isRecomendacionAPI(data)) {
          this.recs.set(data);
          this.resumenText.set(getResumenRecomendacionText(data) ?? '');
        }
        this.loading.set(false);
      },
      error: () => {
        this.recsService.getRecomendaciones(id).subscribe({
          next: (res) => {
            const data = this.extractData(res);
            if (isRecomendacionAPI(data)) {
              this.recs.set(data);
              this.resumenText.set(getResumenRecomendacionText(data) ?? '');
            }
            this.loading.set(false);
          },
          error: () => { this.loading.set(false); this.toast.error('Error al cargar recomendaciones'); }
        });
      }
    });

    this.subvsService.generarSubvenciones(id).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (isSubvencionAPI(data)) this.subvs.set(data);
      },
      error: () => {
        this.subvsService.getSubvenciones(id).subscribe({
          next: (res) => {
            const data = this.extractData(res);
            if (isSubvencionAPI(data)) this.subvs.set(data);
          }
        });
      }
    });
  }

  private extractData(res: unknown): unknown {
    if (!res) return res;
    if (typeof res === 'object') {
      const obj = res as Record<string, unknown>;
      if (Array.isArray(obj['data'])) return (obj['data'] as unknown[])[0] ?? res;
      if (Array.isArray(obj['items'])) return (obj['items'] as unknown[])[0] ?? res;
      if (Array.isArray(res)) return (res as unknown[])[0] ?? res;
    }
    return res;
  }

  get mixItems(): { label: string; pct: number; color: string }[] {
    const r = this.recs();
    if (!r) return [];
    return [
      { label: 'Fotovoltaica', pct: r.mix_fotovoltaica_pct ?? 0, color: '#f59e0b' },
      { label: 'Aerotermia', pct: r.mix_aerotermia_pct ?? 0, color: '#3b82f6' },
      { label: 'Geotermia', pct: r.mix_geotermia_pct ?? 0, color: '#ef4444' },
      { label: 'Biomasa', pct: r.mix_biomasa_pct ?? 0, color: '#10b981' },
      { label: 'Microhidráulica', pct: r.mix_microhidraulica_pct ?? 0, color: '#8b5cf6' },
    ].filter(m => m.pct > 0);
  }

  get eligibilityItems(): { label: string; eligible: boolean }[] {
    const s = this.subvs();
    if (!s) return [];
    return [
      { label: 'NextGen EU', eligible: s.eligible_nextgen },
      { label: 'Nacional', eligible: s.eligible_nacional },
      { label: 'Regional', eligible: s.eligible_regional },
      { label: 'Municipal', eligible: s.eligible_municipal },
    ];
  }

  goBack(): void { this.router.navigateByUrl('/mis-comunidades'); }
  goDashboard(): void { this.router.navigateByUrl('/dashboard-gestoria'); }
}
