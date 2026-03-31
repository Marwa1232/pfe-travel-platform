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

        // Filter by specific trip IDs (comma-separated)
        if (!empty($filters['ids'])) {
            $ids = array_map('intval', explode(',', $filters['ids']));
            $qb->andWhere('t.id IN (:ids)')
               ->setParameter('ids', $ids);
        }

        // Text search in title or description
        if (!empty($filters['search'])) {
            $qb->andWhere('t.title LIKE :search OR t.short_description LIKE :search')
               ->setParameter('search', '%' . $filters['search'] . '%');
        }

        // Filter by destination - support ID, comma-separated IDs, or name
        if (!empty($filters['destination'])) {
            $destValue = $filters['destination'];
            // Check if it's comma-separated IDs
            if (strpos($destValue, ',') !== false) {
                $ids = array_map('intval', explode(',', $destValue));
                $qb->andWhere('d.id IN (:destination)')
                   ->setParameter('destination', $ids);
            } elseif (is_numeric($destValue)) {
                // Single ID
                $qb->andWhere('d.id = :destination')
                   ->setParameter('destination', (int)$destValue);
            } else {
                // Name search
                $qb->andWhere('d.name LIKE :destination')
                   ->setParameter('destination', '%' . $destValue . '%');
            }
        }

        // Filter by category - support ID, comma-separated IDs, or name
        if (!empty($filters['category'])) {
            $catValue = $filters['category'];
            // Check if it's comma-separated IDs
            if (strpos($catValue, ',') !== false) {
                $ids = array_map('intval', explode(',', $catValue));
                $qb->andWhere('c.id IN (:category)')
                   ->setParameter('category', $ids);
            } elseif (is_numeric($catValue)) {
                // Single ID
                $qb->andWhere('c.id = :category')
                   ->setParameter('category', (int)$catValue);
            } else {
                // Name search
                $qb->andWhere('c.name LIKE :category')
                   ->setParameter('category', '%' . $catValue . '%');
            }
        }

        if (!empty($filters['min_price'])) {
            $qb->andWhere('t.base_price >= :min_price')
               ->setParameter('min_price', $filters['min_price']);
        }

        if (!empty($filters['max_price'])) {
            $qb->andWhere('t.base_price <= :max_price')
               ->setParameter('max_price', $filters['max_price']);
        }

        // Filter by duration - support ranges like "1-3", "4-7", "8-14", "15+"
        if (!empty($filters['duration'])) {
            $durationRange = $filters['duration'];
            if ($durationRange === '15+') {
                $qb->andWhere('t.duration_days >= :duration_min')
                   ->setParameter('duration_min', 15);
            } elseif (strpos($durationRange, '-') !== false) {
                list($min, $max) = explode('-', $durationRange);
                $qb->andWhere('t.duration_days >= :duration_min AND t.duration_days <= :duration_max')
                   ->setParameter('duration_min', (int)$min)
                   ->setParameter('duration_max', (int)$max);
            } else {
                // Exact match
                $qb->andWhere('t.duration_days = :duration')
                   ->setParameter('duration', $durationRange);
            }
        }

        // Filter by difficulty (supports French: facile, intermédiaire, difficile)
        if (!empty($filters['difficulty'])) {
            $qb->andWhere('t.difficulty_level = :difficulty')
               ->setParameter('difficulty', $filters['difficulty']);
        }

        // Filter by organizer (for organizer dashboard)
        if (!empty($filters['organizer_id'])) {
            $qb->andWhere('t.organizer = :organizer_id')
               ->setParameter('organizer_id', $filters['organizer_id']);
        }

        // Set defaults for pagination
        $page = isset($filters['page']) ? (int)$filters['page'] : 1;
        $limit = isset($filters['limit']) ? (int)$filters['limit'] : 12;
        
        $offset = ($page - 1) * $limit;
        $qb->setFirstResult($offset)
           ->setMaxResults($limit)
           ->orderBy('t.created_at', 'DESC');

        return $qb->getQuery()->getResult();
    }

    /**
     * Find all active and published trips
     */
    public function findActiveTrips(): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.is_active = :active')
            ->setParameter('active', true)
            ->leftJoin('t.destinations', 'd')
            ->leftJoin('t.categories', 'c')
            ->leftJoin('t.images', 'img')
            ->addSelect('d', 'c', 'img')
            ->orderBy('t.created_at', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find trips by IDs
     */
    public function findByIds(array $ids): array
    {
        if (empty($ids)) {
            return [];
        }

        return $this->createQueryBuilder('t')
            ->where('t.id IN (:ids)')
            ->setParameter('ids', $ids)
            ->leftJoin('t.destinations', 'd')
            ->leftJoin('t.categories', 'c')
            ->leftJoin('t.images', 'img')
            ->addSelect('d', 'c', 'img')
            ->getQuery()
            ->getResult();
    }
}
