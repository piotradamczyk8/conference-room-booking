<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * Testy funkcjonalne API sal konferencyjnych.
 */
final class RoomApiTest extends WebTestCase
{
    private const API_ROOMS = '/api/rooms';

    public function testGetRoomsReturnsEmptyArrayWhenNoRooms(): void
    {
        $client = static::createClient();
        $client->request('GET', self::API_ROOMS);

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');
        
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($content);
    }

    public function testCreateRoomSuccessfully(): void
    {
        $client = static::createClient();
        
        $roomData = [
            'name' => 'Sala Testowa ' . uniqid(),
            'description' => 'Opis sali testowej',
            'capacity' => 15,
            'floor' => '3',
            'amenities' => ['projektor', 'klimatyzacja'],
            'isActive' => true,
        ];

        $client->request(
            'POST',
            self::API_ROOMS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($roomData)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $content);
        $this->assertEquals($roomData['name'], $content['name']);
        $this->assertEquals($roomData['capacity'], $content['capacity']);
        $this->assertEquals($roomData['amenities'], $content['amenities']);
    }

    public function testCreateRoomFailsWithoutName(): void
    {
        $client = static::createClient();
        
        $roomData = [
            'capacity' => 10,
        ];

        $client->request(
            'POST',
            self::API_ROOMS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($roomData)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testCreateRoomFailsWithInvalidCapacity(): void
    {
        $client = static::createClient();
        
        $roomData = [
            'name' => 'Sala Invalid',
            'capacity' => 0, // Nieprawidłowa pojemność
        ];

        $client->request(
            'POST',
            self::API_ROOMS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($roomData)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testGetSingleRoom(): void
    {
        $client = static::createClient();
        
        // Najpierw tworzymy salę
        $roomData = [
            'name' => 'Sala Do Pobrania ' . uniqid(),
            'capacity' => 8,
        ];

        $client->request(
            'POST',
            self::API_ROOMS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($roomData)
        );

        $created = json_decode($client->getResponse()->getContent(), true);
        $roomId = $created['id'];

        // Pobieramy salę
        $client->request('GET', self::API_ROOMS . '/' . $roomId);
        
        $this->assertResponseIsSuccessful();
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals($roomId, $content['id']);
        $this->assertEquals($roomData['name'], $content['name']);
    }

    public function testGetNonExistentRoomReturns404(): void
    {
        $client = static::createClient();
        
        $client->request('GET', self::API_ROOMS . '/00000000-0000-0000-0000-000000000000');
        
        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }

    public function testUpdateRoom(): void
    {
        $client = static::createClient();
        
        // Tworzymy salę
        $client->request(
            'POST',
            self::API_ROOMS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['name' => 'Sala Original ' . uniqid(), 'capacity' => 10])
        );

        $created = json_decode($client->getResponse()->getContent(), true);
        $roomId = $created['id'];

        // Aktualizujemy
        $updateData = [
            'name' => 'Sala Updated',
            'capacity' => 20,
            'description' => 'Zaktualizowany opis',
        ];

        $client->request(
            'PUT',
            self::API_ROOMS . '/' . $roomId,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($updateData)
        );

        $this->assertResponseIsSuccessful();
        $content = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('Sala Updated', $content['name']);
        $this->assertEquals(20, $content['capacity']);
    }

    public function testDeleteRoom(): void
    {
        $client = static::createClient();
        
        // Tworzymy salę
        $client->request(
            'POST',
            self::API_ROOMS,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['name' => 'Sala Do Usunięcia ' . uniqid(), 'capacity' => 5])
        );

        $created = json_decode($client->getResponse()->getContent(), true);
        $roomId = $created['id'];

        // Usuwamy
        $client->request('DELETE', self::API_ROOMS . '/' . $roomId);
        
        $this->assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);

        // Sprawdzamy że nie istnieje
        $client->request('GET', self::API_ROOMS . '/' . $roomId);
        $this->assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
    }
}
