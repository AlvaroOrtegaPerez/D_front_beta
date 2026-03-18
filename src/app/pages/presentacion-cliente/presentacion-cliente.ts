import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ComunidadService } from '../../core/services/comunidad.service';
import { RecomendacionesService } from '../../core/services/recomendaciones.service';
import { SubvencionesService } from '../../core/services/subvenciones.service';
import { Comunidad, normalizeId } from '../../models/comunidad.model';
import { RecomendacionAPI, SubvencionAPI, isRecomendacionAPI, isSubvencionAPI } from '../../models/recomendacion.model';
import { EcoButtonComponent } from '../../shared/components/eco-button/eco-button';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import { FormatEurPipe } from '../../shared/pipes/format-eur.pipe';
import { FormatPctPipe } from '../../shared/pipes/format-pct.pipe';

@Component({
  selector: 'app-presentacion-cliente',
  standalone: true,
  imports: [EcoButtonComponent, LoadingSpinnerComponent, FormatEurPipe, FormatPctPipe, DecimalPipe],
  templateUrl: './presentacion-cliente.html',
  styleUrl: './presentacion-cliente.css',
})
export class PresentacionClientePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comunidadService = inject(ComunidadService);
  private recsService = inject(RecomendacionesService);
  private subvsService = inject(SubvencionesService);

  loading = signal(true);
  comunidad = signal<Comunidad | null>(null);
  recs = signal<RecomendacionAPI | null>(null);
  subvs = signal<SubvencionAPI | null>(null);
  currentSlide = signal(0);
  totalSlides = 5;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.queryParamMap.get('comunidades_id'));
    if (!id) { this.loading.set(false); return; }
    this.comunidadService.getComunidades().subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : [];
        const com = list.find(c => normalizeId(c) === id);
        if (com) this.comunidad.set(com);
        forkJoin([
          this.recsService.getRecomendaciones(id).pipe(catchError(() => of(null))),
          this.subvsService.getSubvenciones(id).pipe(catchError(() => of(null))),
        ]).subscribe(([recsRes, subvsRes]) => {
          const recData = this.extractFirst(recsRes);
          if (isRecomendacionAPI(recData)) this.recs.set(recData);
          const subvData = this.extractFirst(subvsRes);
          if (isSubvencionAPI(subvData)) this.subvs.set(subvData);
          this.loading.set(false);
        });
      },
      error: () => { this.loading.set(false); }
    });
  }

  prev(): void { this.currentSlide.update(s => Math.max(0, s - 1)); }
  next(): void { this.currentSlide.update(s => Math.min(this.totalSlides - 1, s + 1)); }

  goToDashboard(): void { this.router.navigateByUrl('/dashboard-gestoria'); }

  printPresentation(): void { window.print(); }

  private extractFirst(res: unknown): unknown {
    if (!res) return res;
    if (typeof res === 'object') {
      const obj = res as Record<string, unknown>;
      if (Array.isArray(obj['data'])) return (obj['data'] as unknown[])[0] ?? res;
      if (Array.isArray(obj['items'])) return (obj['items'] as unknown[])[0] ?? res;
      if (Array.isArray(res)) return (res as unknown[])[0] ?? res;
    }
    return res;
  }
}
