<?php

namespace App\Repository;

use App\Entity\AIData;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AIData>
 */
class AIDataRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AIData::class);
    }

    /**
     * Find recommendations for a user
     */
    public function findUserRecommendations(int $userId, int $limit = 10): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.userId = :userId')
            ->andWhere('a.dataType = :type')
            ->andWhere('a.isActive = :active')
            ->andWhere('a.expiresAt IS NULL OR a.expiresAt > :now')
            ->setParameter('userId', $userId)
            ->setParameter('type', 'recommendation')
            ->setParameter('active', true)
            ->setParameter('now', new \DateTime())
            ->orderBy('a.score', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find recommendations for a trip
     */
    public function findTripRecommendations(int $tripId, int $limit = 5): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.tripId = :tripId')
            ->andWhere('a.dataType IN (:types)')
            ->andWhere('a.isActive = :active')
            ->setParameter('tripId', $tripId)
            ->setParameter('types', ['recommendation', 'similar', 'related'])
            ->setParameter('active', true)
            ->orderBy('a.score', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Save AI data
     */
    public function save(AIData $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);
        
        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Clear expired data
     */
    public function clearExpired(): int
    {
        $qb = $this->createQueryBuilder('a');
        $qb->delete()
            ->where('a.expiresAt IS NOT NULL')
            ->andWhere('a.expiresAt < :now')
            ->setParameter('now', new \DateTime());
        
        return $qb->getQuery()->execute();
    }
}
