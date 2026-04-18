<?php

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use App\Entity\OrganizerProfile;
use App\Entity\Booking;
use App\Entity\Trip;
use Doctrine\ORM\EntityManagerInterface;

class NotificationService
{
    public function __construct(
        private EntityManagerInterface $em
    ) {}

    public function create(User $user, string $title, string $message, string $type): Notification
    {
        $notification = new Notification();
        $notification->setUser($user);
        $notification->setTitle($title);
        $notification->setMessage($message);
        $notification->setType($type);
        $notification->setIsRead(false);

        $this->em->persist($notification);
        $this->em->flush();

        return $notification;
    }

    public function notifyAdmins(string $title, string $message, string $type): void
    {
        $admins = $this->em->getRepository(User::class)->createQueryBuilder('u')
            ->andWhere('u.roles LIKE :role')
            ->setParameter('role', '%ROLE_ADMIN%')
            ->getQuery()
            ->getResult();

        foreach ($admins as $admin) {
            $this->create($admin, $title, $message, $type);
        }
    }

    public function notifyOrganizer(string $title, string $message, string $type): void
    {
        $organizers = $this->em->getRepository(User::class)->createQueryBuilder('u')
            ->andWhere('u.roles LIKE :role')
            ->setParameter('role', '%ROLE_ORGANIZER%')
            ->getQuery()
            ->getResult();

        foreach ($organizers as $organizer) {
            $this->create($organizer, $title, $message, $type);
        }
    }

    public function notifyTripBookings(Trip $trip, string $title, string $message, string $type, ?User $excludeUser = null): void
    {
        $bookings = $this->em->getRepository(Booking::class)->findBy([
            'trip' => $trip,
            'status' => 'CONFIRMED',
        ]);

        foreach ($bookings as $booking) {
            $user = $booking->getUser();
            if ($excludeUser && $user->getId() === $excludeUser->getId()) {
                continue;
            }
            $this->create($user, $title, $message, $type);
        }
    }

    public function notifyOrganizerProfile(OrganizerProfile $profile, string $title, string $message, string $type): void
    {
        $user = $profile->getUser();
        $this->create($user, $title, $message, $type);
    }

    // ============================================================
    // CAS 1: Welcome - Inscription user
    // ============================================================
    public function notifyWelcome(User $user): void
    {
        $this->create(
            $user,
            'Bienvenue sur TripBooking!',
            'Merci de vous être inscrit(e). Découvrez nos voyages incroyables et commencez votre prochaine aventure!',
            'welcome'
        );
    }

    // ============================================================
    // CAS 2: Demande organisateur
    // ============================================================
    public function notifyOrganizerRequest(User $user): void
    {
        $fullName = $user->getFirstName() . ' ' . $user->getLastName();
        
        $this->notifyAdmins(
            'Nouvelle demande Organisateur',
            "$fullName a demandé à devenir organisateur. Veuillez examiner sa demande.",
            'organizer_request'
        );
    }

    // ============================================================
    // CAS 3: Organisateur approuvé
    // ============================================================
    public function notifyOrganizerApproved(OrganizerProfile $profile): void
    {
        $this->notifyOrganizerProfile(
            $profile,
            'Demande acceptée',
            'Félicitations! Votre demande pour devenir organisateur a été acceptée. Vous pouvez maintenant créer vos propres voyages.',
            'organizer_approved'
        );
    }

    // ============================================================
    // CAS 4: Organisateur rejeté
    // ============================================================
    public function notifyOrganizerRejected(OrganizerProfile $profile, string $reason = ''): void
    {
        $message = 'Votre demande pour devenir organisateur a été rejetée.';
        if ($reason) {
            $message .= " Raison: $reason";
        }
        
        $this->notifyOrganizerProfile(
            $profile,
            'Demande rejetée',
            $message,
            'organizer_rejected'
        );
    }

    // ============================================================
    // CAS 5: Nouvelle réservation (vers organisateur)
    // ============================================================
    public function notifyNewBooking(Booking $booking): void
    {
        $trip = $booking->getTrip();
        $user = $booking->getUser();
        $userName = $user->getFirstName() . ' ' . $user->getLastName();
        
        $organizer = $trip->getOrganizer();
        if ($organizer && $organizer->getUser()) {
            $this->create(
                $organizer->getUser(),
                'Nouvelle réservation',
                "$userName a réservé le voyage \"{$trip->getTitle()}\" pour {$booking->getNumTravelers()} personnes.",
                'booking_created'
            );
        }
    }

    // ============================================================
    // CAS 6: Réservation confirmée (vers voyageur)
    // ============================================================
    public function notifyBookingConfirmed(Booking $booking): void
    {
        $trip = $booking->getTrip();
        $user = $booking->getUser();
        
        $this->create(
            $user,
            'Réservation confirmée',
            "Votre réservation pour le voyage \"{$trip->getTitle()}\" a été confirmée! Nous vous attendons avec impatience.",
            'booking_confirmed'
        );
    }

    // ============================================================
    // CAS 7: Réservation en attente de confirmation (vers voyageur)
    // ============================================================
    public function notifyPendingBooking(Booking $booking): void
    {
        $trip = $booking->getTrip();
        $user = $booking->getUser();
        
        $this->create(
            $user,
            'En attente de confirmation',
            "Votre réservation pour \"{$trip->getTitle()}\" est en attente de confirmation par l'organisateur.",
            'booking_pending'
        );
    }

    // ============================================================
    // CAS 8: Annulation réservation par user (vers organisateur)
    // ============================================================
    public function notifyBookingCancelled(Booking $booking): void
    {
        $trip = $booking->getTrip();
        $user = $booking->getUser();
        $userName = $user->getFirstName() . ' ' . $user->getLastName();
        
        $organizer = $trip->getOrganizer();
        if ($organizer && $organizer->getUser()) {
            $this->create(
                $organizer->getUser(),
                'Réservation annulée',
                "$userName a annulé sa réservation pour le voyage \"{$trip->getTitle()}\".",
                'booking_cancelled'
            );
        }
    }

    // ============================================================
    // CAS 9: Annulation réservation par organisateur (vers user)
    // ============================================================
    public function notifyBookingCancelledByOrganizer(Booking $booking): void
    {
        $trip = $booking->getTrip();
        $user = $booking->getUser();
        
        $this->create(
            $user,
            'Réservation annulée par l\'organisateur',
            "L'organisateur a annulé votre réservation pour le voyage \"{$trip->getTitle()}\". Le remboursement sera traité sous 14 jours.",
            'booking_cancelled_by_organizer'
        );
    }

    // ============================================================
    // CAS 10: Voyage annulé par organisateur (vers voyageurs)
    // ============================================================
    public function notifyTripCancelled(Trip $trip): void
    {
        $this->notifyTripBookings(
            $trip,
            'Voyage annulé',
            "Le voyage \"{$trip->getTitle()}\" a été annulé par l'organisateur. Veuillez contacter le support pour le remboursement.",
            'trip_cancelled'
        );
    }

    // ============================================================
    // CAS 10b: Session annulée (vers voyageurs de cette session)
    // ============================================================
    public function notifySessionCancelled(\App\Entity\TripSession $session): void
    {
        $trip = $session->getTrip();
        $sessionDate = $session->getStartDate()->format('d/m/Y');
        
        $bookings = $this->em->getRepository(\App\Entity\Booking::class)->findBy([
            'tripSession' => $session,
            'status' => 'CONFIRMED',
        ]);

        foreach ($bookings as $booking) {
            $user = $booking->getUser();
            $this->create(
                $user,
                'Session annulée',
                "La session du {$session->getStartDate()->format('d/m/Y')} pour le voyage \"{$trip->getTitle()}\" a été annulée par l'organisateur. Le remboursement sera traité sous 14 jours.",
                'session_cancelled'
            );
        }
    }

    // ============================================================
    // CAS 11: Voyage reprogrammé (date modifiée)
    // ============================================================
    public function notifyTripRescheduled(Trip $trip, string $oldDate, string $newDate): void
    {
        $this->notifyTripBookings(
            $trip,
            'Date de voyage modifiée',
            "Le voyage \"{$trip->getTitle()}\" a été reprogrammé du $oldDate au $newDate.",
            'trip_rescheduled',
            null
        );
    }

    // ============================================================
    // CAS 12: Voyage upcoming (48h avant)
    // ============================================================
    public function notifyTripUpcoming(Trip $trip): void
    {
        $sessions = $trip->getSessions();
        $upcomingDate = new \DateTime('+48 hours');
        
        foreach ($sessions as $session) {
            $startDate = $session->getStartDate();
            if ($startDate && $startDate->format('Y-m-d') === $upcomingDate->format('Y-m-d')) {
                $this->notifyTripBookings(
                    $trip,
                    'Voyage demain!',
                    "Le voyage \"{$trip->getTitle()}\" commence demain. Préparez-vous pour une aventure inoubliable!",
                    'trip_upcoming',
                    null
                );
            }
        }
    }

    // ============================================================
    // CAS 13: Paiement réussi
    // ============================================================
    public function notifyPaymentSuccess(Booking $booking): void
    {
        $trip = $booking->getTrip();
        $user = $booking->getUser();
        
        $this->create(
            $user,
            'Paiement réussi',
            "Votre paiement de {$booking->getTotalPrice()} {$booking->getCurrency()} pour \"{$trip->getTitle()}\" a été reçu.",
            'payment_success'
        );
    }

    // ============================================================
    // CAS 14: Paiement échoué
    // ============================================================
    public function notifyPaymentFailed(Booking $booking): void
    {
        $trip = $booking->getTrip();
        $user = $booking->getUser();
        
        $this->create(
            $user,
            'Paiement échoué',
            "Le paiement pour votre réservation de \"{$trip->getTitle()}\" a échoué. Veuillez réessayer.",
            'payment_failed'
        );
    }

    // ============================================================
    // CAS 15: Remboursement traité
    // ============================================================
    public function notifyRefundProcessed(Booking $booking): void
    {
        $trip = $booking->getTrip();
        $user = $booking->getUser();
        
        $this->create(
            $user,
            'Remboursement traitée',
            "Le remboursement de {$booking->getTotalPrice()} {$booking->getCurrency()} pour \"{$trip->getTitle()}\" a été traité.",
            'refund_processed'
        );
    }

    // ============================================================
    // CAS 16: Demande d'avis après voyage
    // ============================================================
    public function notifyReviewRequest(Booking $booking): void
    {
        $trip = $booking->getTrip();
        $user = $booking->getUser();
        
        $this->create(
            $user,
            'Partagez votre expérience!',
            "Vous avez récemment voyagé avec \"{$trip->getTitle()}\". Laissez un avis pour aider les autres voyageurs.",
            'review_request'
        );
    }

    // ============================================================
    // CAS 17: Nouveau avis (à approuver) pour organisateur
    // ============================================================
    public function notifyNewReview(Trip $trip): void
    {
        $organizer = $trip->getOrganizer();
        if ($organizer && $organizer->getUser()) {
            $this->create(
                $organizer->getUser(),
                'Nouvel avis en attente',
                "Un nouvel avis pour \"{$trip->getTitle()}\" est en attente d'approbation.",
                'new_review'
            );
        }
    }

    // ============================================================
    // CAS 18: Nouveau utilisateur inscrit (vers admin)
    // ============================================================
    public function notifyNewUser(User $user): void
    {
        $fullName = $user->getFirstName() . ' ' . $user->getLastName();
        
        $this->notifyAdmins(
            'Nouvel utilisateur',
            "$fullName s'est inscrit sur la plateforme.",
            'new_user'
        );
    }

    // ============================================================
    // CAS 19: Baisse de places disponibles (vers organisateur)
    // ============================================================
    public function notifyLowAvailability(Trip $trip, int $availableSeats): void
    {
        $organizer = $trip->getOrganizer();
        if ($organizer && $organizer->getUser() && $availableSeats <= 5) {
            $this->create(
                $organizer->getUser(),
                'Places limitées',
                "Il ne reste que $availableSeats places pour \"{$trip->getTitle()}\". Pensez à ouvrir de nouvelles sessions.",
                'low_availability'
            );
        }
    }

    public function markAsRead(int $notificationId): ?Notification
    {
        $notification = $this->em->getRepository(Notification::class)->find($notificationId);
        
        if ($notification) {
            $notification->setIsRead(true);
            $this->em->flush();
        }

        return $notification;
    }

    public function getUnreadCount(User $user): int
    {
        return $this->em->getRepository(Notification::class)->count([
            'user' => $user,
            'isRead' => false,
        ]);
    }

    public function getUnreadCountByType(User $user, string $type): int
    {
        return $this->em->getRepository(Notification::class)->count([
            'user' => $user,
            'isRead' => false,
            'type' => $type,
        ]);
    }
}