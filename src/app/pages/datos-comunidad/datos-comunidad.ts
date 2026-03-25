import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComunidadService } from '../../core/services/comunidad.service';
import { ToastService } from '../../core/services/toast.service';
import { mapApiToForm, buildPayload } from '../../models/comunidad.model';
import { PROVINCIAS } from '../../constants/provincias';
import { MUNICIPIOS_POR_PROVINCIA } from '../../constants/municipios-por-provincia';
import { FUENTES_ENERGIA_OPTIONS, TIPOS_EDIFICIO, ORIENTACIONES, TIPOS_CALEFACCION, ZONAS_CLIMATICAS, ZONAS_VERANO } from '../../constants/energia';
import { StepperComponent } from '../../shared/components/stepper/stepper';
import { EcoButtonComponent } from '../../shared/components/eco-button/eco-button';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card';
import { FloatingInputComponent } from '../../shared/components/floating-input/floating-input';
import { FloatingSelectComponent } from '../../shared/components/floating-select/floating-select';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-datos-comunidad',
  standalone: true,
  imports: [ReactiveFormsModule, StepperComponent, EcoButtonComponent, GlassCardComponent, FloatingInputComponent, FloatingSelectComponent, LoadingSpinnerComponent],
  templateUrl: './datos-comunidad.html',
  styleUrl: './datos-comunidad.css'
})
export class DatosComunidadPage implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comunidadService = inject(ComunidadService);
  private toast = inject(ToastService);

  steps = ['Generales', 'Energéticos', 'Ambientales', 'Económicos'];
  currentStep = signal(0);
  loading = signal(false);
  loadingData = signal(false);
  editId = signal<number | null>(null);

  provincias = PROVINCIAS;
  municipios = signal<readonly string[]>([]);
  tiposEdificio = TIPOS_EDIFICIO;
  orientaciones = ORIENTACIONES;
  tiposCalefaccion = TIPOS_CALEFACCION;
  zonasClimaticas = ZONAS_CLIMATICAS;
  zonasVerano = ZONAS_VERANO;
  fuentesEnergiaOpts = FUENTES_ENERGIA_OPTIONS;

  form: FormGroup = this.fb.group({
    nombreComunidad: ['', Validators.required],
    provincia: ['', Validators.required],
    municipio: ['', Validators.required],
    tipoEdificio: ['', Validators.required],
    anioConstruccion: [''],
    numViviendas: ['', Validators.required],
    numPlantas: [''],
    consumoElectrico: ['', Validators.required],
    consumoTermico: [''],
    fuentesEnergia: [[] as string[], Validators.required],
    area_techo_m2: ['', Validators.required],
    orientacion: [''],
    tipoCalefaccion: ['', Validators.required],
    baterias: [false],
    codigoPostal: ['', Validators.required],
    zonaClimatica: [''],
    zonaClimaticaVerano: [''],
    facturaEnergetica: ['', Validators.required],
    presupuestoInversion: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('comunidades_id');
    if (id) {
      this.editId.set(Number(id));
      this.loadExisting(Number(id));
    }

    this.form.get('provincia')?.valueChanges.subscribe((prov: string) => {
      this.municipios.set(MUNICIPIOS_POR_PROVINCIA[prov] ?? []);
      if (!this.loadingData()) {
        this.form.get('municipio')?.setValue('');
      }
    });
  }

  private loadExisting(id: number): void {
    this.loadingData.set(true);
    this.comunidadService.getComunidadById(id).subscribe({
      next: (api) => {
        const formData = mapApiToForm(api);
        this.form.patchValue(formData);
        this.municipios.set(MUNICIPIOS_POR_PROVINCIA[formData.provincia] ?? []);
        this.loadingData.set(false);
      },
      error: () => { this.loadingData.set(false); this.toast.error('Error al cargar datos'); }
    });
  }

  toggleFuente(fuente: string): void {
    const current: string[] = this.form.get('fuentesEnergia')?.value ?? [];
    if (current.includes(fuente)) {
      this.form.get('fuentesEnergia')?.setValue(current.filter(f => f !== fuente));
    } else {
      this.form.get('fuentesEnergia')?.setValue([...current, fuente]);
    }
  }

  isFuenteSelected(fuente: string): boolean {
    const current: string[] = this.form.get('fuentesEnergia')?.value ?? [];
    return current.includes(fuente);
  }

  next(): void {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(s => s + 1);
    }
  }

  prev(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }
    this.loading.set(true);
    const payload = buildPayload(this.form.getRawValue());
    const editId = this.editId();

    if (editId) {
      this.comunidadService.patchComunidad(editId, payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.success('Comunidad actualizada');
          this.router.navigateByUrl('/mis-comunidades');
        },
        error: () => { this.loading.set(false); this.toast.error('Error al actualizar'); }
      });
    } else {
      this.comunidadService.postComunidad(payload).subscribe({
        next: (res) => {
          this.loading.set(false);
          this.toast.success('Comunidad creada');
          const id = (res as Record<string, unknown>)['comunidades_id'] ?? (res as Record<string, unknown>)['id'];
          if (id) sessionStorage.setItem('comunidades_id', String(id));
          this.router.navigateByUrl('/recomendaciones');
        },
        error: () => { this.loading.set(false); this.toast.error('Error al crear comunidad'); }
      });
    }
  }
}
