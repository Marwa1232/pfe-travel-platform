<?php

namespace App\Repository;

use App\Entity\Trip;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class TripRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Trip::class);
    }

    public function search(array $filters): array
    {
        $qb = $this->createQueryBuilder('t')
            ->where('t.is_active = :active')
            ->setParameter('active', true)
            ->leftJoin('t.destinations', 'd')
            ->leftJoin('t.categories', 'c')
            ->leftJoin('t.images', 'img')
            ->addSelect('d', 'c', 'img');

        if ($filters['destination']) {
            $qb->andWhere('d.id = :destination')
               ->setParameter('destination', $filters['destination']);
        }

        if ($filters['category']) {
            $qb->andWhere('c.id = :category')
               ->setParameter('category', $filters['category']);
        }

        if ($filters['min_price']) {
            $qb->andWhere('t.base_price >= :min_price')
               ->setParameter('min_price', $filters['min_price']);
        }

        if ($filters['max_price']) {
            $qb->andWhere('t.base_price <= :max_price')
               ->setParameter('max_price', $filters['max_price']);
        }

        if ($filters['duration']) {
            $qb->andWhere('t.duration_days = :duration')
               ->setParameter('duration', $filters['duration']);
        }

        $offset = ($filters['page'] - 1) * $filters['limit'];
        $qb->setFirstResult($offset)
           ->setMaxResults($filters['limit'])
           ->orderBy('t.created_at', 'DESC');

        return $qb->getQuery()->getResult();
    }
}