<?php

namespace App\Repository;

use App\Entity\Review;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Review>
 */
class ReviewRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Review::class);
    }

    public function findByTripAndStatus(int $tripId, string $status = 'approved'): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.trip = :tripId')
            ->andWhere('r.status = :status')
            ->setParameter('tripId', $tripId)
            ->setParameter('status', $status)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByUserAndTrip(int $userId, int $tripId): ?Review
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.user = :userId')
            ->andWhere('r.trip = :tripId')
            ->setParameter('userId', $userId)
            ->setParameter('tripId', $tripId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function getAverageRating(int $tripId): ?float
    {
        $result = $this->createQueryBuilder('r')
            ->select('AVG(r.rating)')
            ->andWhere('r.trip = :tripId')
            ->andWhere('r.status = :status')
            ->setParameter('tripId', $tripId)
            ->setParameter('status', 'approved')
            ->getQuery()
            ->getSingleScalarResult();

        return $result ? (float) $result : null;
    }

    public function getReviewCount(int $tripId): int
    {
        return $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->andWhere('r.trip = :tripId')
            ->andWhere('r.status = :status')
            ->setParameter('tripId', $tripId)
            ->setParameter('status', 'approved')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findByOrganizer(int $organizerId): array
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.trip', 't')
            ->andWhere('t.organizer = :organizerId')
            ->setParameter('organizerId', $organizerId)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findPendingByOrganizer(int $organizerId): array
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.trip', 't')
            ->andWhere('t.organizer = :organizerId')
            ->andWhere('r.status = :status')
            ->setParameter('organizerId', $organizerId)
            ->setParameter('status', 'pending')
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}