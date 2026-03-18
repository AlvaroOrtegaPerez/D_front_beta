export const GESTION_ESTADOS = [
  'Nuevo',
  'Pendiente',
  'En preparación',
  'En revisión',
  'Presentada',
  'Aprobada',
  'Rechazado',
  'Justificación',
] as const;

export type GestionEstado = (typeof GESTION_ESTADOS)[number];

export const GESTION_ESTADO_BACKEND = [
  'PENDIENTE',
  'EN_PREPARACION',
  'EN_REVISION',
  'ENVIADO',
  'APROBADO',
  'RECHAZADO',
  'COMPLETADO',
] as const;

export type GestionEstadoBackend = (typeof GESTION_ESTADO_BACKEND)[number];

const BACKEND_TO_DISPLAY: Record<GestionEstadoBackend, GestionEstado> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  EN_REVISION: 'En revisión',
  ENVIADO: 'Presentada',
  APROBADO: 'Aprobada',
  RECHAZADO: 'Rechazado',
  COMPLETADO: 'Justificación',
};

const DISPLAY_TO_BACKEND: Record<GestionEstado, GestionEstadoBackend> = {
  'Nuevo': 'PENDIENTE',
  'Pendiente': 'PENDIENTE',
  'En preparación': 'EN_PREPARACION',
  'En revisión': 'EN_REVISION',
  'Presentada': 'ENVIADO',
  'Aprobada': 'APROBADO',
  'Rechazado': 'RECHAZADO',
  'Justificación': 'COMPLETADO',
};

export function estadoFromBackend(value: string | undefined): GestionEstado {
  if (!value) return 'Pendiente';
  const key = value as GestionEstadoBackend;
  return BACKEND_TO_DISPLAY[key] ?? 'Pendiente';
}

export function estadoToBackend(display: GestionEstado): GestionEstadoBackend {
  return DISPLAY_TO_BACKEND[display];
}

export const PROGRAMAS_EXPEDIENTE = [
  'NextGen_Rehabilitacion',
  'Fondos_UE_Autoconsumo',
  'Aerotermia',
  'Comunidad_Energetica',
  'CAE',
  'Otro',
] as const;

export const ESTADO_COLOR_MAP: Record<GestionEstado, 'neutral' | 'warning' | 'info' | 'success' | 'error'> = {
  'Nuevo': 'neutral',
  'Pendiente': 'warning',
  'En preparación': 'info',
  'En revisión': 'info',
  'Presentada': 'info',
  'Aprobada': 'success',
  'Rechazado': 'error',
  'Justificación': 'warning',
};

export const ESTADO_PROGRESS_MAP: Record<GestionEstado, number> = {
  'Nuevo': 0,
  'Pendiente': 15,
  'En preparación': 30,
  'En revisión': 50,
  'Presentada': 65,
  'Aprobada': 85,
  'Rechazado': 0,
  'Justificación': 100,
};

export const DOCS_REQUIRED: Record<string, string[]> = {
  'NextGen_Rehabilitacion': ['Presupuesto', 'Certificado energético', 'Proyecto técnico', 'DNI/CIF', 'Escrituras'],
  'Fondos_UE_Autoconsumo': ['Presupuesto', 'Certificado energético', 'Memoria técnica', 'DNI/CIF'],
  'Aerotermia': ['Presupuesto', 'Certificado energético', 'Proyecto técnico', 'DNI/CIF'],
  'Comunidad_Energetica': ['Presupuesto', 'Estatutos', 'Acta constitución', 'DNI/CIF', 'Memoria técnica'],
  'CAE': ['Presupuesto', 'Certificado energético', 'Auditoría energética', 'DNI/CIF'],
  'Otro': ['Presupuesto', 'Documentación', 'DNI/CIF'],
};
