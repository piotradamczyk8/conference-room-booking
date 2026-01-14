# GitHub Actions - Testy instalacji

Automatyczne testy instalacji na Linux, Windows i macOS.

## Workflow: `test-installation.yml`

### Co testuje:

1. ✅ **Instalacja** - uruchomienie `./install.sh` z `API_PIN=1401`
2. ✅ **Kontenery** - sprawdzenie czy wszystkie są `Up` i `healthy`
3. ✅ **Frontend** - HTTP 200 na `http://localhost:3000`
4. ✅ **Backend API** - `/api/rooms` odpowiada
5. ✅ **Chat AI Status** - `/api/chat/status` zwraca `available: true`
6. ✅ **Chat AI Response** - test wysłania wiadomości i odpowiedzi
7. ✅ **Renderowanie** - sprawdzenie czy HTML się renderuje

### Systemy operacyjne:

- ✅ **Linux** (Ubuntu Latest)
- ✅ **Windows** (Windows Latest)
- ✅ **macOS** (macOS Latest)

### Uruchamianie:

**Automatycznie:**
- Przy każdym push do `main`, `githubtest-version`, `mysql-version`
- Przy każdym Pull Request do `main`

**Ręcznie:**
- W GitHub: Actions → Test Installation → Run workflow

### Konfiguracja:

Workflow używa `API_PIN` z GitHub Secrets (jeśli ustawione) lub domyślnie `1401`.

Aby ustawić własny PIN:
1. GitHub → Settings → Secrets and variables → Actions
2. Dodaj secret: `API_PIN` = `1401`

### Zalety vs Vagrant:

| Cecha | GitHub Actions | Vagrant |
|-------|----------------|---------|
| **Koszt** | ✅ Darmowe (publiczne repo) | ⚠️ Wymaga VirtualBox/Parallels |
| **Automatyzacja** | ✅ Przy każdym push | ❌ Ręczne uruchomienie |
| **Multi-OS** | ✅ Linux/Windows/macOS | ⚠️ Wymaga konfiguracji |
| **Apple Silicon** | ✅ Działa natywnie | ❌ Problemy z VirtualBox |
| **CI/CD** | ✅ Zintegrowane | ❌ Osobne narzędzie |

### Przykładowy output:

```
✅ Wszystkie kontenery działają
✅ Frontend odpowiada (HTTP 200)
✅ Backend API odpowiada
✅ Chat AI jest dostępny
✅ Chat AI odpowiada poprawnie
✅ Frontend renderuje się poprawnie
```
