<?php

namespace App\Service;

use App\Entity\Booking;
use App\Entity\LoyaltyOffer;
use App\Entity\LoyaltyTransaction;
use App\Entity\OrganizerProfile;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class LoyaltyService
{
    // 1 point par 10 EUR dépensés
    private const POINTS_PER_EUR = 0.1;

    public function __construct(private EntityManagerInterface $em) {}

    // ── Points disponibles chez un organizer précis ──
    public function getAvailablePoints(User $user, OrganizerProfile $organizer): int
    {
        $conn   = $this->em->getConnection();
        $result = $conn->executeQuery(
            'SELECT SUM(points) FROM loyalty_transactions WHERE user_id = :uid AND organizer_id = :oid',
            ['uid' => $user->getId(), 'oid' => $organizer->getId()]
        )->fetchOne();

        return max(0, (int) ($result ?? 0));
    }

    // ── Total gagné tous organizers ──
    public function getTotalPointsEarned(User $user): int
    {
        $conn   = $this->em->getConnection();
        $result = $conn->executeQuery(
            'SELECT SUM(points) FROM loyalty_transactions WHERE user_id = :uid AND type = :type',
            ['uid' => $user->getId(), 'type' => 'earn']
        )->fetchOne();

        return max(0, (int) ($result ?? 0));
    }

    // ── Résumé par organizer pour le dashboard user ──
    public function getPointsByOrganizer(User $user): array
    {
        // Native SQL pour éviter les problèmes de mapping DQL
        $conn = $this->em->getConnection();
        $sql  = '
            SELECT
                op.id AS organizer_id,
                op.agency_name,
                SUM(lt.points) AS balance,
                SUM(CASE WHEN lt.type = :earn THEN lt.points ELSE 0 END) AS earned
            FROM loyalty_transactions lt
            INNER JOIN organizer_profiles op ON op.id = lt.organizer_id
            WHERE lt.user_id = :user_id
            GROUP BY op.id
        ';

        $rows = $conn->executeQuery($sql, [
            'user_id' => $user->getId(),
            'earn'    => 'earn',
        ])->fetchAllAssociative();

        return array_map(fn($row) => [
            'organizer_id' => (int) $row['organizer_id'],
            'agency_name'  => $row['agency_name'] ?: 'Agence #' . $row['organizer_id'],
            'available'    => max(0, (int) $row['balance']),
            'earned'       => max(0, (int) $row['earned']),
        ], $rows);
    }

    // ── Gagner des points après paiement ──
    public function earnPoints(User $user, Booking $booking): int
    {
        $organizer = $booking->getTrip()?->getOrganizer();
        if (!$organizer) return 0;

        $payment = $booking->getPayment();
        $amount  = $payment
            ? (float) $payment->getAmount()
            : (float) $booking->getTotalPrice();

        $points = (int) floor($amount * self::POINTS_PER_EUR);
        if ($points <= 0) return 0;

        $tx = new LoyaltyTransaction();
        $tx->setUser($user);
        $tx->setOrganizer($organizer);
        $tx->setType('earn');
        $tx->setPoints($points);
        $tx->setBooking($booking);
        $tx->setDescription(sprintf(
            'Points gagnés chez %s — réservation #%d',
            $organizer->getAgencyName(),
            $booking->getId()
        ));
        $this->em->persist($tx);
        $this->em->flush();

        return $points;
    }

    // ── Utiliser des points — uniquement chez l'organizer de l'offre ──
    public function redeemPoints(User $user, LoyaltyOffer $offer, Booking $booking): float
    {
        $organizer = $offer->getOrganizer();
        $available = $this->getAvailablePoints($user, $organizer);

        if ($available < $offer->getPointsRequired()) {
            throw new \RuntimeException(sprintf(
                'Points insuffisants chez %s: %d disponibles, %d requis',
                $organizer->getAgencyName(),
                $available,
                $offer->getPointsRequired()
            ));
        }

        $price    = (float) $booking->getTotalPrice();
        $discount = match($offer->getDiscountType()) {
            'percentage_discount' => $price * ((float)$offer->getDiscountValue() / 100),
            'fixed_discount'      => min((float)$offer->getDiscountValue(), $price),
            default               => 0.0,
        };

        $tx = new LoyaltyTransaction();
        $tx->setUser($user);
        $tx->setOrganizer($organizer);
        $tx->setType('redeem');
        $tx->setPoints(-$offer->getPointsRequired());
        $tx->setBooking($booking);
        $tx->setDescription(sprintf(
            'Offre "%s" utilisée chez %s',
            $offer->getTitle(),
            $organizer->getAgencyName()
        ));
        $this->em->persist($tx);
        $this->em->flush();

        return round($discount, 2);
    }

    // ── Historique complet ──
    public function getHistory(User $user): array
    {
        return $this->em->getRepository(LoyaltyTransaction::class)
            ->findBy(['user' => $user], ['createdAt' => 'DESC'], 30);
    }
}