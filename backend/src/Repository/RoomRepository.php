<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Room;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Implementacja repozytorium sal konferencyjnych.
 *
 * @extends ServiceEntityRepository<Room>
 */
class RoomRepository extends ServiceEntityRepository implements RoomRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Room::class);
    }

    public function save(Room $room): void
    {
        $this->getEntityManager()->persist($room);
        $this->getEntityManager()->flush();
    }

    public function remove(Room $room): void
    {
        $this->getEntityManager()->remove($room);
        $this->getEntityManager()->flush();
    }

    public function findById(string $id): ?Room
    {
        return $this->find($id);
    }

    /**
     * @return Room[]
     */
    public function findAll(): array
    {
        return $this->createQueryBuilder('r')
            ->orderBy('r.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Room[]
     */
    public function findActive(): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.isActive = :active')
            ->setParameter('active', true)
            ->orderBy('r.name', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
