export const environment = {
  production: isProduction(),
  apiUrl: getApiUrl(),
};

function isProduction(): boolean {
  return window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1';
}

function getApiUrl(): string {
  // Siempre usar proxy tanto en desarrollo como en producción
  return '/api/courses';
}
