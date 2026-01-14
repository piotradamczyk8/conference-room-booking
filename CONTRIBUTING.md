# Reguły kontrybucji

> Dokument definiuje standardy pracy i konwencje stosowane w projekcie.

---

## Git Workflow

### Strategia branching

```
main ──────────────────────────────► (produkcja)
  │
  └── develop ─────────────────────► (integracja)
        │
        ├── feature/etap-XX-nazwa ─► PR ─► merge
        │
        └── fix/opis-problemu ─────► PR ─► merge
```

### Nazewnictwo branchy

```bash
feature/etap-01-docker-setup
feature/etap-02-entities
fix/reservation-conflict-validation
refactor/extract-conflict-checker
```

---

## Konwencja commitów

### Format (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]
```

### Typy

| Typ | Opis |
|-----|------|
| `feat` | Nowa funkcjonalność |
| `fix` | Naprawa błędu |
| `refactor` | Refaktoryzacja |
| `docs` | Dokumentacja |
| `test` | Testy |
| `chore` | Konfiguracja |
| `style` | Formatowanie |

### Scope

`backend`, `frontend`, `api`, `db`, `docker`, `ui`, `rooms`, `reservations`

### Przykłady

```bash
feat(backend): dodanie encji Room z UUID i timestamps
feat(api): implementacja endpointu POST /api/reservations
fix(backend): naprawa walidacji konfliktów rezerwacji
docs(readme): dodanie instrukcji instalacji
test(backend): testy jednostkowe ReservationConflictChecker
chore(docker): konfiguracja healthcheck dla PostgreSQL
```

### Zasady

1. **Atomowość** - jeden commit = jedna logiczna zmiana
2. **Język polski** - opisy commitów w języku polskim
3. **Typ angielski** - typy (feat, fix, etc.) pozostają po angielsku
4. **Max 72 znaki** - w pierwszej linii
5. **Bez kropki** - na końcu opisu

---

## Quality Gates

### Przed commitem

```bash
# Backend
vendor/bin/phpstan analyse --level=8
php bin/phpunit

# Frontend
npm run lint
npm run type-check
npm test
```

### Wymagania

- PHPStan level 8 - zero errors
- ESLint - zero warnings
- Testy - 100% pass
- Brak console.log/dd() w kodzie

---

## Dokumentacja kodu

### PHP (PHPDoc)

```php
/**
 * Opis klasy.
 */
final readonly class ExampleService
{
    /**
     * Opis metody.
     *
     * @param Type $param Opis parametru
     * @return ReturnType Opis zwracanej wartości
     * @throws ExceptionType Kiedy rzuca wyjątek
     */
    public function method(Type $param): ReturnType
    {
        // ...
    }
}
```

### TypeScript (JSDoc)

```tsx
/**
 * Opis komponentu.
 */
interface ComponentProps {
  /** Opis prop */
  prop: Type;
}

export function Component({ prop }: ComponentProps) {
  // ...
}
```

---

## Pull Request

### Szablon

```markdown
## [Etap X] Nazwa etapu

### Podsumowanie
- Opis głównych zmian

### Zmiany
- `ścieżka/do/pliku.php` - opis zmiany

### Decyzje techniczne
- Uzasadnienie wyborów architektonicznych

### Testowanie
- [ ] Testy jednostkowe przechodzą
- [ ] Testy manualne wykonane

### Checklist
- [ ] PHPStan level 8 - zero błędów
- [ ] ESLint - zero ostrzeżeń
- [ ] Dokumentacja zaktualizowana
- [ ] Brak console.log/dd() w kodzie
```

### Przykładowy tytuł PR

```
[Etap 1] Setup i Infrastruktura Docker
[Etap 2] Backend - Encje i Repository
[Etap 3] Backend - Warstwa serwisów i RabbitMQ
```

---

## Nazewnictwo

### PHP

| Element | Konwencja | Przykład |
|---------|-----------|----------|
| Klasa | PascalCase | `ReservationService` |
| Interface | PascalCase + Interface | `RoomRepositoryInterface` |
| Metoda | camelCase | `findOverlapping()` |
| Zmienna | camelCase | `$startTime` |

### TypeScript

| Element | Konwencja | Przykład |
|---------|-----------|----------|
| Komponent | PascalCase | `ReservationForm` |
| Hook | use + camelCase | `useReservations` |
| Interface | PascalCase | `Reservation` |
| Funkcja | camelCase | `formatDateTime()` |
