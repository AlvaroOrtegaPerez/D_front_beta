export interface RecomendacionAPI {
  id: number;
  comunidades_id?: number;
  recomendacion_final: string;
  mix_fotovoltaica_pct: number;
  mix_aerotermia_pct: number;
  mix_geotermia_pct: number;
  mix_biomasa_pct: number;
  mix_microhidraulica_pct: number;
  instalar_bateria: boolean;
  pct_ahorro_bateria: number;
  instalar_bomba_calor: boolean;
  pct_ahorro_bomba_calor: number;
  ahorro_1anio_kwh: number;
  ahorro_3anios_kwh: number;
  ahorro_5anios_kwh: number;
  ahorro_1anio_eur: number;
  ahorro_3anios_eur: number;
  ahorro_5anios_eur: number;
  co2_1anio_kg: number;
  co2_3anios_kg: number;
  co2_5anios_kg: number;
  roi_payback_anios?: number;
  roi_5anios_pct?: number;
  fecha_creacion?: number;
}

export interface SubvencionAPI {
  eligible_nextgen: boolean;
  eligible_nacional: boolean;
  eligible_regional: boolean;
  eligible_municipal: boolean;
  reduccion_energetica_pct: number;
  probabilidad_total_subvencion_pct: number;
  criterios?: {
    nextgen?: Record<string, boolean>;
    nacional?: Record<string, boolean>;
    regional?: Record<string, boolean>;
    municipal?: Record<string, boolean>;
  };
}

export function isRecomendacionAPI(value: unknown): value is RecomendacionAPI {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o['comunidades_id'] === 'number' &&
    typeof o['recomendacion_final'] === 'string' &&
    typeof o['ahorro_5anios_kwh'] === 'number' &&
    typeof o['ahorro_5anios_eur'] === 'number'
  );
}

export function getResumenRecomendacionText(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const o = value as Record<string, unknown>;
  for (const key of ['recomendacion_final', 'recomendacion', 'resumen', 'text']) {
    const v = o[key];
    if (typeof v === 'string' && v.trim().length > 0) return v;
  }
  return null;
}

export function isSubvencionAPI(value: unknown): value is SubvencionAPI {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o['probabilidad_total_subvencion_pct'] === 'number' &&
    typeof o['reduccion_energetica_pct'] === 'number' &&
    typeof o['eligible_nacional'] === 'boolean' &&
    typeof o['eligible_regional'] === 'boolean'
  );
}
