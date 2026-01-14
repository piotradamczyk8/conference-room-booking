#!/bin/bash

# ============================================
# AI RoomBook - Skrypt instalacyjny
# Autor: Piotr Adamczyk, Octadecimal.pl
# ============================================

set -e

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Funkcje pomocnicze
print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}$1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Sprawdzenie wymagań
check_requirements() {
    print_header "🔍 Sprawdzanie wymagań"
    
    # Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker nie jest zainstalowany!"
        echo "Zainstaluj Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker zainstalowany"
    
    # Docker Compose
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose nie jest dostępny!"
        exit 1
    fi
    print_success "Docker Compose dostępny"
    
    # Sprawdź czy Docker działa
    if ! docker info &> /dev/null; then
        print_error "Docker nie jest uruchomiony!"
        echo "Uruchom Docker Desktop i spróbuj ponownie."
        exit 1
    fi
    print_success "Docker uruchomiony"
}

# Rozpakowanie sekretów (klucz OpenAI)
unlock_secrets() {
    print_header "🔐 Konfiguracja klucza API"
    
    if [ ! -f secrets.zip ]; then
        print_warning "Plik secrets.zip nie został znaleziony"
        print_warning "Asystent AI nie będzie działać bez klucza OpenAI"
        return 0
    fi
    
    echo ""
    echo -e "${CYAN}Aby odblokować asystenta AI, podaj PIN z maila rekrutacyjnego.${NC}"
    echo -e "${YELLOW}(Zostaw puste aby pominąć - AI Chat nie będzie działać)${NC}"
    echo ""
    
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        read -s -p "🔑 Podaj PIN: " pin
        echo ""
        
        if [ -z "$pin" ]; then
            print_warning "Pominięto konfigurację klucza API"
            return 0
        fi
        
        # Próba rozpakowania
        if unzip -P "$pin" -o secrets.zip -d /tmp/secrets_temp &>/dev/null; then
            print_success "PIN prawidłowy!"
            
            # Odczytaj zawartość klucza
            if [ -f /tmp/secrets_temp/key.txt ]; then
                local key_content=$(cat /tmp/secrets_temp/key.txt)
                
                # Dodaj do głównego .env
                echo "" >> .env
                echo "# === Klucz OpenAI (automatycznie dodany) ===" >> .env
                echo "$key_content" >> .env
                
                # Dodaj do backend/.env
                if [ -f backend/.env ]; then
                    # Usuń istniejący OPENAI_API_KEY jeśli jest pusty (kompatybilne z macOS i Linux)
                    if [[ "$OSTYPE" == "darwin"* ]]; then
                        sed -i '' '/^OPENAI_API_KEY=$/d' backend/.env 2>/dev/null || true
                    else
                        sed -i '/^OPENAI_API_KEY=$/d' backend/.env 2>/dev/null || true
                    fi
                    echo "" >> backend/.env
                    echo "# === Klucz OpenAI (automatycznie dodany) ===" >> backend/.env
                    echo "$key_content" >> backend/.env
                fi
                
                print_success "Klucz OpenAI został skonfigurowany!"
                
                # Wyczyść tymczasowe pliki
                rm -rf /tmp/secrets_temp
                return 0
            else
                print_error "Nie znaleziono pliku key.txt w archiwum"
                rm -rf /tmp/secrets_temp
                return 1
            fi
        else
            attempt=$((attempt + 1))
            if [ $attempt -le $max_attempts ]; then
                print_error "Nieprawidłowy PIN. Pozostało prób: $((max_attempts - attempt + 1))"
            else
                print_error "Przekroczono limit prób"
                print_warning "Asystent AI nie będzie działać bez klucza OpenAI"
            fi
        fi
    done
    
    return 0
}

# Konfiguracja środowiska
setup_environment() {
    print_header "⚙️  Konfiguracja środowiska"
    
    # Główny .env
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Utworzono .env z .env.example"
        else
            print_warning "Brak .env.example, tworzę podstawowy .env"
            cat > .env << 'EOF'
APP_ENV=dev
APP_SECRET=change_this_to_random_secret_in_production
DATABASE_URL=postgresql://app:secret@database:5432/conference_rooms?serverVersion=16
MESSENGER_TRANSPORT_DSN=amqp://guest:guest@rabbitmq:5672/%2f/messages
NEXT_PUBLIC_API_URL=http://localhost:8080/api
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
POSTGRES_USER=app
POSTGRES_PASSWORD=secret
POSTGRES_DB=conference_rooms
RABBITMQ_DEFAULT_USER=guest
RABBITMQ_DEFAULT_PASS=guest
FRONTEND_PORT=3000
BACKEND_PORT=8080
RABBITMQ_MANAGEMENT_PORT=15672
DATABASE_PORT=5432
OPENAI_API_KEY=
EOF
            print_success "Utworzono podstawowy .env"
        fi
    else
        print_success ".env już istnieje"
    fi
    
    # Backend .env
    if [ ! -f backend/.env ]; then
        if [ -f backend/.env.example ]; then
            cp backend/.env.example backend/.env
        else
            cat > backend/.env << 'EOF'
APP_ENV=dev
APP_SECRET=9a23c2c78528b6477a8bf97b3949a3a8
DATABASE_URL="postgresql://app:secret@database:5432/conference_rooms?serverVersion=16&charset=utf8"
MESSENGER_TRANSPORT_DSN=amqp://guest:guest@rabbitmq:5672/%2f/messages
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
OPENAI_API_KEY=
EOF
        fi
        print_success "Utworzono backend/.env"
    else
        print_success "backend/.env już istnieje"
    fi
}

# Zatrzymanie istniejących kontenerów
stop_existing() {
    print_header "🛑 Zatrzymywanie istniejących kontenerów"
    
    if docker compose ps -q 2>/dev/null | grep -q .; then
        docker compose down --remove-orphans 2>/dev/null || true
        print_success "Kontenery zatrzymane"
    else
        print_success "Brak uruchomionych kontenerów"
    fi
}

# Budowanie i uruchamianie
build_and_start() {
    print_header "🏗️  Budowanie kontenerów"
    
    print_step "Budowanie obrazów Docker..."
    docker compose build --quiet
    print_success "Obrazy zbudowane"
    
    print_step "Uruchamianie serwisów..."
    docker compose up -d
    print_success "Serwisy uruchomione"
}

# Czekanie na gotowość serwisów
wait_for_services() {
    print_header "⏳ Czekanie na gotowość serwisów"
    
    print_step "Czekanie na bazę danych..."
    local max_attempts=30
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
        if docker compose exec -T database pg_isready -U app -d conference_rooms &>/dev/null; then
            print_success "Baza danych gotowa"
            break
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Timeout - baza danych nie odpowiada"
        exit 1
    fi
    
    print_step "Czekanie na RabbitMQ..."
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if docker compose exec -T rabbitmq rabbitmq-diagnostics -q ping &>/dev/null; then
            print_success "RabbitMQ gotowy"
            break
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_step "Czekanie na backend..."
    sleep 3
    print_success "Backend gotowy"
}

# Instalacja zależności
install_dependencies() {
    print_header "📦 Instalacja zależności"
    
    # Upewnij się, że .env istnieje w kontenerze
    print_step "Konfiguracja środowiska w kontenerze..."
    docker compose exec -T backend sh -c '
        if [ ! -f /var/www/html/.env ]; then
            if [ -f /var/www/html/.env.example ]; then
                cp /var/www/html/.env.example /var/www/html/.env
            else
                echo "APP_ENV=dev" > /var/www/html/.env
                echo "APP_SECRET=9a23c2c78528b6477a8bf97b3949a3a8" >> /var/www/html/.env
                echo "DATABASE_URL=postgresql://app:secret@database:5432/conference_rooms?serverVersion=16" >> /var/www/html/.env
                echo "MESSENGER_TRANSPORT_DSN=amqp://guest:guest@rabbitmq:5672/%2f/messages" >> /var/www/html/.env
                echo "CORS_ALLOW_ORIGIN=^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$" >> /var/www/html/.env
            fi
        fi
    '
    print_success "Środowisko skonfigurowane"
    
    print_step "Instalacja zależności PHP (composer)..."
    docker compose exec -T backend composer install --no-interaction --optimize-autoloader 2>&1 | tail -5
    print_success "Zależności PHP zainstalowane"
    
    print_step "Instalacja zależności JS (npm)..."
    docker compose exec -T frontend npm install 2>&1 | tail -3
    print_success "Zależności JS zainstalowane"
}

# Migracje bazy danych
run_migrations() {
    print_header "🗄️  Migracje bazy danych"
    
    print_step "Czyszczenie cache Symfony..."
    docker compose exec -T backend php bin/console cache:clear --no-interaction 2>/dev/null || true
    
    print_step "Wykonywanie migracji..."
    docker compose exec -T backend php bin/console doctrine:migrations:migrate --no-interaction 2>&1 | tail -5
    print_success "Migracje wykonane"
}

# Sprawdzenie statusu
check_status() {
    print_header "🔎 Sprawdzanie statusu"
    
    echo ""
    docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || docker compose ps
    echo ""
}

# Otwieranie przeglądarki
open_browser() {
    print_header "🌐 Otwieranie przeglądarki"
    
    local url="http://localhost:3000"
    
    print_step "Czekanie na frontend..."
    local max_attempts=30
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null | grep -q "200\|304"; then
            break
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_success "Frontend gotowy!"
    
    # Otwieranie przeglądarki
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$url"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "$url" 2>/dev/null || sensible-browser "$url" 2>/dev/null || true
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        start "$url"
    fi
    
    print_success "Przeglądarka otwarta"
}

# Podsumowanie
print_summary() {
    print_header "🎉 Instalacja zakończona!"
    
    echo -e "${GREEN}AI RoomBook jest gotowy do użycia!${NC}"
    echo ""
    echo -e "${CYAN}Dostępne URL-e:${NC}"
    echo -e "  ${BLUE}Frontend:${NC}     http://localhost:3000"
    echo -e "  ${BLUE}Backend API:${NC}  http://localhost:8080/api"
    echo -e "  ${BLUE}RabbitMQ UI:${NC}  http://localhost:15672 (guest/guest)"
    echo ""
    echo -e "${CYAN}Przydatne komendy:${NC}"
    echo -e "  ${BLUE}make start${NC}    - Uruchom środowisko"
    echo -e "  ${BLUE}make stop${NC}     - Zatrzymaj środowisko"
    echo -e "  ${BLUE}make logs${NC}     - Podgląd logów"
    echo -e "  ${BLUE}make test${NC}     - Uruchom testy"
    echo ""
    echo -e "${YELLOW}Uwaga:${NC} Aby korzystać z AI Chat, dodaj klucz OPENAI_API_KEY do pliku .env"
    echo ""
}

# Główna funkcja
main() {
    clear
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}                                                           ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}   ${BLUE}🤖 AI RoomBook - Inteligentny System Rezerwacji${NC}        ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                           ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}   ${GREEN}Skrypt instalacyjny${NC}                                    ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}   Autor: Piotr Adamczyk, octadecimal.pl                   ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}                                                           ${CYAN}║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    cd "$(dirname "$0")"
    
    check_requirements
    setup_environment
    unlock_secrets
    stop_existing
    build_and_start
    wait_for_services
    install_dependencies
    run_migrations
    check_status
    open_browser
    print_summary
}

# Uruchomienie
main "$@"
