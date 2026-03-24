export const environment = {
  production: true,
  api: {
    auth: 'https://TU-BACKEND-PRODUCCION.com/api',
    comunidades: 'https://TU-BACKEND-PRODUCCION.com/api',
    recommendations: 'https://TU-BACKEND-PRODUCCION.com/api',
    subvenciones: 'https://TU-BACKEND-PRODUCCION.com/api',
    gestorias: 'https://TU-BACKEND-PRODUCCION.com/api',
    informes: 'https://TU-BACKEND-PRODUCCION.com/api',
  },
  calendarUrl: '',
};

export type ApiBaseKey = keyof typeof environment.api;
