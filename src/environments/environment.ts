export const environment = {
  production: false,
  api: {
    auth: 'https://x8ki-letl-twmt.n7.xano.io/api:3O-33cVF',
    comunidades: 'https://x8ki-letl-twmt.n7.xano.io/api:zamCFJMN',
    recommendations: 'https://x8ki-letl-twmt.n7.xano.io/api:WGfNhi5T',
    subvenciones: 'https://x8ki-letl-twmt.n7.xano.io/api:3rc1fDDJ',
    gestorias: 'https://x8ki-letl-twmt.n7.xano.io/api:cckp9PME',
    informes: 'https://x8ki-letl-twmt.n7.xano.io/api:DrkonBSU',
  },
  calendarUrl: '',
};

export type ApiBaseKey = keyof typeof environment.api;
