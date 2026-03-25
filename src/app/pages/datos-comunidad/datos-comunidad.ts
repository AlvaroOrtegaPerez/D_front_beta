import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComunidadService } from '../../core/services/comunidad.service';
import { ToastService } from '../../core/services/toast.service';
import { Comunidad, mapApiToForm, buildPayload } from '../../models/comunidad.model';
import { PROVINCIAS } from '../../constants/provincias';
import { MUNICIPIOS_POR_PROVINCIA } from '../../constants/municipios-por-provincia';
import { FUENTES_ENERGIA_OPTIONS, TIPOS_EDIFICIO, ORIENTACIONES, TIPOS_CALEFACCION, ZONAS_CLIMATICAS, ZONAS_VERANO,
ESTADO_AISLAMIENTO_OPTIONS, TIPO_VENTANAS_OPTIONS, SENSACION_TERMICA_INVIERNO_OPTIONS, CORRIENTES_AIRE_OPTIONS 
} from '../../constants/energia';
import { StepperComponent } from '../../shared/components/stepper/stepper';
import { EcoButtonComponent } from '../../shared/components/eco-button/eco-button';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card';
import { FloatingInputComponent } from '../../shared/components/floating-input/floating-input';
import { FloatingSelectComponent } from '../../shared/components/floating-select/floating-select';
import { FloatingAutocompleteComponent } from '../../shared/components/floating-autocomplete/floating-autocomplete';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import { CodigoPostalService } from '../../core/services/codigo-postal.service';

@Component({
  selector: 'app-datos-comunidad',
  standalone: true,
  imports: [ReactiveFormsModule, StepperComponent, EcoButtonComponent, GlassCardComponent, FloatingInputComponent, FloatingSelectComponent, FloatingAutocompleteComponent, LoadingSpinnerComponent],
  templateUrl: './datos-comunidad.html',
  styleUrl: './datos-comunidad.css'
})
export class DatosComunidadPage implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comunidadService = inject(ComunidadService);
  private toast = inject(ToastService);
  private cpService = inject(CodigoPostalService);

  steps = ['Generales', 'Energéticos', 'Ambientales', 'Económicos'];
  currentStep = signal(0);
  loading = signal(false);
  loadingData = signal(false);
  editId = signal<number | null>(null);

  provincias = PROVINCIAS;
  municipios = signal<readonly string[]>([]);
  sugerenciasCP = signal<string[]>([]);
  tiposEdificio = TIPOS_EDIFICIO;
  orientaciones = ORIENTACIONES;
  tiposCalefaccion = TIPOS_CALEFACCION;
  zonasClimaticas = ZONAS_CLIMATICAS;
  zonasVerano = ZONAS_VERANO;
  fuentesEnergiaOpts = FUENTES_ENERGIA_OPTIONS;
  estadoAislamientoOpts = ESTADO_AISLAMIENTO_OPTIONS;
  tipoVentanasOpts = TIPO_VENTANAS_OPTIONS;
  sensacionTermicaOpts = SENSACION_TERMICA_INVIERNO_OPTIONS;
  corrientesAireOpts = CORRIENTES_AIRE_OPTIONS;
  comunidadesExistentes = signal<Comunidad[]>([]);

  form: FormGroup = this.fb.group({
    nombreComunidad: ['', Validators.required],
    provincia: ['', Validators.required],
    municipio: ['', Validators.required],
    tipoEdificio: ['', Validators.required],
    anioConstruccion: [''],
    numViviendas: ['', [Validators.required, Validators.min(1)]],
    numPlantas: [''],
    consumoElectrico: ['', Validators.required],
    consumoTermico: [''],
    fuentesEnergia: [[] as string[], Validators.required],
    area_techo_m2: ['', Validators.required],
    orientacion: [''],
    tipoCalefaccion: ['', Validators.required],
    estadoAislamiento: ['', Validators.required],
    tipoVentanas: ['', Validators.required],
    sensacionTermicaInvierno: ['', Validators.required],
    corrientesAire: ['', Validators.required],
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
        this.sugerenciasCP.set([]);
      }
    });

    this.form.get('municipio')?.valueChanges.subscribe((muni: string) => {
      const prov: string = this.form.get('provincia')?.value;
      if (prov && muni) {
        this.cpService.getCodigosPostales(prov, muni).subscribe({
          next: (cps) => this.sugerenciasCP.set(cps)
        });
      } else {
        this.sugerenciasCP.set([]);
      }
    });

    this.cargarComunidades();
  }

  private cargarComunidades(): void {
    this.comunidadService.getComunidades().subscribe({
      next: (list) => this.comunidadesExistentes.set(list),
      error: () => console.error('Error cargando comunidades para validación')
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
    const s = this.currentStep();
    const fieldsToValidate = [
      ['nombreComunidad', 'provincia', 'municipio', 'tipoEdificio', 'numViviendas'], // 0: Generales
      ['consumoElectrico', 'fuentesEnergia', 'area_techo_m2', 'tipoCalefaccion', 'estadoAislamiento', 'tipoVentanas', 'sensacionTermicaInvierno', 'corrientesAire'], // 1: Energéticos
      ['codigoPostal'], // 2: Ambientales
      ['facturaEnergetica'] // 3: Económicos
    ][s] || [];

    if (s === 0) {
      const nombre = this.form.get('nombreComunidad')?.value?.trim().toLowerCase();
      const duplicado = this.comunidadesExistentes().find(c => 
        c.comunidad?.trim().toLowerCase() === nombre && c.id !== this.editId()
      );

      if (duplicado) {
        this.toast.error('Error: Ya existe una comunidad con este nombre');
        return;
      }

      const numViviendasCtrl = this.form.get('numViviendas');
      if (numViviendasCtrl?.hasError('min') || (numViviendasCtrl?.value !== '' && Number(numViviendasCtrl?.value) < 1)) {
        this.toast.error('Error: el número de viviendas tiene que ser 1 o mayor que uno');
        return;
      }
    }

    if (s === 1) {
      const fuentesCtrl = this.form.get('fuentesEnergia');
      if (!fuentesCtrl?.value || fuentesCtrl.value.length === 0) {
        this.toast.error('Por favor, selecciona al menos una fuente de energía');
        return;
      }
    }

    let isValid = true;
    for (const field of fieldsToValidate) {
      const control = this.form.get(field);
      control?.markAsTouched();
      if (control?.invalid) {
        isValid = false;
      }
    }

    if (!isValid) {
      this.toast.error('Por favor, completa correctamente los campos obligatorios de este paso');
      return;
    }

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
    const s = this.currentStep();
    
    const nombre = this.form.get('nombreComunidad')?.value?.trim().toLowerCase();
    const duplicado = this.comunidadesExistentes().find(c => 
      c.comunidad?.trim().toLowerCase() === nombre && c.id !== this.editId()
    );

    if (duplicado) {
      this.toast.error('Error: Ya existe una comunidad con este nombre');
      return;
    }

    if (s === 3) {
      const fields = ['facturaEnergetica'];
      for (const field of fields) {
        if (this.form.get(field)?.invalid) {
          this.toast.error('Por favor, completa correctamente los campos obligatorios de este paso');
          return;
        }
      }
    }
    
    if (this.form.invalid) {
      this.toast.error('Por favor, revisa que todos los pasos estén completos y sin errores');
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
