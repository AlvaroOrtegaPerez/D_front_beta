import { GestionEstado } from '../constants/gestion';

export interface ExpedienteRow {
  id: number;
  comunidad_id?: number;
  programa?: string;
  estado?: GestionEstado;
  fecha_limite?: string;
  completitud?: number;
  completado?: number;
  observaciones?: string;
  documentos_count?: number;
}

export interface Documento {
  id: number;
  expediente_id: number;
  tipo_documento?: string;
  estado_rev?: string;
  nombre_original?: string;
  created_at?: string;
}

export interface Informe {
  id: number;
  comunidad_id: number;
  tipo?: string;
  url_pdf?: string;
  created_at?: string;
}

export interface ResumenRow {
  id: number;
  nombre: string;
  ubicacion: string;
  ahorro5aniosEur: number;
  inversionEstimada: number;
  roiAnios: number;
  subvencionPct: number;
  tags: string[];
}

export interface DashboardMetrics {
  totalComunidades: number;
  ahorroTotalEur: number;
  co2TotalKg: number;
  subvencionMediaPct: number;
}
