/** @type {import('next').NextConfig} */
const nextConfig = {
  // Włączenie standalone output dla produkcji (Docker)
  output: 'standalone',

  // Zmienne środowiskowe dostępne w przeglądarce
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  },

  // Optymalizacje obrazów
  images: {
    domains: ['localhost'],
  },

  // Przekierowania i nagłówki
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  // Wyłączenie strict mode dla FullCalendar (problemy z double render)
  reactStrictMode: false,
};

module.exports = nextConfig;
