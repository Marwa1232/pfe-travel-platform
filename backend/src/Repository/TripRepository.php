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

        // ── Specific trip IDs ──────────────────────────────────────
        if (!empty($filters['ids'])) {
            $ids = array_map('intval', explode(',', $filters['ids']));
            $qb->andWhere('t.id IN (:ids)')
               ->setParameter('ids', $ids);
        }

        // ── Text search ────────────────────────────────────────────
        if (!empty($filters['search'])) {
            $qb->andWhere('t.title LIKE :search OR t.short_description LIKE :search')
               ->setParameter('search', '%' . $filters['search'] . '%');
        }

        // ── Destination (ID or name) ───────────────────────────────
        if (!empty($filters['destination'])) {
            $destValue = $filters['destination'];
            if (strpos($destValue, ',') !== false) {
                $ids = array_map('intval', explode(',', $destValue));
                $qb->andWhere('d.id IN (:destination)')
                   ->setParameter('destination', $ids);
            } elseif (is_numeric($destValue)) {
                $qb->andWhere('d.id = :destination')
                   ->setParameter('destination', (int)$destValue);
            } else {
                $qb->andWhere('d.name LIKE :destination')
                   ->setParameter('destination', '%' . $destValue . '%');
            }
        }

        // ── Category (ID or name) ──────────────────────────────────
        if (!empty($filters['category'])) {
            $catValue = $filters['category'];
            if (strpos($catValue, ',') !== false) {
                $ids = array_map('intval', explode(',', $catValue));
                $qb->andWhere('c.id IN (:category)')
                   ->setParameter('category', $ids);
            } elseif (is_numeric($catValue)) {
                $qb->andWhere('c.id = :category')
                   ->setParameter('category', (int)$catValue);
            } else {
                $qb->andWhere('c.name LIKE :category')
                   ->setParameter('category', '%' . $catValue . '%');
            }
        }

        // ── Price range ────────────────────────────────────────────
        // FIX: CAST to DECIMAL because base_price is stored as varchar/string.
        // String comparison makes "350" >= "1900" TRUE (wrong).
        // Numeric cast ensures correct mathematical comparison.
        if (!empty($filters['min_price'])) {
            $qb->andWhere('CAST(t.base_price AS DECIMAL) >= :min_price')
               ->setParameter('min_price', (float)$filters['min_price']);
        }

        if (!empty($filters['max_price'])) {
            $qb->andWhere('CAST(t.base_price AS DECIMAL) <= :max_price')
               ->setParameter('max_price', (float)$filters['max_price']);
        }

        // ── Duration range ─────────────────────────────────────────
        if (!empty($filters['duration'])) {
            $dur = $filters['duration'];
            if ($dur === '15+') {
                $qb->andWhere('t.duration_days >= :dur_min')
                   ->setParameter('dur_min', 15);
            } elseif (strpos($dur, '-') !== false) {
                [$min, $max] = explode('-', $dur);
                $qb->andWhere('t.duration_days >= :dur_min AND t.duration_days <= :dur_max')
                   ->setParameter('dur_min', (int)$min)
                   ->setParameter('dur_max', (int)$max);
            } else {
                $qb->andWhere('t.duration_days = :dur_exact')
                   ->setParameter('dur_exact', (int)$dur);
            }
        }

        // ── Difficulty ─────────────────────────────────────────────
        if (!empty($filters['difficulty'])) {
            $qb->andWhere('t.difficulty_level = :difficulty')
               ->setParameter('difficulty', $filters['difficulty']);
        }

        // ── Organizer (dashboard) ──────────────────────────────────
        if (!empty($filters['organizer_id'])) {
            $qb->andWhere('t.organizer = :organizer_id')
               ->setParameter('organizer_id', $filters['organizer_id']);
        }

        // ── Sort ───────────────────────────────────────────────────
        $sort = $filters['sort'] ?? 'popular';
        match ($sort) {
            'price_asc'  => $qb->orderBy('CAST(t.base_price AS DECIMAL)', 'ASC'),
            'price_desc' => $qb->orderBy('CAST(t.base_price AS DECIMAL)', 'DESC'),
            'newest'     => $qb->orderBy('t.created_at', 'DESC'),
            default      => $qb->orderBy('t.created_at', 'DESC'),
        };

        // ── Pagination ─────────────────────────────────────────────
        $page   = max(1, (int)($filters['page']  ?? 1));
        $limit  = max(1, (int)($filters['limit'] ?? 12));
        $offset = ($page - 1) * $limit;

        $qb->setFirstResult($offset)
           ->setMaxResults($limit);

        return $qb->getQuery()->getResult();
    }

    /**
     * Count results for pagination (same filters, no limit/offset).
     */
    public function countSearch(array $filters): int
    {
        $qb = $this->createQueryBuilder('t')
            ->select('COUNT(DISTINCT t.id)')
            ->where('t.is_active = :active')
            ->setParameter('active', true)
            ->leftJoin('t.destinations', 'd')
            ->leftJoin('t.categories', 'c');

        if (!empty($filters['search'])) {
            $qb->andWhere('t.title LIKE :search OR t.short_description LIKE :search')
               ->setParameter('search', '%' . $filters['search'] . '%');
        }
        if (!empty($filters['destination'])) {
            $destValue = $filters['destination'];
            if (is_numeric($destValue)) {
                $qb->andWhere('d.id = :destination')->setParameter('destination', (int)$destValue);
            } else {
                $qb->andWhere('d.name LIKE :destination')->setParameter('destination', '%'.$destValue.'%');
            }
        }
        if (!empty($filters['category'])) {
            $catValue = $filters['category'];
            if (is_numeric($catValue)) {
                $qb->andWhere('c.id = :category')->setParameter('category', (int)$catValue);
            } else {
                $qb->andWhere('c.name LIKE :category')->setParameter('category', '%'.$catValue.'%');
            }
        }
        if (!empty($filters['min_price'])) {
            $qb->andWhere('CAST(t.base_price AS DECIMAL) >= :min_price')
               ->setParameter('min_price', (float)$filters['min_price']);
        }
        if (!empty($filters['max_price'])) {
            $qb->andWhere('CAST(t.base_price AS DECIMAL) <= :max_price')
               ->setParameter('max_price', (float)$filters['max_price']);
        }
        if (!empty($filters['duration'])) {
            $dur = $filters['duration'];
            if ($dur === '15+') {
                $qb->andWhere('t.duration_days >= 15');
            } elseif (strpos($dur, '-') !== false) {
                [$min, $max] = explode('-', $dur);
                $qb->andWhere('t.duration_days >= :dur_min AND t.duration_days <= :dur_max')
                   ->setParameter('dur_min', (int)$min)->setParameter('dur_max', (int)$max);
            }
        }
        if (!empty($filters['difficulty'])) {
            $qb->andWhere('t.difficulty_level = :difficulty')
               ->setParameter('difficulty', $filters['difficulty']);
        }
        if (!empty($filters['organizer_id'])) {
            $qb->andWhere('t.organizer = :organizer_id')
               ->setParameter('organizer_id', $filters['organizer_id']);
        }

        return (int)$qb->getQuery()->getSingleScalarResult();
    }

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

    public function findByIds(array $ids): array
    {
        if (empty($ids)) return [];

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