export const FUENTES_ENERGIA_OPTIONS: readonly string[] = [
  'Electricidad',
  'Gas natural',
  'Gasóleo',
  'Biomasa',
  'Otros',
] as const;

export const TIPOS_EDIFICIO: readonly string[] = [
  'Unifamiliar',
  'Multifamiliar',
  'Residencial',
  'Mixto',
] as const;

export const ORIENTACIONES: readonly string[] = [
  'Norte',
  'Sur',
  'Este',
  'Oeste',
  'Varias',
] as const;

export const TIPOS_CALEFACCION: readonly string[] = [
  'Caldera gas',
  'Caldera gasóleo',
  'Bomba de calor',
  'Radiadores eléctricos',
  'Otro',
] as const;

export const ZONAS_CLIMATICAS: readonly string[] = [
  'α (Canarias)',
  'A (Cálido)',
  'B (Templado cálido)',
  'C (Templado)',
  'D (Templado frío)',
  'E (Frío)',
] as const;

export const ZONAS_VERANO: readonly string[] = [
  '1 (Ligero)',
  '2 (Medio)',
  '3 (Caluroso)',
  '4 (Muy caluroso)',
] as const;
