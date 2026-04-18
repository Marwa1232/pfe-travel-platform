<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Role;
use App\Entity\Trip;
use App\Entity\TripSession;
use App\Entity\TripProgram;
use App\Entity\Destination;
use App\Entity\Category;
use App\Entity\OrganizerProfile;
use App\Entity\Booking;
use App\Entity\Review;
use App\Entity\Moment;
use App\Entity\MomentMedia;
use App\Entity\Favorite;
use App\Entity\Notification;
use App\Entity\Payment;
use App\Entity\CancellationPolicy;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private array $tripSessions = [];

    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function load(ObjectManager $manager): void
    {
        // ===== ROLES =====
        $roleAdmin = new Role();
        $roleAdmin->setName('ROLE_ADMIN');
        $manager->persist($roleAdmin);
        
        $roleOrganizer = new Role();
        $roleOrganizer->setName('ROLE_ORGANIZER');
        $manager->persist($roleOrganizer);
        
        $roleUser = new Role();
        $roleUser->setName('ROLE_USER');
        $manager->persist($roleUser);
        
        $manager->flush();
        
        // ===== USERS =====
        $admin = new User();
        $admin->setEmail('admin@appfe.com')
            ->setFirstName('Admin')->setLastName('User')
            ->setPassword($this->passwordHasher->hashPassword($admin, 'admin123'))
            ->setCountry('Tunisia')->setPreferredLanguage('fr')->setPreferredCurrency('TND')->setIsActive(true)
            ->addUserRole($roleAdmin);
        $manager->persist($admin);

        $organizer = new User();
        $organizer->setEmail('organizer@appfe.com')
            ->setFirstName('Ahmed')->setLastName('Ben Ali')
            ->setPassword($this->passwordHasher->hashPassword($organizer, 'organizer123'))
            ->setCountry('Tunisia')->setPreferredLanguage('fr')->setPreferredCurrency('TND')
            ->setStatusOrganizer('approved')->setIsActive(true)
            ->addUserRole($roleOrganizer);
        $manager->persist($organizer);

        $organizerProfile = new OrganizerProfile();
        $organizerProfile->setUser($organizer)->setAgencyName('Tunisia Travel')->setCountry('Tunisia')
            ->setStatus('approved')->setDescription('Agence de voyage')->setExperience('10 ans')->setLicenseNumber('LIC-001');
        $manager->persist($organizerProfile);

        $user = new User();
        $user->setEmail('user@appfe.com')
            ->setFirstName('Mohamed')->setLastName('Salah')
            ->setPassword($this->passwordHasher->hashPassword($user, 'user123'))
            ->setCountry('France')->setPreferredLanguage('fr')->setPreferredCurrency('EUR')->setIsActive(true)
            ->addUserRole($roleUser);
        $manager->persist($user);

        $user2 = new User();
        $user2->setEmail('user2@appfe.com')
            ->setFirstName('Sophie')->setLastName('Dubois')
            ->setPassword($this->passwordHasher->hashPassword($user2, 'user123'))
            ->setCountry('Canada')->setPreferredLanguage('en')->setPreferredCurrency('USD')->setIsActive(true)
            ->addUserRole($roleUser);
        $manager->persist($user2);

        // ===== DESTINATIONS (North Africa only) =====
        $destinations = [
            ['name' => 'Djerba', 'country' => 'Tunisia', 'region' => 'Medenine'],
            ['name' => 'Sidi Bou Said', 'country' => 'Tunisia', 'region' => 'Tunis'],
            ['name' => 'Kairouan', 'country' => 'Tunisia', 'region' => 'Kairouan'],
            ['name' => 'Tozeur', 'country' => 'Tunisia', 'region' => 'Tozeur'],
            ['name' => 'Sahara', 'country' => 'Tunisia', 'region' => 'Kebili'],
            ['name' => 'Carthage', 'country' => 'Tunisia', 'region' => 'Tunis'],
            ['name' => 'Tabarka', 'country' => 'Tunisia', 'region' => 'Jendouba'],
            ['name' => 'Hammamet', 'country' => 'Tunisia', 'region' => 'Nabeul'],
            ['name' => ' Alger', 'country' => 'Algeria', 'region' => 'Alger'],
            ['name' => 'Casablanca', 'country' => 'Morocco', 'region' => 'Casablanca'],
            ['name' => 'Marrakech', 'country' => 'Morocco', 'region' => 'Marrakech'],
            ['name' => 'Tripoli', 'country' => 'Libya', 'region' => 'Tripoli'],
            ['name' => 'Le Caire', 'country' => 'Egypt', 'region' => 'Cairo'],
            ['name' => 'Alexandrie', 'country' => 'Egypt', 'region' => 'Alexandria'],
        ];
        $destEntities = [];
        foreach ($destinations as $d) {
            $dest = new Destination();
            $dest->setName($d['name'])->setCountry($d['country'])->setRegion($d['region'])->setIsActive(true);
            $manager->persist($dest);
            $destEntities[] = $dest;
        }

        // ===== CATEGORIES =====
        $categories = ['Adventure', 'Culturel', 'Plage', 'Montagne', 'Ville', 'Rural', 'Luxury'];
        $catEntities = [];
        foreach ($categories as $catName) {
            $cat = new Category();
            $cat->setName($catName)->setDescription('Voyage ' . $catName);
            $manager->persist($cat);
            $catEntities[] = $cat;
        }

        // ===== TRIPS WITH SESSIONS (North Africa) =====
        $tripsData = [
            ['title' => 'Week-end à Djerba', 'price' => 450, 'days' => 3, 'desc' => 'Découvrez Djerba', 'diff' => 'easy'],
            ['title' => 'Circuit Kairouan', 'price' => 350, 'days' => 2, 'desc' => 'Visitez Kairouan', 'diff' => 'medium'],
            ['title' => 'Aventure saharienne', 'price' => 650, 'days' => 5, 'desc' => 'Désert du Sahara', 'diff' => 'hard'],
            ['title' => 'Randonnée au djurdjura', 'price' => 520, 'days' => 4, 'desc' => 'Montagnes de l\'Aurés', 'diff' => 'hard'],
            ['title' => 'Escapade Hammamet', 'price' => 380, 'days' => 3, 'desc' => 'Plage et détente', 'diff' => 'easy'],
            ['title' => 'Circuit Marrakech', 'price' => 890, 'days' => 5, 'desc' => 'Perles du Maroc', 'diff' => 'medium'],
            ['title' => 'Route des ksours', 'price' => 750, 'days' => 6, 'desc' => 'Ksours et oasis', 'diff' => 'medium'],
            ['title' => 'Cairo Express', 'price' => 680, 'days' => 4, 'desc' => 'Splendeurs d\'Egypte', 'diff' => 'easy'],
        ];

        $tripEntities = [];
        foreach ($tripsData as $i => $data) {
            $trip = new Trip();
            $trip->setTitle($data['title'])->setShortDescription($data['desc'])->setLongDescription($data['desc'])
                ->setBasePrice($data['price'])->setCurrency('TND')->setDurationDays($data['days'])->setDifficultyLevel($data['diff'])
                ->setIsActive(true)->setStatus('published')->setOrganizer($organizerProfile)
                ->addDestination($destEntities[$i % count($destEntities)])
                ->addCategory($catEntities[$i % count($catEntities)]);
            $manager->persist($trip);
            $tripEntities[] = $trip;

            // Trip Program
            for ($d = 1; $d <= $data['days']; $d++) {
                $program = new TripProgram();
                $program->setTrip($trip)->setDayNumber($d)->setTitle('Jour ' . $d)->setDescription('Activités du jour ' . $d);
                $manager->persist($program);
            }

            // Session
            $month = ($i < 4) ? 5 : 6;
            $day = ($i % 4) * 3 + 1;
            $startDate = new \DateTime("2026-$month-$day");
            $endDate = clone $startDate;
            $endDate->modify('+' . ($data['days'] - 1) . ' days');
            
            $session = new TripSession();
            $session->setTrip($trip)->setStartDate($startDate)->setEndDate($endDate)->setMaxCapacity(20)->setStatus('open');
            $manager->persist($session);
            $this->tripSessions[$i] = $session;

            // Cancellation Policy
            $policy = new CancellationPolicy();
            $policy->setTrip($trip)->setRulesJson([
                ['days' => 30, 'refund_percent' => 100],
                ['days' => 15, 'refund_percent' => 50],
            ])->setAllowVoucher(true)->setAllowRebooking(true);
            $manager->persist($policy);
        }

        $manager->flush();

        // ===== BOOKINGS =====
        $booking1 = new Booking();
        $booking1->setUser($user)->setTrip($tripEntities[0])->setTripSession($this->tripSessions[0])
            ->setNumTravelers(2)->setTotalPrice(900)->setCurrency('TND')->setStatus('CONFIRMED');
        $manager->persist($booking1);

        $booking2 = new Booking();
        $booking2->setUser($user2)->setTrip($tripEntities[2])->setTripSession($this->tripSessions[2])
            ->setNumTravelers(1)->setTotalPrice(890)->setCurrency('EUR')->setStatus('CONFIRMED');
        $manager->persist($booking2);

        $booking3 = new Booking();
        $booking3->setUser($user)->setTrip($tripEntities[4])->setTripSession($this->tripSessions[4])
            ->setNumTravelers(3)->setTotalPrice(1560)->setCurrency('TND')->setStatus('PENDING');
        $manager->persist($booking3);

        // ===== PAYMENTS =====
        $payment1 = new Payment();
        $payment1->setBooking($booking1)->setAmount(900)->setCurrency('TND')->setMethod('card')
            ->setStatus('completed')->setTransactionRef('TXN-001')->setPaidAt(new \DateTime());
        $manager->persist($payment1);

        $payment2 = new Payment();
        $payment2->setBooking($booking2)->setAmount(890)->setCurrency('EUR')->setMethod('card')
            ->setStatus('completed')->setTransactionRef('TXN-002')->setPaidAt(new \DateTime());
        $manager->persist($payment2);

        // ===== REVIEWS =====
        $review1 = new Review();
        $review1->setUser($user)->setTrip($tripEntities[0])->setRating(5)->setComment('Excellent!')->setStatus('approved');
        $manager->persist($review1);

        $review2 = new Review();
        $review2->setUser($user2)->setTrip($tripEntities[2])->setRating(4)->setComment('Très bien')->setStatus('approved');
        $manager->persist($review2);

        // ===== FAVORITES =====
        $fav1 = new Favorite();
        $fav1->setUser($user)->setTrip($tripEntities[1]);
        $manager->persist($fav1);

        $fav2 = new Favorite();
        $fav2->setUser($user)->setTrip($tripEntities[3]);
        $manager->persist($fav2);

        // ===== MOMENTS =====
        $moment1 = new Moment();
        $moment1->setUser($user)->setTrip($tripEntities[0])->setBooking($booking1)->setContent('Super voyage!');
        $manager->persist($moment1);

        $media1 = new MomentMedia();
        $media1->setMoment($moment1)->setUrl('/uploads/moments/djerba.jpg')->setType('image');
        $manager->persist($media1);

        $moment2 = new Moment();
        $moment2->setUser($user2)->setTrip($tripEntities[2])->setBooking($booking2)->setContent('Paris magnifique!');
        $manager->persist($moment2);

        // ===== NOTIFICATIONS =====
        $notif1 = new Notification();
        $notif1->setUser($user)->setTitle('Booking confirmé')->setMessage('Réservation confirmée')->setType('booking')->setIsRead(false);
        $manager->persist($notif1);

        $notif2 = new Notification();
        $notif2->setUser($organizer)->setTitle('Nouvelle réservation')->setMessage('Nouvelle réservation!')->setType('booking')->setIsRead(false);
        $manager->persist($notif2);

        $manager->flush();

        echo "\n=== Fixtures loaded! ===\n";
        echo "Admin: admin@appfe.com / admin123\n";
        echo "Organizer: organizer@appfe.com / organizer123\n";
        echo "User: user@appfe.com / user123\n";
        echo "User2: user2@appfe.com / user123\n";
    }
}