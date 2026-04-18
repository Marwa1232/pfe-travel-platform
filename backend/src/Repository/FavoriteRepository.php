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

    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.user = :user')
            ->setParameter('user', $user)
            ->leftJoin('f.trip', 't')
            ->addSelect('t')
            ->orderBy('f.created_at', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByUserAndTrip(User $user, int $tripId): ?Favorite
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.user = :user')
            ->andWhere('f.trip = :tripId')
            ->setParameter('user', $user)
            ->setParameter('tripId', $tripId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function isFavorite(User $user, int $tripId): bool
    {
        return $this->findByUserAndTrip($user, $tripId) !== null;
    }
}
