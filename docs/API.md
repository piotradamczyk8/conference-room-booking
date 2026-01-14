# API Documentation

> Conference Room Booking System - REST API

---

## Base URL

```
http://localhost:8080/api
```

---

## Endpoints

### Rooms (Sale konferencyjne)

| Method | Endpoint | Opis |
|--------|----------|------|
| `GET` | `/rooms` | Lista wszystkich sal |
| `GET` | `/rooms/{id}` | Szczegóły sali |
| `POST` | `/rooms` | Utworzenie nowej sali |
| `PUT` | `/rooms/{id}` | Aktualizacja sali |
| `DELETE` | `/rooms/{id}` | Usunięcie sali |

### Reservations (Rezerwacje)

| Method | Endpoint | Opis |
|--------|----------|------|
| `GET` | `/reservations` | Lista rezerwacji (z filtrami) |
| `GET` | `/reservations/{id}` | Szczegóły rezerwacji |
| `POST` | `/reservations` | Utworzenie rezerwacji |
| `PUT` | `/reservations/{id}` | Aktualizacja rezerwacji |
| `DELETE` | `/reservations/{id}` | Usunięcie rezerwacji |

---

## Szczegóły endpointów

### GET /rooms

**Response 200:**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Sala A",
      "description": "Duża sala konferencyjna",
      "capacity": 20,
      "floor": "1",
      "amenities": ["projektor", "tablica", "wideokonferencja"],
      "isActive": true,
      "createdAt": "2026-01-14T10:00:00+00:00",
      "updatedAt": "2026-01-14T10:00:00+00:00"
    }
  ]
}
```

### POST /rooms

**Request:**

```json
{
  "name": "Sala B",
  "description": "Mała sala spotkań",
  "capacity": 8,
  "floor": "2",
  "amenities": ["tablica"]
}
```

**Response 201:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Sala B",
  "description": "Mała sala spotkań",
  "capacity": 8,
  "floor": "2",
  "amenities": ["tablica"],
  "isActive": true,
  "createdAt": "2026-01-14T12:00:00+00:00",
  "updatedAt": "2026-01-14T12:00:00+00:00"
}
```

### POST /reservations

**Request:**

```json
{
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "reservedBy": "Jan Kowalski",
  "title": "Spotkanie projektowe",
  "startTime": "2026-01-15T10:00:00+00:00",
  "endTime": "2026-01-15T11:00:00+00:00",
  "notes": "Przygotować prezentację"
}
```

**Response 201:**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "room": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Sala A"
  },
  "reservedBy": "Jan Kowalski",
  "title": "Spotkanie projektowe",
  "startTime": "2026-01-15T10:00:00+00:00",
  "endTime": "2026-01-15T11:00:00+00:00",
  "notes": "Przygotować prezentację",
  "createdAt": "2026-01-14T12:30:00+00:00"
}
```

**Response 409 (Conflict):**

```json
{
  "error": "reservation_conflict",
  "message": "Sala 'Sala A' jest już zarezerwowana w tym czasie przez Anna Nowak",
  "details": {
    "existingReservation": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "reservedBy": "Anna Nowak",
      "startTime": "2026-01-15T09:30:00+00:00",
      "endTime": "2026-01-15T10:30:00+00:00"
    }
  }
}
```

### GET /reservations

**Query Parameters:**

| Param | Type | Opis |
|-------|------|------|
| `roomId` | UUID | Filtr po ID sali |
| `from` | ISO 8601 | Data początkowa |
| `to` | ISO 8601 | Data końcowa |

**Example:**

```
GET /reservations?roomId=550e8400-e29b-41d4-a716-446655440000&from=2026-01-01&to=2026-01-31
```

---

## Kody błędów

| Status | Opis |
|--------|------|
| `200` | Sukces |
| `201` | Utworzono |
| `204` | Usunięto (brak treści) |
| `400` | Nieprawidłowe żądanie |
| `404` | Nie znaleziono |
| `409` | Konflikt (rezerwacja nakłada się) |
| `422` | Błąd walidacji |
| `500` | Błąd serwera |

---

## Walidacja

### Room

| Pole | Reguły |
|------|--------|
| `name` | Wymagane, max 100 znaków |
| `capacity` | Wymagane, > 0 |
| `description` | Opcjonalne |
| `floor` | Opcjonalne, max 50 znaków |
| `amenities` | Opcjonalne, tablica stringów |

### Reservation

| Pole | Reguły |
|------|--------|
| `roomId` | Wymagane, valid UUID |
| `reservedBy` | Wymagane, max 100 znaków |
| `title` | Opcjonalne, max 255 znaków |
| `startTime` | Wymagane, ISO 8601 |
| `endTime` | Wymagane, ISO 8601, > startTime |
| `notes` | Opcjonalne |
