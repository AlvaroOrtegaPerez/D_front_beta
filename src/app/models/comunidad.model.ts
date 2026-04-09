import { ZONAS_CLIMATICAS, ZONAS_VERANO } from '../constants/energia';

export interface Comunidad {
  id: number;
  comunidades_id?: number;
  comunidad?: string;
  provincia?: string;
  municipio?: string;
  tipo_edificio?: string;
  anio_construccion?: number;
  num_viviendas?: number;
  num_pisos?: number;
  electricidad_kwh?: number;
  termica_kwh?: number;
  fuentes_energia?: string;
  area_techo_m2?: number;
  orientacion?: string;
  tipo_calefaccion?: string;
  bateria?: boolean;
  codigo_postal?: string;
  zona_climatica?: string;
  gasto_mensual_energia?: number;
  presupuesto?: number;
  archivada?: boolean;
  estado_aislamiento?: string;
  tipo_ventanas?: string;
  sensacion_termica_invierno?: string;
  corrientes_aire?: string;
}

export interface FormDataComunidad {
  nombreComunidad: string;
  provincia: string;
  municipio: string;
  tipoEdificio: string;
  anioConstruccion: string;
  numViviendas: string;
  numPlantas: string;
  consumoElectrico: string;
  consumoTermico: string;
  fuentesEnergia: string[];
  area_techo_m2: string;
  orientacion: string;
  tipoCalefaccion: string;
  baterias: boolean;
  codigoPostal: string;
  zonaClimatica: string;
  zonaClimaticaVerano: string;
  facturaEnergetica: string;
  presupuestoInversion: string;
  estadoAislamiento: string;
  tipoVentanas: string;
  sensacionTermicaInvierno: string;
  corrientesAire: string;
  condicionesEntorno: string[];
}

export const INITIAL_FORM_DATA: FormDataComunidad = {
  nombreComunidad: '',
  provincia: '',
  municipio: '',
  tipoEdificio: '',
  anioConstruccion: '',
  numViviendas: '',
  numPlantas: '',
  consumoElectrico: '',
  consumoTermico: '',
  fuentesEnergia: [],
  area_techo_m2: '',
  orientacion: '',
  tipoCalefaccion: '',
  baterias: false,
  codigoPostal: '',
  zonaClimatica: '',
  zonaClimaticaVerano: '',
  facturaEnergetica: '',
  presupuestoInversion: '',
  estadoAislamiento: '',
  tipoVentanas: '',
  sensacionTermicaInvierno: '',
  corrientesAire: '',
  condicionesEntorno: [],
};

export function safeNumberString(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return v;
  return '';
}

export function splitFuentesEnergia(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === 'string')
    return v.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

export function mapApiToForm(api: Record<string, unknown>): FormDataComunidad {
  return {
    nombreComunidad: (api['comunidad'] as string) ?? '',
    provincia: (api['provincia'] as string) ?? '',
    municipio: (api['municipio'] as string) ?? '',
    tipoEdificio: (api['tipo_edificio'] as string) ?? '',
    anioConstruccion: safeNumberString(api['anio_construccion']),
    numViviendas: safeNumberString(api['num_viviendas']),
    numPlantas: safeNumberString(api['num_pisos']),
    consumoElectrico: safeNumberString(api['electricidad_kwh']),
    consumoTermico: safeNumberString(api['termica_kwh']),
    fuentesEnergia: splitFuentesEnergia(api['fuentes_energia']),
    area_techo_m2: safeNumberString(api['area_techo_m2']),
    orientacion: (api['orientacion'] as string) ?? '',
    tipoCalefaccion: (api['tipo_calefaccion'] as string) ?? '',
    baterias: Boolean(api['bateria']),
    codigoPostal: safeNumberString(api['codigo_postal']),
    ...parseZonaClimatica((api['zona_climatica'] as string) ?? ''),
    facturaEnergetica: safeNumberString(api['gasto_mensual_energia']),
    presupuestoInversion: safeNumberString(api['presupuesto']),
    estadoAislamiento: (api['estado_aislamiento'] as string) ?? '',
    tipoVentanas: (api['tipo_ventanas'] as string) ?? '',
    sensacionTermicaInvierno: (api['sensacion_termica_invierno'] as string) ?? '',
    corrientesAire: (api['corrientes_aire'] as string) ?? '',
    condicionesEntorno: splitFuentesEnergia(api['condiciones_entorno']),
  };
}

function parseZonaClimatica(zc: string): { zonaClimatica: string, zonaClimaticaVerano: string } {
  if (!zc) return { zonaClimatica: '', zonaClimaticaVerano: '' };
  const match = zc.match(/^([a-zA-Z\u03B1\u0391]+)(\d+)$/);
  if (match) {
    const letter = match[1];
    const num = match[2];
    const iv = ZONAS_CLIMATICAS.find(opt => opt.startsWith(letter)) || '';
    const ve = ZONAS_VERANO.find(opt => opt.startsWith(num)) || '';
    return { zonaClimatica: iv, zonaClimaticaVerano: ve };
  }
  return { zonaClimatica: zc, zonaClimaticaVerano: '' };
}

function buildZonaClimatica(form: FormDataComunidad): string {
  if (!form.zonaClimatica && !form.zonaClimaticaVerano) return '';
  const letter = form.zonaClimatica ? form.zonaClimatica.split(' ')[0] : '';
  const num = form.zonaClimaticaVerano ? form.zonaClimaticaVerano.split(' ')[0] : '';
  return `${letter}${num}`;
}

export function buildPayload(form: FormDataComunidad): Record<string, unknown> {
  return {
    comunidad: form.nombreComunidad,
    provincia: form.provincia,
    municipio: form.municipio,
    tipo_edificio: form.tipoEdificio,
    anio_construccion: form.anioConstruccion ? Number(form.anioConstruccion) : null,
    num_viviendas: form.numViviendas ? Number(form.numViviendas) : null,
    num_pisos: form.numPlantas ? Number(form.numPlantas) : null,
    electricidad_kwh: form.consumoElectrico ? Number(form.consumoElectrico) : null,
    termica_kwh: form.consumoTermico ? Number(form.consumoTermico) : null,
    fuentesEnergia: form.fuentesEnergia, // Enviamos el array directamente
    area_techo_m2: form.area_techo_m2 ? Number(form.area_techo_m2) : null,
    orientacion: form.orientacion,
    tipo_calefaccion: form.tipoCalefaccion,
    bateria: form.baterias,
    codigo_postal: form.codigoPostal ? Number(form.codigoPostal) : null,
    zona_climatica: buildZonaClimatica(form),
    gasto_mensual_energia: form.facturaEnergetica ? Number(form.facturaEnergetica) : null,
    presupuesto: form.presupuestoInversion ? Number(form.presupuestoInversion) : null,
    estado_aislamiento: form.estadoAislamiento || null,
    tipo_ventanas: form.tipoVentanas || null,
    sensacion_termica_invierno: form.sensacionTermicaInvierno || null,
    corrientes_aire: form.corrientesAire || null,
    condicionesEntorno: form.condicionesEntorno || null, // Enviamos el array directamente
  };
}

export function normalizeId(item: { id?: number; comunidades_id?: number } | null | undefined): number | null {
  const val = item?.comunidades_id ?? item?.id ?? null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}
