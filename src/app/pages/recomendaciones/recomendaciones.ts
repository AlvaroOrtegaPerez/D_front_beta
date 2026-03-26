import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { RecomendacionesService } from '../../core/services/recomendaciones.service';
import { SubvencionesService } from '../../core/services/subvenciones.service';
import { ComunidadService } from '../../core/services/comunidad.service';
import { ToastService } from '../../core/services/toast.service';
import { RecomendacionAPI, SubvencionAPI, isRecomendacionAPI, isSubvencionAPI, getResumenRecomendacionText } from '../../models/recomendacion.model';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card';
import { EcoButtonComponent } from '../../shared/components/eco-button/eco-button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import { TabBarComponent } from '../../shared/components/tab-bar/tab-bar';
import { BadgeComponent } from '../../shared/components/badge/badge';
import { FormatEurPipe } from '../../shared/pipes/format-eur.pipe';
import { FormatPctPipe } from '../../shared/pipes/format-pct.pipe';

@Component({
  selector: 'app-recomendaciones',
  standalone: true,
  imports: [GlassCardComponent, MetricCardComponent, EcoButtonComponent, LoadingSpinnerComponent, TabBarComponent, BadgeComponent, FormatEurPipe, FormatPctPipe, DecimalPipe],
  templateUrl: './recomendaciones.html',
  styleUrl: './recomendaciones.css'
})
export class RecomendacionesPage implements OnInit {
  private recsService = inject(RecomendacionesService);
  private subvsService = inject(SubvencionesService);
  private comunidadService = inject(ComunidadService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(true);
  recs = signal<RecomendacionAPI | null>(null);
  subvs = signal<SubvencionAPI | null>(null);
  resumenText = signal('');
  comunidadId = signal<number | null>(null);
  comunidad = signal<Record<string, unknown> | null>(null);

  savingsTabLabels = ['1 Año', '3 Años', '5 Años'];
  activeSavingsTab = signal(2);

  savingsKwh = computed(() => {
    const r = this.recs();
    if (!r) return 0;
    const tab = this.activeSavingsTab();
    if (tab === 0) return r.ahorro_1anio_kwh;
    if (tab === 1) return r.ahorro_3anios_kwh;
    return r.ahorro_5anios_kwh;
  });

  savingsEur = computed(() => {
    const r = this.recs();
    if (!r) return 0;
    const tab = this.activeSavingsTab();
    if (tab === 0) return r.ahorro_1anio_eur;
    if (tab === 1) return r.ahorro_3anios_eur;
    return r.ahorro_5anios_eur;
  });

  savingsCo2 = computed(() => {
    const r = this.recs();
    if (!r) return 0;
    const tab = this.activeSavingsTab();
    if (tab === 0) return r.co2_1anio_kg;
    if (tab === 1) return r.co2_3anios_kg;
    return r.co2_5anios_kg;
  });

  certificadoEnergetico = computed(() => {
    const r = this.recs();
    if (!r || !r.certificado_energetico_actual) return null;
    const consumoActual = r.consumo_primario_no_renovable_actual_kwh_m2 ?? 0;
    const consumoPost = r.consumo_primario_no_renovable_post_kwh_m2 ?? 0;
    const co2Actual = r.emisiones_co2_actual_kg_m2 ?? 0;
    const co2Post = r.emisiones_co2_post_kg_m2 ?? 0;
    return {
      letraActual: r.certificado_energetico_actual,
      letraPost: r.certificado_energetico_post ?? r.certificado_energetico_actual,
      consumoActual,
      consumoPost,
      consumoReduccion: consumoActual > 0 ? ((consumoActual - consumoPost) / consumoActual) * 100 : 0,
      co2Actual,
      co2Post,
      co2Reduccion: co2Actual > 0 ? ((co2Actual - co2Post) / co2Actual) * 100 : 0,
    };
  });

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

    this.comunidadService.getComunidadById(id).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (data && typeof data === 'object') {
          this.comunidad.set(data as Record<string, unknown>);
        }
      },
      error: () => { /* non-blocking */ }
    });

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

  onSavingsTabChange(index: number): void {
    this.activeSavingsTab.set(index);
  }

  getCertLetraColor(letra: string): string {
    const map: Record<string, string> = {
      'A': '#00a651', 'B': '#4cb848', 'C': '#bdd62e', 'D': '#fff200',
      'E': '#f5a623', 'F': '#ef6a1e', 'G': '#e1251b',
    };
    return map[letra?.toUpperCase()] ?? '#94a3b8';
  }

  goBack(): void { this.router.navigateByUrl('/mis-comunidades'); }
  goDashboard(): void { this.router.navigateByUrl('/dashboard-gestoria'); }
}
