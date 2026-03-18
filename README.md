# Dinamiza ECO 360 — Frontend Angular 21

Plataforma web de gestión energética para comunidades de vecinos. Incluye landing page pública y aplicación web privada (post-login) en un solo proyecto Angular.

---

## Tabla de contenidos

1. [Tech Stack](#tech-stack)
2. [Instalación y arranque](#instalación-y-arranque)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Arquitectura general](#arquitectura-general)
5. [Rutas](#rutas)
6. [Autenticación](#autenticación)
7. [Endpoints del backend (6 bases Xano)](#endpoints-del-backend-6-bases-xano)
8. [Modelos de datos](#modelos-de-datos)
9. [Constantes importantes](#constantes-importantes)
10. [Servicios del frontend](#servicios-del-frontend)
11. [Flujo de datos por página](#flujo-de-datos-por-página)
12. [Componentes compartidos](#componentes-compartidos)
13. [Diseño y estilos](#diseño-y-estilos)
14. [Build y deploy](#build-y-deploy)

---

## Tech Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 21.0.0 | Framework principal (standalone components) |
| TypeScript | 5.9.2 | Lenguaje |
| RxJS | 7.8 | Programación reactiva (HTTP, forkJoin) |
| Chart.js | 4.x | Gráficos de barras en Dashboard 360 |
| CSS puro | — | Estilos (NO Tailwind) |
| Google Fonts (Inter) | — | Tipografía |

---

## Instalación y arranque

```bash
cd dinamiza-app-bueno
npm install
ng serve            # Desarrollo → http://localhost:4200
ng build            # Build producción → dist/dinamiza-app-bueno
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts          # Protege rutas privadas
│   │   │   └── no-auth.guard.ts       # Redirige usuarios logueados
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts    # Inyecta Bearer token + manejo 401
│   │   └── services/
│   │       ├── api.service.ts         # HTTP genérico (GET/POST/PATCH/upload)
│   │       ├── auth.service.ts        # Login, signup, forgot/reset password
│   │       ├── comunidad.service.ts   # CRUD comunidades
│   │       ├── recomendaciones.service.ts  # IA recomendaciones
│   │       ├── subvenciones.service.ts     # Elegibilidad subvenciones
│   │       ├── gestorias.service.ts        # Expedientes + documentos
│   │       ├── informes.service.ts         # Certificados PDF
│   │       ├── token.service.ts            # localStorage token
│   │       └── toast.service.ts            # Notificaciones UI
│   ├── constants/
│   │   ├── provincias.ts              # 50 provincias españolas
│   │   ├── municipios-por-provincia.ts # Municipios por provincia
│   │   ├── energia.ts                 # Opciones energéticas
│   │   └── gestion.ts                 # Estados, programas, docs requeridos
│   ├── models/
│   │   ├── auth.model.ts             # Login/Signup payloads y responses
│   │   ├── comunidad.model.ts        # Comunidad + FormData + helpers
│   │   ├── recomendacion.model.ts    # RecomendacionAPI + SubvencionAPI
│   │   └── dashboard.model.ts        # Expediente, Documento, Informe, Metrics
│   ├── layouts/
│   │   ├── app-shell/                # Layout principal (sidebar + topbar + content)
│   │   ├── sidebar/                  # Menú lateral colapsable
│   │   └── topbar/                   # Barra superior
│   ├── pages/
│   │   ├── landing/                  # Landing page pública (10 secciones)
│   │   ├── login/                    # Login
│   │   ├── register/                 # Registro + RGPD
│   │   ├── verify-email/             # Verificación email
│   │   ├── forgot-password/          # Recuperar contraseña
│   │   ├── reset-password/           # Nueva contraseña
│   │   ├── mis-comunidades/          # Grid de comunidades
│   │   ├── datos-comunidad/          # Wizard 4 pasos
│   │   ├── recomendaciones/          # Resultados IA
│   │   ├── dashboard-gestoria/       # Dashboard 360 (5 tabs)
│   │   └── presentacion-cliente/     # Presentación 5 slides
│   ├── shared/
│   │   ├── components/               # 14 componentes reutilizables
│   │   ├── directives/               # ScrollAnimate
│   │   └── pipes/                    # formatEur, formatPct, safeDate
│   ├── app.routes.ts                 # Configuración de rutas
│   ├── app.config.ts                 # Providers (HttpClient, Router)
│   └── app.ts                        # Componente raíz
├── environments/
│   └── environment.ts                # URLs de las 6 bases Xano
├── styles.css                        # Estilos globales
└── main.ts                           # Bootstrap
```

---

## Arquitectura general

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Angular 21)             │
│                                                     │
│  Pages ──> Services ──> ApiService ──> HttpClient   │
│                              │                      │
│                    authInterceptor                   │
│                    (Bearer token)                    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────┴──────────────────────────────┐
│                    BACKEND (6 bases Xano)            │
│                                                     │
│  1. Auth          4. Subvenciones                   │
│  2. Comunidades   5. Gestorías                      │
│  3. Recommendations  6. Informes                    │
└─────────────────────────────────────────────────────┘
```

**Flujo de autenticación:**
1. Usuario hace login → `POST /auth/login` → recibe `authToken`
2. Token se guarda en `localStorage` (clave: `authToken`)
3. Todas las peticiones HTTP llevan header `Authorization: Bearer {token}`
4. Si el backend responde **401** → se borra el token → redirect a `/login`

---

## Rutas

### Públicas (sin autenticación)

| Ruta | Página | Guard |
|---|---|---|
| `/` | Landing page | — |
| `/login` | Login | `noAuthGuard` (si ya está logueado → `/mis-comunidades`) |
| `/register` | Registro | `noAuthGuard` |
| `/verify-email` | Verificación email (`?token=`) | — |
| `/forgot-password` | Solicitar recuperación | — |
| `/reset-password` | Establecer nueva contraseña (`?token=`) | — |

### Privadas (requieren `authGuard` — dentro de `AppShellComponent`)

| Ruta | Página | Descripción |
|---|---|---|
| `/mis-comunidades` | MisComunidades | Grid de comunidades del usuario |
| `/datos-comunidad` | DatosComunidad | Wizard 4 pasos para crear/editar comunidad (`?comunidades_id=X` para editar) |
| `/recomendaciones` | Recomendaciones | Resultados IA de una comunidad |
| `/dashboard-gestoria` | Dashboard 360 | Panel integral con 5 tabs |
| `/presentacion-cliente` | Presentación | 5 slides para cliente + exportar PDF |

---

## Autenticación

### Token

| Concepto | Detalle |
|---|---|
| Tipo | Bearer token |
| Almacenamiento | `localStorage` → clave `authToken` |
| Header HTTP | `Authorization: Bearer {token}` |
| Expiración | Controlada por el backend (frontend no valida JWT) |
| Logout | Se borra de localStorage + redirect a `/login` |

### Interceptor (`auth.interceptor.ts`)

```
Toda petición HTTP
  ├── ¿Tiene header X-Skip-Auth? → NO añade Bearer (usado en signup, forgot-pwd)
  └── ¿No tiene X-Skip-Auth? → Añade Authorization: Bearer {token}

Toda respuesta HTTP
  ├── Status 401 → clearToken() + navigateByUrl('/login')
  └── Otro error → propaga el error
```

---

## Endpoints del backend (6 bases Xano)

### Base URLs (configuradas en `src/environments/environment.ts`)

```typescript
api: {
  auth:            'https://x8ki-letl-twmt.n7.xano.io/api:3O-33cVF',
  comunidades:     'https://x8ki-letl-twmt.n7.xano.io/api:zamCFJMN',
  recommendations: 'https://x8ki-letl-twmt.n7.xano.io/api:WGfNhi5T',
  subvenciones:    'https://x8ki-letl-twmt.n7.xano.io/api:3rc1fDDJ',
  gestorias:       'https://x8ki-letl-twmt.n7.xano.io/api:cckp9PME',
  informes:        'https://x8ki-letl-twmt.n7.xano.io/api:DrkonBSU',
}
```

---

### 1. AUTH — Autenticación

**Base:** `api.auth`

| Método | Endpoint | Body (JSON) | Respuesta esperada | Notas |
|---|---|---|---|---|
| `POST` | `/auth/login` | `{ email, password }` | `{ authToken: string, user?: { correo_validado?: boolean } }` | El frontend almacena `authToken` |
| `POST` | `/auth/signup` | `{ nombre, email, password, newsletter? }` | `{ }` | Se envía SIN Bearer (usa `X-Skip-Auth`) |
| `POST` | `/auth/forgot-password` | `{ email }` | `{ }` | Sin auth |
| `POST` | `/auth/reset-password` | `{ token, password }` | `{ }` | `token` viene del query param `?token=` |
| `POST` | `/auth/verify-email` | `{ verify_token }` | `{ }` | `verify_token` viene de `?token=` |
| `POST` | `/auth/request-email-verification` | `{ email, nombre? }` | `{ }` | Re-envío de email de verificación |

**Importante:** Las peticiones de signup, forgot-password, reset-password y verify-email se envían **sin Bearer token** (header `X-Skip-Auth` que el interceptor detecta y no inyecta token).

---

### 2. COMUNIDADES — CRUD de comunidades

**Base:** `api.comunidades`

| Método | Endpoint | Body / Params | Respuesta esperada |
|---|---|---|---|
| `GET` | `/comunidades` | — | `Comunidad[]` (array de comunidades del usuario autenticado) |
| `GET` | `/comunidades/{id}` | — | `Comunidad` (una comunidad) |
| `POST` | `/comunidades` | Ver tabla abajo | `Comunidad` (comunidad creada) |
| `PATCH` | `/comunidades/{id}` | Campos parciales | `Comunidad` (comunidad actualizada) |
| `PATCH` | `/comunidades/{id}/archivar` | `{ comunidades_id: number }` | `{ }` |

**Campos del body para POST/PATCH:**

```json
{
  "comunidad": "Nombre de la comunidad",
  "provincia": "Madrid",
  "municipio": "Alcobendas",
  "tipo_edificio": "Bloque de viviendas",
  "anio_construccion": 1985,
  "num_viviendas": 24,
  "num_pisos": 6,
  "electricidad_kwh": 45000,
  "termica_kwh": 30000,
  "fuentes_energia": "Gas natural, Electricidad",
  "area_techo_m2": 500,
  "orientacion": "Sur",
  "tipo_calefaccion": "Gas natural",
  "bateria": false,
  "codigo_postal": 28100,
  "zona_climatica": "D3",
  "gasto_mensual_energia": 1200,
  "presupuesto": 150000,
  "archivada": false
}
```

**Nota:** El frontend filtra comunidades donde `archivada !== true` antes de mostrarlas.

**Nota sobre IDs:** El frontend normaliza IDs porque algunas respuestas usan `id` y otras `comunidades_id`. La función `normalizeId(comunidad)` devuelve `comunidad.id ?? comunidad.comunidades_id`.

---

### 3. RECOMMENDATIONS — Motor de recomendaciones IA

**Base:** `api.recommendations`

| Método | Endpoint | Body | Respuesta esperada |
|---|---|---|---|
| `GET` | `/recomendaciones/{comunidadId}` | — | `RecomendacionAPI` o wrapper `{ data: [RecomendacionAPI] }` |
| `POST` | `/generar` | `{ comunidades_id: number }` | `RecomendacionAPI` o wrapper |

**Campos esperados en la respuesta (`RecomendacionAPI`):**

```json
{
  "id": 1,
  "comunidades_id": 123,
  "recomendacion_final": "Texto resumen de la IA...",

  "mix_fotovoltaica_pct": 60,
  "mix_aerotermia_pct": 25,
  "mix_geotermia_pct": 0,
  "mix_biomasa_pct": 15,
  "mix_microhidraulica_pct": 0,

  "instalar_bateria": true,
  "pct_ahorro_bateria": 12,
  "instalar_bomba_calor": true,
  "pct_ahorro_bomba_calor": 18,

  "ahorro_1anio_kwh": 8500,
  "ahorro_3anios_kwh": 25500,
  "ahorro_5anios_kwh": 42500,
  "ahorro_1anio_eur": 1700,
  "ahorro_3anios_eur": 5100,
  "ahorro_5anios_eur": 8500,

  "co2_1anio_kg": 3200,
  "co2_3anios_kg": 9600,
  "co2_5anios_kg": 16000,

  "roi_payback_anios": 6.5,
  "roi_5anios_pct": 42,

  "fecha_creacion": 1710720000
}
```

**Nota sobre wrapping:** El backend puede devolver directamente el objeto o envolverlo en `{ data: [...] }` o `{ items: [...] }`. El frontend extrae el primer elemento automáticamente con `extractData()`.

---

### 4. SUBVENCIONES — Elegibilidad de subvenciones

**Base:** `api.subvenciones`

| Método | Endpoint | Body | Respuesta esperada |
|---|---|---|---|
| `GET` | `/subvenciones/{comunidadId}` | — | `SubvencionAPI` o wrapper |
| `POST` | `/subvenciones` | `{ comunidades_id: number }` | `SubvencionAPI` o wrapper |

**Campos esperados en la respuesta (`SubvencionAPI`):**

```json
{
  "eligible_nextgen": true,
  "eligible_nacional": true,
  "eligible_regional": false,
  "eligible_municipal": true,

  "reduccion_energetica_pct": 45,
  "probabilidad_total_subvencion_pct": 72,

  "criterios": {
    "nextgen": {
      "Certificación energética": true,
      "Reducción > 30%": true,
      "Presupuesto aprobado": false
    },
    "nacional": {
      "Autoconsumo colectivo": true,
      "Almacenamiento": true
    },
    "regional": {},
    "municipal": {
      "Zona prioritaria": true
    }
  }
}
```

**Cálculos del frontend con estos datos:**
- `Subvención estimada €` = `ahorro_5anios_eur × probabilidad_total_subvencion_pct / 100`
- Desglose por nivel: NextGen ~40%, Nacional ~30%, Regional ~20%, Municipal ~10% del total estimado

---

### 5. GESTORÍAS — Expedientes y documentos

**Base:** `api.gestorias`

#### Expedientes

| Método | Endpoint | Body | Respuesta esperada |
|---|---|---|---|
| `GET` | `/expedientes/{comunidadId}` | — | `ExpedienteRow[]` |
| `POST` | `/expedientes` | Ver abajo | `ExpedienteRow` |
| `PATCH` | `/expedientes/{expedienteId}` | Campos parciales | `ExpedienteRow` |

**Body para crear expediente:**

```json
{
  "comunidades_id": 123,
  "programa": "NextGen_Rehabilitacion",
  "fecha_limite": "2026-06-30",
  "observaciones": "Texto libre"
}
```

**Body para actualizar estado:**

```json
{
  "estado": "EN_PREPARACION"
}
```

**Mapeo de estados frontend ↔ backend:**

| Frontend (UI) | Backend (DB) |
|---|---|
| `Nuevo` | (sin valor / null) |
| `Pendiente` | `PENDIENTE` |
| `En preparación` | `EN_PREPARACION` |
| `En revisión` | `EN_REVISION` |
| `Presentada` | `ENVIADO` |
| `Aprobada` | `APROBADO` |
| `Rechazado` | `RECHAZADO` |
| `Justificación` | `COMPLETADO` |

**Programas válidos:**
- `NextGen_Rehabilitacion`
- `Fondos_UE_Autoconsumo`
- `Aerotermia`
- `Comunidad_Energetica`
- `CAE`
- `Otro`

#### Documentos

| Método | Endpoint | Body | Respuesta esperada |
|---|---|---|---|
| `GET` | `/documentos?expediente_id={id}` | — | `Documento[]` |
| `POST` | `/documentos` | `FormData` (multipart) | `Documento` |
| `PATCH` | `/documentos/{documentoId}` | Campos parciales | `Documento` |

**FormData para subir documento:**

```
expediente_id: 456       (string del ID numérico)
tipo_documento: "Presupuesto"
archivo: (File binario)
```

**Tipos de documento que el frontend acepta:**
- Presupuesto
- Certificado
- Certificado energético
- Proyecto técnico
- Memoria técnica
- DNI/CIF
- Escrituras
- Estatutos
- Documentación
- Otros

**Campos esperados en la respuesta (`Documento`):**

```json
{
  "id": 789,
  "expediente_id": 456,
  "tipo_documento": "Presupuesto",
  "estado_rev": "Pendiente",
  "nombre_original": "presupuesto_2026.pdf",
  "created_at": "2026-03-15T10:30:00Z"
}
```

---

### 6. INFORMES — Certificados y reportes PDF

**Base:** `api.informes`

| Método | Endpoint | Body | Respuesta esperada |
|---|---|---|---|
| `POST` | `/certificado/generar` | `{ comunidad_id: number }` | `{ url: "https://..." }` |
| `GET` | `/informes/{comunidadId}` | — | `Informe[]` |

**Campos esperados en la respuesta (`Informe`):**

```json
{
  "id": 101,
  "comunidad_id": 123,
  "tipo": "Certificado energético",
  "url": "https://storage.xano.io/.../certificado.pdf",
  "created_at": "2026-03-15T10:30:00Z"
}
```

**Nota:** El frontend abre `url` en nueva pestaña con `window.open(url, '_blank')`.

---

## Modelos de datos

### Comunidad

```typescript
interface Comunidad {
  id: number;
  comunidades_id?: number;      // Algunos endpoints usan este campo como ID
  comunidad?: string;            // Nombre de la comunidad
  provincia?: string;
  municipio?: string;
  tipo_edificio?: string;
  anio_construccion?: number;
  num_viviendas?: number;
  num_pisos?: number;
  electricidad_kwh?: number;
  termica_kwh?: number;
  fuentes_energia?: string;      // Comma-separated: "Gas natural, Electricidad"
  area_techo_m2?: number;
  orientacion?: string;
  tipo_calefaccion?: string;
  bateria?: boolean;
  codigo_postal?: number;
  zona_climatica?: string;
  gasto_mensual_energia?: number; // EUR/mes
  presupuesto?: number;           // EUR inversión
  archivada?: boolean;
}
```

### RecomendacionAPI

```typescript
interface RecomendacionAPI {
  id: number;
  comunidades_id?: number;
  recomendacion_final: string;       // Texto libre de la IA
  // Mix energético (porcentajes, suman ~100%)
  mix_fotovoltaica_pct: number;
  mix_aerotermia_pct: number;
  mix_geotermia_pct: number;
  mix_biomasa_pct: number;
  mix_microhidraulica_pct: number;
  // Acciones específicas
  instalar_bateria: boolean;
  pct_ahorro_bateria: number;        // % del ahorro total
  instalar_bomba_calor: boolean;
  pct_ahorro_bomba_calor: number;    // % del ahorro total
  // Ahorros proyectados
  ahorro_1anio_kwh: number;
  ahorro_3anios_kwh: number;
  ahorro_5anios_kwh: number;
  ahorro_1anio_eur: number;
  ahorro_3anios_eur: number;
  ahorro_5anios_eur: number;
  // CO2 evitado
  co2_1anio_kg: number;
  co2_3anios_kg: number;
  co2_5anios_kg: number;
  // ROI
  roi_payback_anios?: number;        // Años para recuperar inversión
  roi_5anios_pct?: number;           // % retorno a 5 años
  fecha_creacion?: number;           // Unix timestamp
}
```

### SubvencionAPI

```typescript
interface SubvencionAPI {
  eligible_nextgen: boolean;
  eligible_nacional: boolean;
  eligible_regional: boolean;
  eligible_municipal: boolean;
  reduccion_energetica_pct: number;
  probabilidad_total_subvencion_pct: number;
  criterios?: {
    nextgen?: Record<string, boolean>;     // Criterio → cumple/no
    nacional?: Record<string, boolean>;
    regional?: Record<string, boolean>;
    municipal?: Record<string, boolean>;
  };
}
```

### ExpedienteRow

```typescript
interface ExpedienteRow {
  id: number;
  comunidad_id?: number;
  programa?: string;           // Uno de PROGRAMAS_EXPEDIENTE
  estado?: GestionEstado;      // Estado en formato frontend
  fecha_limite?: string;       // ISO date string
  completitud?: number;
  completado?: number;
  observaciones?: string;
  documentos_count?: number;
}
```

### Documento

```typescript
interface Documento {
  id: number;
  expediente_id: number;
  tipo_documento?: string;
  estado_rev?: string;          // "Pendiente", "Aprobado", "Rechazado"
  nombre_original?: string;     // Nombre del archivo subido
  created_at?: string;          // ISO datetime
}
```

### Informe

```typescript
interface Informe {
  id: number;
  comunidad_id: number;
  tipo?: string;                // "Certificado energético", etc.
  url?: string;                 // URL al PDF generado
  created_at?: string;          // ISO datetime
}
```

### DashboardMetrics (calculado en frontend)

```typescript
interface DashboardMetrics {
  totalComunidades: number;
  ahorroTotalEur: number;        // Suma de ahorro_5anios_eur de todas las comunidades
  co2TotalKg: number;            // Suma de co2_5anios_kg
  subvencionMediaPct: number;    // Media de probabilidad_total_subvencion_pct
}
```

---

## Constantes importantes

### Estados de gestión y mapeo backend

```typescript
// Estados que el usuario ve en el frontend
type GestionEstado =
  | 'Nuevo' | 'Pendiente' | 'En preparación' | 'En revisión'
  | 'Presentada' | 'Aprobada' | 'Rechazado' | 'Justificación';

// Estados que el backend almacena
type GestionEstadoBackend =
  | 'PENDIENTE' | 'EN_PREPARACION' | 'EN_REVISION'
  | 'ENVIADO' | 'APROBADO' | 'RECHAZADO' | 'COMPLETADO';
```

### Programas de expediente

```typescript
const PROGRAMAS_EXPEDIENTE = [
  'NextGen_Rehabilitacion',
  'Fondos_UE_Autoconsumo',
  'Aerotermia',
  'Comunidad_Energetica',
  'CAE',
  'Otro',
];
```

### Documentos requeridos por programa

| Programa | Documentos necesarios |
|---|---|
| NextGen_Rehabilitacion | Presupuesto, Certificado energético, Proyecto técnico, DNI/CIF, Escrituras |
| Fondos_UE_Autoconsumo | Presupuesto, Certificado energético, Memoria técnica, DNI/CIF |
| Aerotermia | Presupuesto, Certificado energético, Proyecto técnico, DNI/CIF |
| Comunidad_Energetica | Presupuesto, Estatutos, Acta constitución, DNI/CIF, Memoria técnica |
| CAE | Presupuesto, Certificado energético, Auditoría energética, DNI/CIF |
| Otro | Presupuesto, Documentación, DNI/CIF |

---

## Servicios del frontend

### ApiService (genérico)

Todas las llamadas HTTP pasan por `ApiService`. Recibe un `baseKey` que mapea a la URL base correspondiente.

```typescript
// Ejemplo de uso interno
this.apiService.get<Comunidad[]>('comunidades', '/comunidades');
this.apiService.post('auth', '/auth/login', { email, password });
this.apiService.patch('gestorias', `/expedientes/${id}`, { estado: 'APROBADO' });
this.apiService.upload('gestorias', '/documentos', formData);

// Para peticiones sin autenticación
this.apiService.postNoAuth('auth', '/auth/signup', payload);
```

### Servicios específicos

| Servicio | Base Xano | Responsabilidad |
|---|---|---|
| `AuthService` | auth | Login, signup, forgot/reset password, verify email |
| `ComunidadService` | comunidades | CRUD comunidades |
| `RecomendacionesService` | recommendations | Obtener/generar recomendaciones IA |
| `SubvencionesService` | subvenciones | Obtener/generar elegibilidad |
| `GestoriasService` | gestorias | Expedientes + documentos |
| `InformesService` | informes | Certificados PDF + historial |
| `TokenService` | — | localStorage token management |
| `ToastService` | — | Notificaciones UI |

---

## Flujo de datos por página

### Login

```
1. Usuario rellena email + password
2. POST /auth/login → { authToken }
3. TokenService.setToken(authToken)
4. Si correo_validado === false → redirect /verify-email
5. Si correo_validado === true → redirect /mis-comunidades
```

### Register

```
1. Usuario rellena nombre, email, password + acepta RGPD
2. POST /auth/signup (sin Bearer) → OK
3. Redirect a /login con mensaje de verificación
```

### MisComunidades

```
1. GET /comunidades → Comunidad[]
2. Filtrar donde archivada !== true
3. Mostrar grid de cards
4. Click "Editar" → /datos-comunidad?comunidades_id=X
5. Click "Archivar" → PATCH /comunidades/{id}/archivar
```

### DatosComunidad (Wizard)

```
Paso 1: Datos generales (nombre, provincia, municipio, tipo, año, viviendas)
Paso 2: Datos energéticos (consumo kWh, fuentes, techo, orientación, calefacción)
Paso 3: Datos ambientales (código postal, zona climática)
Paso 4: Datos económicos (gasto mensual, presupuesto)

Si ?comunidades_id=X → GET /comunidades/{X} → pre-popular formulario → PATCH al guardar
Si no → POST /comunidades al guardar → redirect /mis-comunidades
```

### Dashboard 360 (5 tabs)

```
Al cargar:
  1. GET /comunidades → lista
  2. Para CADA comunidad en paralelo (forkJoin):
     - GET /recomendaciones/{id}
     - GET /subvenciones/{id}
  3. Cache en allRecsMap y allSubvsMap

Tab 0 - Resumen:
  - 4 KPIs calculados del cache global
  - Chart.js bar chart (ahorro por comunidad)
  - Tabla con todas las comunidades

Tab 1 - Recomendaciones:
  - GET /recomendaciones/{selectedId}
  - Pack recomendado (calculado)
  - Chart.js before/after

Tab 2 - Subvenciones:
  - GET /subvenciones/{selectedId}
  - GET /expedientes/{selectedId} (para alertas)
  - Alertas inteligentes (fecha límite, probabilidad)

Tab 3 - Gestión:
  - GET /expedientes/{selectedId}
  - PATCH /expedientes/{id} → actualizar estado
  - POST /expedientes → crear nuevo
  - Modal docs:
    - GET /documentos?expediente_id={id}
    - POST /documentos (FormData)

Tab 4 - Métricas:
  - Score Dinamiza (calculado de recs + subvs + expedientes)
  - GET /informes/{selectedId}
  - POST /certificado/generar
```

### Presentación Cliente

```
1. Lee ?comunidades_id=X del query param
2. GET /comunidades/{X}
3. GET /recomendaciones/{X}
4. GET /subvenciones/{X}
5. Genera 5 slides con los datos
6. Botón "Exportar PDF" → window.print() con CSS @media print
```

---

## Componentes compartidos

| Componente | Selector | Props principales | Uso |
|---|---|---|---|
| GlassCard | `app-glass-card` | `hover` | Contenedor glassmorphism |
| EcoButton | `app-eco-button` | `variant`, `loading`, `disabled`, `block` | Botón con variantes |
| FloatingInput | `app-floating-input` | `label`, `type`, `formControlName` | Input con label animado |
| FloatingSelect | `app-floating-select` | `label`, `options`, `formControlName` | Select con label animado |
| MetricCard | `app-metric-card` | `icon`, `value`, `label` | Card de KPI |
| Modal | `app-modal` | `open`, `title`, `maxWidth` | Diálogo overlay |
| ConfirmDialog | `app-confirm-dialog` | `open`, `title`, `message` | Confirmación sí/no |
| Stepper | `app-stepper` | `steps`, `current` | Indicador de wizard |
| TabBar | `app-tab-bar` | `tabs`, `activeIndex` | Tabs con indicador deslizante |
| Badge | `app-badge` | `text`, `variant` | Etiqueta de estado |
| LoadingSpinner | `app-loading-spinner` | `text` | Indicador de carga |
| EmptyState | `app-empty-state` | `title`, `message` | Estado vacío |
| DataTable | `app-data-table` | `columns`, `rows` | Tabla con ordenación |
| Toast | `app-toast` | — | Notificaciones (global) |

### Pipes

| Pipe | Uso | Ejemplo |
|---|---|---|
| `formatEur` | `value \| formatEur` | `8500` → `8.500 €` |
| `formatPct` | `value \| formatPct` | `72.5` → `72,5%` |
| `safeDate` | `value \| safeDate` | ISO string → `15/03/2026` |

---

## Diseño y estilos

- **Estilo:** Glassmorphism premium (`backdrop-filter: blur`, bordes translúcidos)
- **Paleta:** Emerald (`#10b981` / `#047857`), Slate para neutros (`#1e293b`, `#64748b`)
- **CSS:** Puro, sin frameworks (NO Tailwind)
- **Fuente:** Inter (Google Fonts)
- **Iconos:** SVG inline (sin librería externa)
- **Responsive:** 3 breakpoints — 1024px (tablet), 768px (large phone), 480px (small phone)
- **Animaciones:** CSS keyframes + `IntersectionObserver` (directiva `ScrollAnimate`)

---

## Build y deploy

```bash
# Build producción
ng build

# Output
dist/dinamiza-app-bueno/

# Budgets actuales (angular.json)
# - Initial bundle: 500kB warning, 1MB error
# - Component CSS: 20kB warning, 32kB error
```

- Build actual: **0 errores**
- Chunks lazy-loaded por ruta
- ~73kB gzipped initial bundle
