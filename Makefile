# ============================================
# Conference Room Booking System - Makefile
# ============================================

.PHONY: help install start stop restart logs logs-backend logs-frontend \
        shell-backend shell-frontend migrate db-reset test test-backend \
        test-frontend lint fix quality build clean

# Domyślna komenda - wyświetla pomoc
.DEFAULT_GOAL := help

# Kolory dla output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

# ====================
# Pomoc
# ====================

help: ## Wyświetla listę dostępnych komend
	@echo ""
	@echo "$(BLUE)Conference Room Booking System$(RESET)"
	@echo "================================"
	@echo ""
	@echo "$(GREEN)Dostępne komendy:$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ====================
# Instalacja i uruchomienie
# ====================

install: ## Pełna instalacja projektu (build + migrate)
	@echo "$(BLUE)▶ Budowanie kontenerów...$(RESET)"
	docker compose build
	@echo "$(BLUE)▶ Uruchamianie serwisów...$(RESET)"
	docker compose up -d
	@echo "$(BLUE)▶ Instalacja zależności backend...$(RESET)"
	docker compose exec backend composer install
	@echo "$(BLUE)▶ Instalacja zależności frontend...$(RESET)"
	docker compose exec frontend npm install
	@echo "$(BLUE)▶ Wykonywanie migracji...$(RESET)"
	docker compose exec backend php bin/console doctrine:migrations:migrate --no-interaction
	@echo "$(GREEN)✓ Instalacja zakończona!$(RESET)"
	@echo ""
	@echo "Dostępne URL-e:"
	@echo "  Frontend:    http://localhost:3000"
	@echo "  Backend API: http://localhost:8080/api"
	@echo "  RabbitMQ:    http://localhost:15672 (guest/guest)"

start: ## Uruchomienie środowiska
	@echo "$(BLUE)▶ Uruchamianie serwisów...$(RESET)"
	docker compose up -d
	@echo "$(GREEN)✓ Środowisko uruchomione$(RESET)"

stop: ## Zatrzymanie środowiska
	@echo "$(BLUE)▶ Zatrzymywanie serwisów...$(RESET)"
	docker compose down
	@echo "$(GREEN)✓ Środowisko zatrzymane$(RESET)"

restart: stop start ## Restart środowiska

build: ## Przebudowanie kontenerów
	@echo "$(BLUE)▶ Przebudowywanie kontenerów...$(RESET)"
	docker compose build --no-cache
	@echo "$(GREEN)✓ Kontenery przebudowane$(RESET)"

clean: ## Usunięcie kontenerów i volumes
	@echo "$(YELLOW)⚠ Usuwanie kontenerów i danych...$(RESET)"
	docker compose down -v --remove-orphans
	@echo "$(GREEN)✓ Wyczyszczono$(RESET)"

# ====================
# Logi
# ====================

logs: ## Podgląd wszystkich logów
	docker compose logs -f

logs-backend: ## Logi backend
	docker compose logs -f backend

logs-frontend: ## Logi frontend
	docker compose logs -f frontend

logs-worker: ## Logi messenger worker
	docker compose logs -f messenger-worker

# ====================
# Shell
# ====================

shell-backend: ## Shell do kontenera backend
	docker compose exec backend sh

shell-frontend: ## Shell do kontenera frontend
	docker compose exec frontend sh

shell-db: ## Shell do PostgreSQL
	docker compose exec database psql -U app -d conference_rooms

# ====================
# Baza danych
# ====================

migrate: ## Wykonanie migracji
	@echo "$(BLUE)▶ Wykonywanie migracji...$(RESET)"
	docker compose exec backend php bin/console doctrine:migrations:migrate --no-interaction
	@echo "$(GREEN)✓ Migracje wykonane$(RESET)"

migration-generate: ## Generowanie nowej migracji
	docker compose exec backend php bin/console doctrine:migrations:generate

migration-diff: ## Generowanie migracji na podstawie zmian w encjach
	docker compose exec backend php bin/console doctrine:migrations:diff

db-reset: ## Reset bazy danych (uwaga: usuwa wszystkie dane!)
	@echo "$(YELLOW)⚠ Resetowanie bazy danych...$(RESET)"
	docker compose exec backend php bin/console doctrine:database:drop --force --if-exists
	docker compose exec backend php bin/console doctrine:database:create
	docker compose exec backend php bin/console doctrine:migrations:migrate --no-interaction
	@echo "$(GREEN)✓ Baza danych zresetowana$(RESET)"

# ====================
# Testy
# ====================

test: test-backend test-frontend ## Uruchomienie wszystkich testów

test-backend: ## Testy PHP (PHPUnit)
	@echo "$(BLUE)▶ Uruchamianie testów backend...$(RESET)"
	docker compose exec backend php bin/phpunit
	@echo "$(GREEN)✓ Testy backend zakończone$(RESET)"

test-frontend: ## Testy JS (Jest)
	@echo "$(BLUE)▶ Uruchamianie testów frontend...$(RESET)"
	docker compose exec frontend npm test
	@echo "$(GREEN)✓ Testy frontend zakończone$(RESET)"

test-coverage: ## Testy z coverage
	docker compose exec backend php bin/phpunit --coverage-html var/coverage

# ====================
# Jakość kodu
# ====================

lint: ## Sprawdzenie jakości kodu (PHPStan + ESLint)
	@echo "$(BLUE)▶ Sprawdzanie PHPStan...$(RESET)"
	docker compose exec backend vendor/bin/phpstan analyse --level=8
	@echo "$(BLUE)▶ Sprawdzanie ESLint...$(RESET)"
	docker compose exec frontend npm run lint
	@echo "$(GREEN)✓ Sprawdzanie jakości zakończone$(RESET)"

lint-backend: ## PHPStan
	docker compose exec backend vendor/bin/phpstan analyse --level=8

lint-frontend: ## ESLint
	docker compose exec frontend npm run lint

fix: ## Automatyczna naprawa stylu kodu
	@echo "$(BLUE)▶ Naprawianie PHP-CS-Fixer...$(RESET)"
	docker compose exec backend vendor/bin/php-cs-fixer fix
	@echo "$(BLUE)▶ Naprawianie ESLint...$(RESET)"
	docker compose exec frontend npm run lint:fix
	@echo "$(GREEN)✓ Naprawa zakończona$(RESET)"

quality: lint test ## Pełne sprawdzenie jakości (lint + test)
	@echo "$(GREEN)✓ Wszystkie sprawdzenia jakości przeszły$(RESET)"

# ====================
# Cache
# ====================

cache-clear: ## Czyszczenie cache Symfony
	docker compose exec backend php bin/console cache:clear

# ====================
# Composer & NPM
# ====================

composer-install: ## Instalacja zależności PHP
	docker compose exec backend composer install

composer-update: ## Aktualizacja zależności PHP
	docker compose exec backend composer update

npm-install: ## Instalacja zależności JS
	docker compose exec frontend npm install

npm-update: ## Aktualizacja zależności JS
	docker compose exec frontend npm update
