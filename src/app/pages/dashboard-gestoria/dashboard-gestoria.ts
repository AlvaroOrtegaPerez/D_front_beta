import { Component, inject, signal, computed, OnInit, OnDestroy, afterNextRender } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { forkJoin, of, Subject, takeUntil } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ComunidadService } from '../../core/services/comunidad.service';
import { RecomendacionesService } from '../../core/services/recomendaciones.service';
import { SubvencionesService } from '../../core/services/subvenciones.service';
import { GestoriasService } from '../../core/services/gestorias.service';
import { InformesService } from '../../core/services/informes.service';
import { ToastService } from '../../core/services/toast.service';
import { Comunidad, normalizeId } from '../../models/comunidad.model';
import { ExpedienteRow, Documento, Informe, DashboardMetrics } from '../../models/dashboard.model';
import { RecomendacionAPI, SubvencionAPI, isRecomendacionAPI, isSubvencionAPI, getResumenRecomendacionText } from '../../models/recomendacion.model';
import {
  estadoFromBackend, estadoToBackend, GestionEstado, GESTION_ESTADOS, PROGRAMAS_EXPEDIENTE,
  ESTADO_COLOR_MAP, ESTADO_PROGRESS_MAP, DOCS_REQUIRED,
} from '../../constants/gestion';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card';
import { EcoButtonComponent } from '../../shared/components/eco-button/eco-button';
import { TabBarComponent } from '../../shared/components/tab-bar/tab-bar';
import { BadgeComponent } from '../../shared/components/badge/badge';
import { ModalComponent } from '../../shared/components/modal/modal';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import { StepperComponent } from '../../shared/components/stepper/stepper';
import { FormatEurPipe } from '../../shared/pipes/format-eur.pipe';
import { FormatPctPipe } from '../../shared/pipes/format-pct.pipe';
import { SafeDatePipe } from '../../shared/pipes/safe-date.pipe';
import { FormsModule } from '@angular/forms';
import { Chart, BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

@Component({
  selector: 'app-dashboard-gestoria',
  standalone: true,
  imports: [
    GlassCardComponent, MetricCardComponent, EcoButtonComponent, TabBarComponent,
    BadgeComponent, ModalComponent, LoadingSpinnerComponent, StepperComponent,
    FormatEurPipe, FormatPctPipe, SafeDatePipe, FormsModule, DecimalPipe,
  ],
  templateUrl: './dashboard-gestoria.html',
  styleUrl: './dashboard-gestoria.css'
})
export class DashboardGestoriaPage implements OnInit, OnDestroy {
  router = inject(Router);
  private comunidadService = inject(ComunidadService);
  private recsService = inject(RecomendacionesService);
  private subvsService = inject(SubvencionesService);
  private gestoriasService = inject(GestoriasService);
  private informesService = inject(InformesService);
  private toast = inject(ToastService);
  private destroy$ = new Subject<void>();

  tabs = ['Resumen', 'Recomendaciones', 'Subvenciones', 'Gestión', 'Métricas'];
  activeTab = signal(0);

  comunidades = signal<Comunidad[]>([]);
  selectedId = signal<number | null>(null);
  loadingComunidades = signal(true);

  // Recs & Subvs (selected community)
  recs = signal<RecomendacionAPI | null>(null);
  subvs = signal<SubvencionAPI | null>(null);
  loadingRecs = signal(false);
  loadingSubvs = signal(false);
  resumenText = signal('');

  // Global metrics cache (all communities)
  allRecsMap = signal<Map<number, RecomendacionAPI>>(new Map());
  allSubvsMap = signal<Map<number, SubvencionAPI>>(new Map());
  loadingAllMetrics = signal(false);

  // Expedientes
  expedientes = signal<ExpedienteRow[]>([]);
  loadingGestion = signal(false);
  creatingExpediente = signal(false);
  formPrograma = '';
  formFechaLimite = '';
  formObservaciones = '';

  // Smart status dropdown (Phase 2)
  statusDropdownOpen = signal<number | null>(null);

  // Documentos
  docs = signal<Documento[]>([]);
  docsOpen = signal(false);
  docsLoading = signal(false);
  docsExpedienteId = signal<number | null>(null);
  docsExpedientePrograma = signal<string>('');
  uploadFile: File | null = null;
  uploadTipo = 'Otros';
  uploadSubmitting = signal(false);
  dragOver = signal(false);

  // Informes
  informes = signal<Informe[]>([]);
  loadingInformes = signal(false);
  loadingCert = signal(false);

  // Certificate wizard (Phase 3)
  certWizardStep = signal(0);
  certWizardType = signal('Certificado energético');
  certTypes = ['Certificado energético', 'Informe de recomendaciones', 'Resumen ejecutivo'];

  // Metrics
  metrics = signal<DashboardMetrics>({ totalComunidades: 0, ahorroTotalEur: 0, co2TotalKg: 0, subvencionMediaPct: 0 });

  gestionEstados = GESTION_ESTADOS;
  programas = PROGRAMAS_EXPEDIENTE;

  // Charts (Phase 3)
  private comparativaChart: Chart | null = null;
  private beforeAfterChart: Chart | null = null;

  // --- Computed signals ---

  globalMetrics = computed<DashboardMetrics>(() => {
    const recsMap = this.allRecsMap();
    const subvsMap = this.allSubvsMap();
    const list = this.comunidades();
    let ahorroTotal = 0;
    let co2Total = 0;
    let subvSum = 0;
    let subvCount = 0;
    for (const c of list) {
      const id = normalizeId(c)!;
      const r = recsMap.get(id);
      const s = subvsMap.get(id);
      if (r) { ahorroTotal += r.ahorro_5anios_eur; co2Total += r.co2_5anios_kg; }
      if (s) { subvSum += s.probabilidad_total_subvencion_pct; subvCount++; }
    }
    return {
      totalComunidades: list.length,
      ahorroTotalEur: ahorroTotal,
      co2TotalKg: co2Total,
      subvencionMediaPct: subvCount > 0 ? subvSum / subvCount : 0,
    };
  });

  selectedComunidadObj = computed<Comunidad | null>(() => {
    const id = this.selectedId();
    return this.comunidades().find(c => normalizeId(c) === id) ?? null;
  });

  viabilidad = computed<'Alta' | 'Media' | 'Baja'>(() => {
    const id = this.selectedId();
    if (!id) return 'Baja';
    const hasRecs = this.allRecsMap().has(id);
    const hasSubvs = this.allSubvsMap().has(id);
    if (hasRecs && hasSubvs) return 'Alta';
    if (hasRecs) return 'Media';
    return 'Baja';
  });

  viabilidadVariant = computed(() => {
    const v = this.viabilidad();
    return v === 'Alta' ? 'success' : v === 'Media' ? 'warning' : 'error';
  });

  subvEstimadaEur = computed(() => {
    const id = this.selectedId();
    if (!id) return 0;
    const r = this.allRecsMap().get(id) ?? this.recs();
    const s = this.allSubvsMap().get(id) ?? this.subvs();
    if (!r || !s) return 0;
    return r.ahorro_5anios_eur * s.probabilidad_total_subvencion_pct / 100;
  });

  score = computed(() => {
    const id = this.selectedId();
    if (!id) return 0;
    let pts = 0;
    const r = this.allRecsMap().get(id) ?? this.recs();
    const s = this.allSubvsMap().get(id) ?? this.subvs();
    const exps = this.expedientes();
    if (r) pts += 25;
    if (s && s.probabilidad_total_subvencion_pct > 50) pts += 25;
    const advancedStates: GestionEstado[] = ['Presentada', 'Aprobada', 'Justificación'];
    if (exps.some(e => e.estado && advancedStates.includes(e.estado))) pts += 25;
    if (r && r.roi_payback_anios != null && r.roi_payback_anios < 8) pts += 25;
    return pts;
  });

  scoreColor = computed(() => {
    const s = this.score();
    return s > 70 ? '#10b981' : s > 40 ? '#f59e0b' : '#ef4444';
  });

  scoreLabel = computed(() => {
    const s = this.score();
    return s > 70 ? 'Excelente' : s > 40 ? 'Mejorable' : 'Bajo';
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

  getCertLetraColor(letra: string): string {
    const map: Record<string, string> = {
      'A': '#00a651', 'B': '#4cb848', 'C': '#bdd62e', 'D': '#fff200',
      'E': '#f8b334', 'F': '#ee7e2d', 'G': '#e52421',
    };
    return map[letra?.toUpperCase()] ?? '#94a3b8';
  }

  packRecomendado = computed(() => {
    const r = this.recs();
    if (!r) return null;
    const actions: { name: string; ahorroEur: number; ahorroKwh: number }[] = [];
    if (r.instalar_bateria) {
      actions.push({
        name: 'Batería de almacenamiento',
        ahorroEur: r.ahorro_5anios_eur * r.pct_ahorro_bateria / 100,
        ahorroKwh: r.ahorro_5anios_kwh * r.pct_ahorro_bateria / 100,
      });
    }
    if (r.instalar_bomba_calor) {
      actions.push({
        name: 'Bomba de calor',
        ahorroEur: r.ahorro_5anios_eur * r.pct_ahorro_bomba_calor / 100,
        ahorroKwh: r.ahorro_5anios_kwh * r.pct_ahorro_bomba_calor / 100,
      });
    }
    const mixParts: string[] = [];
    if (r.mix_fotovoltaica_pct > 0) mixParts.push(`Fotovoltaica ${r.mix_fotovoltaica_pct}%`);
    if (r.mix_aerotermia_pct > 0) mixParts.push(`Aerotermia ${r.mix_aerotermia_pct}%`);
    if (r.mix_geotermia_pct > 0) mixParts.push(`Geotermia ${r.mix_geotermia_pct}%`);
    if (r.mix_biomasa_pct > 0) mixParts.push(`Biomasa ${r.mix_biomasa_pct}%`);
    if (mixParts.length > 0) {
      actions.push({
        name: 'Mix energético: ' + mixParts.join(', '),
        ahorroEur: r.ahorro_5anios_eur,
        ahorroKwh: r.ahorro_5anios_kwh,
      });
    }
    return { actions, totalEur: r.ahorro_5anios_eur, totalKwh: r.ahorro_5anios_kwh };
  });

  alertas = computed(() => {
    const alerts: { type: 'warning' | 'error' | 'success' | 'info'; text: string }[] = [];
    const exps = this.expedientes();
    const s = this.subvs();
    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    for (const exp of exps) {
      if (exp.fecha_limite) {
        const limit = new Date(exp.fecha_limite);
        const diff = limit.getTime() - now.getTime();
        if (diff > 0 && diff < thirtyDays) {
          alerts.push({
            type: 'warning',
            text: `${exp.programa}: fecha límite en ${Math.ceil(diff / (24 * 60 * 60 * 1000))} días`,
          });
        }
      }
    }
    if (s && s.probabilidad_total_subvencion_pct > 70) {
      alerts.push({ type: 'success', text: `Alta probabilidad de subvención: ${s.probabilidad_total_subvencion_pct}%` });
    }
    return alerts;
  });

  docChecklist = computed(() => {
    const programa = this.docsExpedientePrograma();
    const required = DOCS_REQUIRED[programa] ?? DOCS_REQUIRED['Otro'];
    const existing = this.docs();
    return required.map(name => ({
      name,
      present: existing.some(d =>
        (d.tipo_documento ?? '').toLowerCase().includes(name.toLowerCase()) ||
        (d.nombre_original ?? '').toLowerCase().includes(name.toLowerCase())
      ),
    }));
  });

  docChecklistCount = computed(() => {
    const cl = this.docChecklist();
    return { done: cl.filter(d => d.present).length, total: cl.length };
  });

  constructor() {
    afterNextRender(() => {
      document.addEventListener('click', this.closeStatusDropdown);
    });
  }

  ngOnInit(): void {
    this.loadComunidades();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.comparativaChart?.destroy();
    this.beforeAfterChart?.destroy();
    document.removeEventListener('click', this.closeStatusDropdown);
  }

  private closeStatusDropdown = () => {
    this.statusDropdownOpen.set(null);
  };

  private loadComunidades(): void {
    this.loadingComunidades.set(true);
    this.comunidadService.getComunidades().subscribe({
      next: (data) => {
        const list = (Array.isArray(data) ? data : []).filter(c => !c.archivada);
        this.comunidades.set(list);
        if (list.length > 0) {
          this.selectComunidad(normalizeId(list[0]));
        }
        this.loadingComunidades.set(false);
        this.loadAllMetrics();
      },
      error: () => { this.loadingComunidades.set(false); this.toast.error('Error al cargar comunidades'); }
    });
  }

  loadAllMetrics(): void {
    const list = this.comunidades();
    if (list.length === 0) return;
    this.loadingAllMetrics.set(true);
    const ids = list.map(c => normalizeId(c)!).filter(Boolean);
    const recsObs = ids.map(id =>
      this.recsService.getRecomendaciones(id).pipe(catchError(() => of(null)))
    );
    const subvsObs = ids.map(id =>
      this.subvsService.getSubvenciones(id).pipe(catchError(() => of(null)))
    );
    forkJoin([...recsObs, ...subvsObs]).pipe(takeUntil(this.destroy$)).subscribe(results => {
      const recsMap = new Map<number, RecomendacionAPI>();
      const subvsMap = new Map<number, SubvencionAPI>();
      const half = ids.length;
      for (let i = 0; i < half; i++) {
        const id = ids[i];
        const recData = this.extractData(results[i]);
        if (isRecomendacionAPI(recData)) recsMap.set(id, recData);
        const subvData = this.extractData(results[half + i]);
        if (isSubvencionAPI(subvData)) subvsMap.set(id, subvData);
      }
      this.allRecsMap.set(recsMap);
      this.allSubvsMap.set(subvsMap);
      this.loadingAllMetrics.set(false);
    });
  }

  selectComunidad(id: number | null): void {
    this.selectedId.set(id);
    this.recs.set(null);
    this.subvs.set(null);
    this.expedientes.set([]);
    this.informes.set([]);
    this.onTabChange(this.activeTab());
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
    const id = this.selectedId();
    if (!id) return;
    switch (index) {
      case 0:
        setTimeout(() => this.createComparativaChart(), 100);
        break;
      case 1:
        this.loadRecs(id);
        setTimeout(() => this.createBeforeAfterChart(), 100);
        break;
      case 2:
        this.loadSubvs(id);
        this.loadExpedientesIfNeeded(id);
        break;
      case 3:
        this.loadExpedientes(id);
        break;
      case 4:
        this.loadInformes(id);
        this.loadExpedientesIfNeeded(id);
        break;
    }
  }

  // --- Recomendaciones ---
  loadRecs(id: number): void {
    this.loadingRecs.set(true);
    this.recsService.getRecomendaciones(id).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (isRecomendacionAPI(data)) {
          this.recs.set(data);
          this.resumenText.set(getResumenRecomendacionText(data) ?? '');
        }
        this.loadingRecs.set(false);
        setTimeout(() => this.createBeforeAfterChart(), 100);
      },
      error: () => { this.loadingRecs.set(false); }
    });
  }

  generarRecs(): void {
    const id = this.selectedId();
    if (!id) return;
    this.loadingRecs.set(true);
    this.recsService.generarRecomendaciones(id).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (isRecomendacionAPI(data)) {
          this.recs.set(data);
          this.resumenText.set(getResumenRecomendacionText(data) ?? '');
        }
        this.loadingRecs.set(false);
        this.toast.success('Recomendaciones generadas');
      },
      error: () => { this.loadingRecs.set(false); this.toast.error('Error al generar'); }
    });
  }

  // --- Subvenciones ---
  loadSubvs(id: number): void {
    this.loadingSubvs.set(true);
    this.subvsService.getSubvenciones(id).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (isSubvencionAPI(data)) this.subvs.set(data);
        this.loadingSubvs.set(false);
      },
      error: () => { this.loadingSubvs.set(false); }
    });
  }

  generarSubvs(): void {
    const id = this.selectedId();
    if (!id) return;
    this.loadingSubvs.set(true);
    this.subvsService.generarSubvenciones(id).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (isSubvencionAPI(data)) this.subvs.set(data);
        this.loadingSubvs.set(false);
        this.toast.success('Subvenciones actualizadas');
      },
      error: () => { this.loadingSubvs.set(false); this.toast.error('Error al generar'); }
    });
  }

  // --- Expedientes ---
  loadExpedientes(id: number): void {
    this.loadingGestion.set(true);
    this.gestoriasService.getExpedientesByComunidad(id).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res as Record<string, unknown>)['data'] as unknown[] ?? [];
        this.expedientes.set(list.map((e: unknown) => {
          const row = e as ExpedienteRow;
          row.estado = estadoFromBackend(row.estado as unknown as string);
          return row;
        }));
        this.loadingGestion.set(false);
      },
      error: () => { this.loadingGestion.set(false); }
    });
  }

  private loadExpedientesIfNeeded(id: number): void {
    if (this.expedientes().length === 0) this.loadExpedientes(id);
  }

  submitExpediente(): void {
    const id = this.selectedId();
    if (!id || !this.formPrograma) return;
    this.creatingExpediente.set(true);
    this.gestoriasService.postExpediente({
      comunidades_id: id,
      programa: this.formPrograma,
      fecha_limite: this.formFechaLimite || null,
      observaciones: this.formObservaciones,
    }).subscribe({
      next: () => {
        this.creatingExpediente.set(false);
        this.formPrograma = '';
        this.formFechaLimite = '';
        this.formObservaciones = '';
        this.loadExpedientes(id);
        this.toast.success('Expediente creado');
      },
      error: () => { this.creatingExpediente.set(false); this.toast.error('Error al crear expediente'); }
    });
  }

  // Smart status (Phase 2)
  toggleStatusDropdown(expId: number, event: Event): void {
    event.stopPropagation();
    this.statusDropdownOpen.set(this.statusDropdownOpen() === expId ? null : expId);
  }

  selectEstado(exp: ExpedienteRow, newEstado: string): void {
    this.statusDropdownOpen.set(null);
    this.onEstadoChange(exp, newEstado);
  }

  onEstadoChange(exp: ExpedienteRow, newEstado: string): void {
    const backend = estadoToBackend(newEstado as GestionEstado);
    this.gestoriasService.patchExpediente(exp.id, { estado: backend }).subscribe({
      next: () => {
        exp.estado = newEstado as GestionEstado;
        this.toast.success('Estado actualizado');
      },
      error: () => this.toast.error('Error al actualizar estado')
    });
  }

  getEstadoColor(estado: string | undefined): 'neutral' | 'warning' | 'info' | 'success' | 'error' {
    return ESTADO_COLOR_MAP[estado as GestionEstado] ?? 'neutral';
  }

  getEstadoProgress(estado: string | undefined): number {
    return ESTADO_PROGRESS_MAP[estado as GestionEstado] ?? 0;
  }

  // --- Documentos ---
  openDocsDialog(exp: ExpedienteRow): void {
    this.docsExpedienteId.set(exp.id);
    this.docsExpedientePrograma.set(exp.programa ?? 'Otro');
    this.docsOpen.set(true);
    this.loadDocs(exp.id);
  }

  loadDocs(expedienteId: number): void {
    this.docsLoading.set(true);
    this.gestoriasService.getDocumentos(expedienteId).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : [];
        this.docs.set(list as Documento[]);
        this.docsLoading.set(false);
      },
      error: () => { this.docsLoading.set(false); }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadFile = input.files?.[0] ?? null;
  }

  // Drag & Drop (Phase 3)
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFile = files[0];
    }
  }

  uploadDoc(): void {
    const expId = this.docsExpedienteId();
    if (!expId || !this.uploadFile) return;
    this.uploadSubmitting.set(true);
    const fd = new FormData();
    fd.append('expedienteId', String(expId));
    fd.append('tipoDocumento', this.uploadTipo);
    fd.append('archivo', this.uploadFile);
    this.gestoriasService.uploadDocumento(fd).subscribe({
      next: () => {
        this.uploadSubmitting.set(false);
        this.uploadFile = null;
        this.uploadTipo = 'Otros';
        this.loadDocs(expId);
        this.toast.success('Documento subido');
      },
      error: () => { this.uploadSubmitting.set(false); this.toast.error('Error al subir documento'); }
    });
  }

  // --- Informes ---
  loadInformes(id: number): void {
    this.loadingInformes.set(true);
    this.informesService.getInformesByComunidad(id).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : [];
        this.informes.set(list as Informe[]);
        this.loadingInformes.set(false);
      },
      error: () => { this.loadingInformes.set(false); }
    });
  }

  // Certificate wizard (Phase 3)
  certWizardNext(): void {
    if (this.certWizardStep() === 0) {
      this.certWizardStep.set(1);
    } else {
      this.generarCertificado();
    }
  }

  certWizardBack(): void {
    this.certWizardStep.set(0);
  }

  generarCertificado(): void {
    const id = this.selectedId();
    if (!id) return;
    this.loadingCert.set(true);
    this.informesService.generarCertificado(id).subscribe({
      next: (res) => {
        this.loadingCert.set(false);
        const url = (res as Record<string, unknown>)['url'] as string;
        if (url) window.open(url, '_blank');
        this.loadInformes(id);
        this.certWizardStep.set(0);
        this.toast.success('Certificado generado');
      },
      error: () => { this.loadingCert.set(false); this.toast.error('Error al generar certificado'); }
    });
  }

  // Preparar solicitud (Phase 2) → go to tab gestión with programa pre-filled
  prepararSolicitud(programa?: string): void {
    if (programa) this.formPrograma = programa;
    this.onTabChange(3);
  }

  selectedComunidad(): Comunidad | null {
    const id = this.selectedId();
    return this.comunidades().find(c => normalizeId(c) === id) ?? null;
  }

  // --- Charts (Phase 3) ---
  createComparativaChart(): void {
    const canvas = document.getElementById('comparativaChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.comparativaChart) this.comparativaChart.destroy();
    const list = this.comunidades();
    const recsMap = this.allRecsMap();
    this.comparativaChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: list.map(c => c.comunidad || 'Sin nombre'),
        datasets: [{
          label: 'Ahorro 5 años (€)',
          data: list.map(c => recsMap.get(normalizeId(c)!)?.ahorro_5anios_eur ?? 0),
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => '€' + v } } },
      },
    });
  }

  createBeforeAfterChart(): void {
    const canvas = document.getElementById('beforeAfterChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.beforeAfterChart) this.beforeAfterChart.destroy();
    const r = this.recs();
    if (!r) return;
    const consumoActual = r.ahorro_5anios_kwh / 0.3;
    const consumoDespues = consumoActual - r.ahorro_5anios_kwh;
    this.beforeAfterChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Consumo actual', 'Tras recomendaciones'],
        datasets: [{
          label: 'kWh (5 años)',
          data: [Math.round(consumoActual), Math.round(consumoDespues > 0 ? consumoDespues : 0)],
          backgroundColor: ['rgba(239, 68, 68, 0.5)', 'rgba(16, 185, 129, 0.6)'],
          borderColor: ['#ef4444', '#10b981'],
          borderWidth: 1,
          borderRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => v + ' kWh' } } },
      },
    });
  }

  // Ahorro per comunidad for resumen table
  getAhorroComunidad(id: number): number {
    return this.allRecsMap().get(id)?.ahorro_5anios_eur ?? 0;
  }

  // Helpers
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

  normalizeId = normalizeId;
}
