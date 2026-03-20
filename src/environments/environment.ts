export const environment = {
  production: false,
  api: {
    auth: 'http://localhost:8080/api',
    comunidades: 'http://localhost:8080/api',
    recommendations: 'http://localhost:8080/api',
    subvenciones: 'http://localhost:8080/api',
    gestorias: 'http://localhost:8080/api',
    informes: 'http://localhost:8080/api',
  },
  calendarUrl: '',
};

export type ApiBaseKey = keyof typeof environment.api;
