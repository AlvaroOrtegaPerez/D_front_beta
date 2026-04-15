const fs = require('fs');
const path = require('path');

// Load .env file manually if it exists (to avoid extra dependencies like dotenv)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
      process.env[key.trim()] = value.join('=').trim();
    }
  });
}

const baseUrl = process.env.BACKEND_URL || 'https://dinamiza-backend-java-v2.onrender.com/api';

const envConfigFile = `export const environment = {
  production: false,
  api: {
    auth: '${process.env.AUTH_URL || baseUrl}',
    comunidades: '${process.env.COMUNIDADES_URL || baseUrl}',
    recommendations: '${process.env.RECOMMENDATIONS_URL || baseUrl}',
    subvenciones: '${process.env.SUBVENCIONES_URL || baseUrl}',
    gestorias: '${process.env.GESTORIAS_URL || baseUrl}',
    informes: '${process.env.INFORMES_URL || baseUrl}',
    programasSubvenciones: '${process.env.PROGRAMAS_SUBVENCIONES_URL || baseUrl}',
  },
  calendarUrl: '',
};

export type ApiBaseKey = keyof typeof environment.api;
`;

const prodEnvConfigFile = `export const environment = {
  production: true,
  api: {
    auth: '${process.env.AUTH_URL || baseUrl}',
    comunidades: '${process.env.COMUNIDADES_URL || baseUrl}',
    recommendations: '${process.env.RECOMMENDATIONS_URL || baseUrl}',
    subvenciones: '${process.env.SUBVENCIONES_URL || baseUrl}',
    gestorias: '${process.env.GESTORIAS_URL || baseUrl}',
    informes: '${process.env.INFORMES_URL || baseUrl}',
    programasSubvenciones: '${process.env.PROGRAMAS_SUBVENCIONES_URL || baseUrl}',
  },
  calendarUrl: '',
};

export type ApiBaseKey = keyof typeof environment.api;
`;

const dir = path.join(__dirname, 'src', 'environments');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(path.join(dir, 'environment.ts'), envConfigFile);
fs.writeFileSync(path.join(dir, 'environment.prod.ts'), prodEnvConfigFile);

console.log('Environment files generated successfully!');
