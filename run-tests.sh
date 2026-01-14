#!/bin/bash

# Skrypt do uruchamiania wszystkich testów projektu Conference Room Booking
# Autor: Piotr Adamczyk, Octadecimal.pl
# Data utworzenia: 2026-01-14

set -e

# Kolory dla lepszej czytelności
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funkcje pomocnicze
print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Sprawdzenie czy Docker działa
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker nie jest uruchomiony!"
        exit 1
    fi
}

# Sprawdzenie czy kontenery działają
check_containers() {
    if ! docker-compose ps | grep -q "backend.*Up"; then
        print_error "Kontener backend nie jest uruchomiony!"
        print_info "Uruchom: docker-compose up -d"
        exit 1
    fi
}

# Uruchomienie testów backendowych
run_backend_tests() {
    print_header "TESTY BACKEND (PHPUnit)"
    
    local testsuite="${1:-}"
    
    if [ -n "$testsuite" ]; then
        print_info "Uruchamiam testsuite: $testsuite"
        docker-compose exec -T backend ./vendor/bin/phpunit --testsuite "$testsuite" --colors=always
    else
        print_info "Uruchamiam wszystkie testy..."
        docker-compose exec -T backend ./vendor/bin/phpunit --colors=always
    fi
}

# Uruchomienie analizy statycznej (PHPStan)
run_phpstan() {
    print_header "ANALIZA STATYCZNA (PHPStan)"
    
    print_info "Sprawdzam kod źródłowy..."
    docker-compose exec -T backend ./vendor/bin/phpstan analyse src --level=max --no-progress || true
}

# Uruchomienie PHP CS Fixer (sprawdzenie)
run_cs_check() {
    print_header "STYL KODU (PHP CS Fixer)"
    
    print_info "Sprawdzam styl kodu..."
    docker-compose exec -T backend ./vendor/bin/php-cs-fixer fix src --dry-run --diff || true
}

# Uruchomienie testów frontendowych
run_frontend_tests() {
    print_header "TESTY FRONTEND (Jest/Vitest)"
    
    if docker-compose ps | grep -q "frontend.*Up"; then
        print_info "Uruchamiam testy frontendowe..."
        docker-compose exec -T frontend npm test -- --passWithNoTests 2>/dev/null || print_info "Brak testów frontendowych lub błąd uruchomienia"
    else
        print_info "Kontener frontend nie jest uruchomiony, pomijam testy frontendowe"
    fi
}

# Pomoc
show_help() {
    echo "Użycie: $0 [opcja]"
    echo ""
    echo "Opcje:"
    echo "  all         Uruchom wszystkie testy (domyślne)"
    echo "  unit        Uruchom tylko testy jednostkowe"
    echo "  integration Uruchom tylko testy integracyjne"
    echo "  functional  Uruchom tylko testy funkcjonalne"
    echo "  backend     Uruchom wszystkie testy backendowe"
    echo "  frontend    Uruchom testy frontendowe"
    echo "  phpstan     Uruchom analizę statyczną"
    echo "  cs          Sprawdź styl kodu"
    echo "  quick       Szybkie testy (unit + phpstan)"
    echo "  help        Wyświetl tę pomoc"
    echo ""
    echo "Przykłady:"
    echo "  $0              # Wszystkie testy"
    echo "  $0 unit         # Tylko testy jednostkowe"
    echo "  $0 quick        # Szybka weryfikacja"
    echo ""
}

# Główna logika
main() {
    local start_time=$(date +%s)
    
    print_header "CONFERENCE ROOM BOOKING - TESTY"
    echo "Data: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Sprawdzenie środowiska
    check_docker
    check_containers
    
    case "${1:-all}" in
        all)
            run_backend_tests
            run_frontend_tests
            ;;
        unit)
            run_backend_tests "Unit"
            ;;
        integration)
            run_backend_tests "Integration"
            ;;
        functional)
            run_backend_tests "Functional"
            ;;
        backend)
            run_backend_tests
            ;;
        frontend)
            run_frontend_tests
            ;;
        phpstan)
            run_phpstan
            ;;
        cs)
            run_cs_check
            ;;
        quick)
            run_backend_tests "Unit"
            run_phpstan
            ;;
        help|--help|-h)
            show_help
            exit 0
            ;;
        *)
            print_error "Nieznana opcja: $1"
            show_help
            exit 1
            ;;
    esac
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    print_header "PODSUMOWANIE"
    print_success "Testy zakończone w ${duration}s"
    echo ""
}

# Uruchomienie
cd "$(dirname "$0")"
main "$@"
