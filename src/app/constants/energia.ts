export const FUENTES_ENERGIA_OPTIONS = [
  { label: 'Red eléctrica', value: 'RED_ELECTRICA' },
  { label: 'Autoconsumo',   value: 'AUTOCONSUMO'   },
  { label: 'Mixta',         value: 'MIXTA'          },
  { label: 'No lo sé',      value: 'DESCONOCIDO'    },
] as const;

export const TIPOS_CALEFACCION_CHIPS = [
  { label: 'Gas',                  value: 'RADIADORES_GAS'        },
  { label: 'Gasóleo',              value: 'RADIADORES_GASOIL'      },
  { label: 'Radiadores eléctricos',value: 'RADIADORES_ELECTRICOS' },
  { label: 'Suelo radiante',       value: 'SUELO_RADIANTE'        },
  { label: 'Aerotermia',           value: 'AEROTERMIA'            },
  { label: 'Geotermia',            value: 'GEOTERMIA'             },
  { label: 'Biomasa',              value: 'BIOMASA'               },
  { label: 'Bomba de calor',       value: 'BOMBA_CALOR'           },
  { label: 'Red de calor',         value: 'DISTRICT_HEATING'      },
  { label: 'Mixta',                value: 'MIXTA'                 },
  { label: 'No lo sé',             value: 'DESCONOCIDO'           },
] as const;

export const CONDICIONES_ENTORNO_OPTIONS = [
  { label: 'Río cercano',                    value: 'RIO_CERCANO'          },
  { label: 'Canal cercano',                  value: 'CANAL_CERCANO'        },
  { label: 'Ninguna',                        value: 'NINGUNA'              },
  { label: 'No lo sé',                       value: 'DESCONOCIDO'          },
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

export const ESTADO_AISLAMIENTO_OPTIONS = [
  { value: 'MUY_MALO', label: 'Muy mejorable' },
  { value: 'MALO', label: 'Mejorable' },
  { value: 'MEDIO', label: 'Aceptable' },
  { value: 'BUENO', label: 'Bueno' },
  { value: 'MUY_BUENO', label: 'Muy bueno' },
  { value: 'DESCONOCIDO', label: 'No lo sé' },
];

export const TIPO_VENTANAS_OPTIONS = [
  { value: 'SIMPLE', label: 'Antiguas (una sola hoja)' },
  { value: 'DOBLE', label: 'Doble ventana' },
  { value: 'DOBLE_MODERNO', label: 'Ventanas modernas (aislantes)' },
  { value: 'DESCONOCIDO', label: 'No lo sé' },
];

export const SENSACION_TERMICA_INVIERNO_OPTIONS = [
  { value: 'MUY_FRIO', label: 'Muy frío' },
  { value: 'FRIO', label: 'Algo frío' },
  { value: 'NORMAL', label: 'Confortable' },
  { value: 'CALIDO', label: 'Cálido' },
];

export const CORRIENTES_AIRE_OPTIONS = [
  { value: 'ALTAS', label: 'Muchas' },
  { value: 'MEDIAS', label: 'Algunas' },
  { value: 'BAJAS', label: 'Pocas' },
  { value: 'NO', label: 'Ninguna' },
  { value: 'DESCONOCIDO', label: 'No lo sé' },
];
