<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Reservation;
use App\Entity\Room;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Implementacja repozytorium rezerwacji.
 *
 * @extends ServiceEntityRepository<Reservation>
 */
class ReservationRepository extends ServiceEntityRepository implements ReservationRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Reservation::class);
    }

    public function save(Reservation $reservation): void
    {
        $this->getEntityManager()->persist($reservation);
        $this->getEntityManager()->flush();
    }

    public function remove(Reservation $reservation): void
    {
        $this->getEntityManager()->remove($reservation);
        $this->getEntityManager()->flush();
    }

    public function findById(string $id): ?Reservation
    {
        return $this->find($id);
    }

    /**
     * @return Reservation[]
     */
    public function findByRoom(Room $room): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.room = :room')
            ->setParameter('room', $room)
            ->orderBy('r.startTime', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Reservation[]
     */
    public function findByDateRange(\DateTimeImmutable $start, \DateTimeImmutable $end): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.startTime >= :start')
            ->andWhere('r.endTime <= :end')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->orderBy('r.startTime', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Znajduje rezerwacje nakładające się z podanym zakresem czasowym.
     *
     * Algorytm: Dwa zakresy [A, B] i [C, D] nakładają się gdy: A < D AND B > C
     * Czyli: startTime < end AND endTime > start
     *
     * @return Reservation[]
     */
    public function findOverlapping(
        Room $room,
        \DateTimeImmutable $start,
        \DateTimeImmutable $end,
        ?string $excludeId = null
    ): array {
        $qb = $this->createQueryBuilder('r')
            ->where('r.room = :room')
            ->andWhere('r.startTime < :end')
            ->andWhere('r.endTime > :start')
            ->setParameter('room', $room)
            ->setParameter('start', $start)
            ->setParameter('end', $end);

        // Wykluczenie konkretnej rezerwacji (przy edycji)
        if ($excludeId !== null) {
            $qb->andWhere('r.id != :excludeId')
               ->setParameter('excludeId', $excludeId);
        }

        return $qb->getQuery()->getResult();
    }
}
