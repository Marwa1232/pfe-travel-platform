<?php

namespace App\Service;

use App\Entity\Booking;
use App\Entity\LoyaltyOffer;
use App\Entity\LoyaltyPoints;
use App\Entity\LoyaltyTransaction;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class LoyaltyService
{
    // 1 point par 10 EUR
    private const POINTS_PER_EUR = 0.1;

    public function __construct(private EntityManagerInterface $em) {}

    public function getOrCreate(User $user): LoyaltyPoints
    {
        $lp = $this->em->getRepository(LoyaltyPoints::class)->findOneBy(['user' => $user]);
        if (!$lp) {
            $lp = new LoyaltyPoints();
            $lp->setUser($user);
            $this->em->persist($lp);
        }
        return $lp;
    }

    public function earnPoints(User $user, Booking $booking): int
    {
        // Utiliser le montant du Payment (EUR après discount) si disponible
        // Cela garantit que les points sont toujours calculés sur des EUR, quelle que soit
        // la devise affichée au voyageur (Multi-Currency Stripe)
        $payment = $booking->getPayment();
        $amount  = $payment
            ? (float) $payment->getAmount()        // EUR — après réduction fidélité éventuelle
            : (float) $booking->getTotalPrice();   // fallback (cash)

        $points = (int) floor($amount * self::POINTS_PER_EUR);
        if ($points <= 0) return 0;

        $lp = $this->getOrCreate($user);
        $lp->setTotalPoints($lp->getTotalPoints() + $points);
        $lp->setUpdatedAt(new \DateTimeImmutable());

        $tx = new LoyaltyTransaction();
        $tx->setUser($user);
        $tx->setType('earn');
        $tx->setPoints($points);
        $tx->setBooking($booking);
        $tx->setDescription(sprintf('Points gagnés pour la réservation #%d', $booking->getId()));
        $this->em->persist($tx);
        $this->em->flush();

        return $points;
    }

    public function redeemPoints(User $user, LoyaltyOffer $offer, Booking $booking): float
    {
        $lp = $this->getOrCreate($user);
        if ($lp->getAvailablePoints() < $offer->getPointsRequired()) {
            throw new \RuntimeException('Points insuffisants');
        }

        // Calculer la réduction
        $price    = (float) $booking->getTotalPrice();
        $discount = match($offer->getDiscountType()) {
            'percentage_discount' => $price * ((float)$offer->getDiscountValue() / 100),
            'fixed_discount'      => min((float)$offer->getDiscountValue(), $price),
            default               => 0,
        };

        $lp->setUsedPoints($lp->getUsedPoints() + $offer->getPointsRequired());
        $lp->setUpdatedAt(new \DateTimeImmutable());

        $tx = new LoyaltyTransaction();
        $tx->setUser($user);
        $tx->setType('redeem');
        $tx->setPoints(-$offer->getPointsRequired());
        $tx->setBooking($booking);
        $tx->setDescription(sprintf('Offre "%s" appliquée', $offer->getTitle()));
        $this->em->persist($tx);
        $this->em->flush();

        return round($discount, 2);
    }

    public function getHistory(User $user): array
    {
        return $this->em->getRepository(LoyaltyTransaction::class)
            ->findBy(['user' => $user], ['createdAt' => 'DESC'], 20);
    }
}