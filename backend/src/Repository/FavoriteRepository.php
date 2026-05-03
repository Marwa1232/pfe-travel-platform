<?php

namespace App\Repository;

use App\Entity\Favorite;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Favorite>
 */
class FavoriteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Favorite::class);
    }

    /**
     * Eager-loads trip + images + destinations in a single query
     * to avoid lazy-loading errors during JSON serialization.
     */
    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.user = :user')
            ->setParameter('user', $user)
            ->leftJoin('f.trip', 't')
            ->leftJoin('t.images', 'i')        // ← eager-load images
            ->leftJoin('t.destinations', 'd')  // ← eager-load destinations
            ->addSelect('t', 'i', 'd')
            ->orderBy('f.id', 'DESC')
            ->getQuery()
            ->getResult() ?? [];
    }

    public function findByUserAndTrip(User $user, int $tripId): ?Favorite
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.user = :user')
            ->andWhere('f.trip = :trip')
            ->setParameter('user', $user)
            ->setParameter('trip', $tripId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function isFavorite(User $user, int $tripId): bool
    {
        return $this->findByUserAndTrip($user, $tripId) !== null;
    }

    public function findOneById(int $id): ?Favorite
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }
}