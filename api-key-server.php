<?php
/**
 * Prosty endpoint do pobierania klucza API po podaniu PIN-u
 * Do wdrożenia na serwerze OVH
 * 
 * Instrukcja:
 * 1. Skopiuj ten plik do ~/www/api-key-server.php
 * 2. Ustaw zmienną $VALID_PIN na PIN z maila
 * 3. Ustaw zmienną $API_KEY na klucz OpenAI
 * 4. Endpoint: https://octadecimal.pl/api-key-server.php?pin=1401
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Konfiguracja - UZUPEŁNIJ PRZED WDROŻENIEM!
$VALID_PIN = '1401'; // PIN z maila rekrutacyjnego
$API_KEY = 'WSTAW_TUTAJ_KLUCZ_OPENAI_API'; // Klucz z maila rekrutacyjnego

// Pobierz PIN z query string
$pin = $_GET['pin'] ?? '';

// Walidacja
if (empty($pin)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Brak parametru PIN'
    ]);
    exit;
}

if ($pin !== $VALID_PIN) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Nieprawidłowy PIN'
    ]);
    exit;
}

// Zwróć klucz
echo json_encode([
    'success' => true,
    'key' => $API_KEY
]);
