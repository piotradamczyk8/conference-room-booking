import axios from 'axios';

/**
 * Konfiguracja klienta Axios dla API.
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 sekund
});

// Interceptor dla logowania requestów (dev only)
if (process.env.NODE_ENV === 'development') {
  apiClient.interceptors.request.use((config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });
}

// Interceptor dla obsługi błędów
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Obsługa błędów API
    if (error.response) {
      const { status, data } = error.response;

      // Błąd walidacji
      if (status === 422) {
        throw new Error(data.message || 'Błąd walidacji danych');
      }

      // Konflikt (np. rezerwacja nakłada się)
      if (status === 409) {
        throw new Error(data.message || 'Konflikt - operacja niemożliwa');
      }

      // Nie znaleziono
      if (status === 404) {
        throw new Error(data.message || 'Zasób nie został znaleziony');
      }

      // Błąd serwera
      if (status >= 500) {
        throw new Error('Błąd serwera - spróbuj ponownie później');
      }
    }

    // Błąd sieci
    if (error.code === 'ECONNABORTED') {
      throw new Error('Przekroczono limit czasu żądania');
    }

    throw error;
  }
);
