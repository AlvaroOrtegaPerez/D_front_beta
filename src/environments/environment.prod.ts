export const environment = {
  production: true,
  api: {
    auth: 'https://dinamiza-backend-java-v2.onrender.com/api',
    comunidades: 'https://dinamiza-backend-java-v2.onrender.com/api',
    recommendations: 'https://dinamiza-backend-java-v2.onrender.com/api',
    subvenciones: 'https://dinamiza-backend-java-v2.onrender.com/api',
    gestorias: 'https://dinamiza-backend-java-v2.onrender.com/api',
    informes: 'https://dinamiza-backend-java-v2.onrender.com/api',
    programasSubvenciones: 'https://dinamiza-backend-java-v2.onrender.com/api',
  },
  calendarUrl: '',
};

export type ApiBaseKey = keyof typeof environment.api;
