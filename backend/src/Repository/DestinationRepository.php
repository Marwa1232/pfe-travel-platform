<?php

namespace App\Repository;

use App\Entity\Destination;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Destination>
 */
class DestinationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Destination::class);
    }

    //    /**
    //     * @return Destination[] Returns an array of Destination objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('d')
    //            ->andWhere('d.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('d.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Destination
    //    {
    //        return $this->createQueryBuilder('d')
    //            ->andWhere('d.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
    #[Route('/api/destinations/popular', name: 'api_popular_destinations', methods: ['GET'])]
public function getPopular(DestinationRepository $repo): JsonResponse
{
    // Nejbdu el data mel base
    $destinations = $repo->findBy([], ['tripsCount' => 'DESC'], 4);
    
    // Nraj3uha b'format yefhmou el React (Hydra format ken testa3mel API Platform)
    return $this->json($destinations, 200, [], ['groups' => 'destination:read']);
}
}
