// Environment configuration
export const environment = {
  production: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || 'https://mirecall.ctoninja.tech/api/v1',
  // apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',

  gMapKey:'AIzaSyBaxaDzPi4iupuF2izAb8XTS_rj8pIvyl8'
};
