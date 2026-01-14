# API Key Server - Instrukcja wdrożenia

## Opis

Prosty endpoint PHP do bezpiecznego przechowywania klucza OpenAI API na serwerze OVH.

## Wdrożenie na OVH

### 1. Skopiuj plik na serwer

```bash
scp api-key-server.php octadev@ssh.cluster121.hosting.ovh.net:~/www/api-key-server.php
```

### 2. Edytuj konfigurację

Zaloguj się na serwer i edytuj plik:

```bash
ssh octadev@ssh.cluster121.hosting.ovh.net
nano ~/www/api-key-server.php
```

Ustaw:
- `$VALID_PIN` - PIN z maila rekrutacyjnego
- `$API_KEY` - klucz OpenAI API

### 3. Sprawdź działanie

```bash
curl "https://octadecimal.pl/api-key-server.php?pin=1401"
```

Powinno zwrócić:
```json
{
  "success": true,
  "key": "sk-proj-..."
}
```

## Bezpieczeństwo

- ✅ Endpoint sprawdza PIN przed zwróceniem klucza
- ✅ Zwraca 403 dla nieprawidłowego PIN-u
- ✅ Klucz nie jest w repozytorium
- ⚠️ Użyj HTTPS (już masz na OVH)
- ⚠️ Rozważ dodanie rate limiting

## Integracja z install.sh

Skrypt `install.sh` automatycznie próbuje pobrać klucz z API jeśli nie znajdzie lokalnego archiwum.
