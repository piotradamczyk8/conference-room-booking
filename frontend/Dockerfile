# ============================================
# Conference Room Booking System
# Frontend Dockerfile (Node.js + Next.js 14)
# ============================================

# ====================
# Stage 1: Dependencies
# ====================
FROM node:20-alpine AS deps

WORKDIR /app

# Kopiowanie plików package
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Instalacja zależności
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
    else npm install; \
    fi

# ====================
# Stage 2: Build
# ====================
FROM node:20-alpine AS builder

WORKDIR /app

# Kopiowanie zależności
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Zmienne środowiskowe dla buildu
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Wyłączenie telemetrii Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Build aplikacji
RUN npm run build

# ====================
# Stage 3: Production
# ====================
FROM node:20-alpine AS production

LABEL maintainer="Piotr Adamczyk"
LABEL description="Conference Room Booking System - Frontend"

WORKDIR /app

# Zmienne środowiskowe
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Tworzenie użytkownika bez uprawnień root
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Kopiowanie plików produkcyjnych
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Ustawienie właściciela
RUN chown -R nextjs:nodejs /app

# Przełączenie na użytkownika nextjs
USER nextjs

# Ekspozycja portu
EXPOSE 3000

# Port nasłuchiwania
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Uruchomienie serwera
CMD ["node", "server.js"]

# ====================
# Stage 4: Development
# ====================
# Używamy node:20 (glibc) zamiast alpine (musl) dla kompatybilności z lightningcss
FROM node:20-slim AS development

WORKDIR /app

# Instalacja narzędzi deweloperskich
RUN apt-get update && apt-get install -y git bash && rm -rf /var/lib/apt/lists/*

# Zmienne środowiskowe
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Kopiowanie package.json
COPY package.json package-lock.json* ./

# Instalacja wszystkich zależności (włącznie z devDependencies)
RUN npm install

# Kopiowanie źródeł
COPY . .

# Ekspozycja portu
EXPOSE 3000

# Skrypt startowy - instaluje zależności przy starcie (dla dev mode)
CMD ["sh", "-c", "npm install && npm run dev"]
