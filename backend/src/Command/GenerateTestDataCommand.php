<?php

namespace App\Command;

use App\Entity\User;
use App\Entity\Role;
use App\Entity\Category;
use App\Entity\Destination;
use App\Entity\OrganizerProfile;
use App\Entity\Trip;
use App\Entity\TripSession;
use App\Entity\Booking;
use App\Entity\Payment;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:generate-test-data',
    description: 'Generate realistic test data for the application',
)]
class GenerateTestDataCommand extends Command
{
    private ?Role $roleUser = null;
    
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('🚀 Génération des données de test');
        
        // Initialize roles
        $this->initRoles($io);
        
        // Generate categories
        $categories = $this->generateCategories($io);
        
        // Generate destinations
        $destinations = $this->generateDestinations($io);
        
        // Generate regular users
        $this->generateUsers($io);
        
        // Generate organizers
        $organizers = $this->generateOrganizers($io);
        
        // Generate trips
        $trips = $this->generateTrips($io, $categories, $destinations, $organizers);
        
        // Generate bookings
        $this->generateBookings($io, $trips);
        
        $io->success('✅ Toutes les données de test ont été générées avec succès!');
        $io->note('Vous pouvez maintenant tester toutes les fonctionnalités de l\'application.');
        
        return Command::SUCCESS;
    }

    private function initRoles(SymfonyStyle $io): void
    {
        // Get or create ROLE_USER
        $this->roleUser = $this->em->getRepository(Role::class)->findOneBy(['name' => 'ROLE_USER']);
        if (!$this->roleUser) {
            $this->roleUser = new Role();
            $this->roleUser->setName('ROLE_USER');
            $this->em->persist($this->roleUser);
        }

        // Get or create ROLE_ADMIN
        $roleAdmin = $this->em->getRepository(Role::class)->findOneBy(['name' => 'ROLE_ADMIN']);
        if (!$roleAdmin) {
            $roleAdmin = new Role();
            $roleAdmin->setName('ROLE_ADMIN');
            $this->em->persist($roleAdmin);
        }
        
        // Get or create ROLE_ORGANIZER
        $roleOrganizer = $this->em->getRepository(Role::class)->findOneBy(['name' => 'ROLE_ORGANIZER']);
        if (!$roleOrganizer) {
            $roleOrganizer = new Role();
            $roleOrganizer->setName('ROLE_ORGANIZER');
            $this->em->persist($roleOrganizer);
        }
        
        $this->em->flush();
        $io->info('Roles initialisés');
    }

    private function generateCategories(SymfonyStyle $io): array
    {
        $io->section('📂 Génération des catégories');
        
        $categoriesData = [
            ['name' => 'Aventure & Randonnée', 'description' => 'Expériences aventureuses dans la nature'],
            ['name' => 'Culturel & Historique', 'description' => 'Découvrez le patrimoine historique'],
            ['name' => 'Plage & Relaxation', 'description' => 'Séjours détente au bord de la mer'],
            ['name' => 'Désert & Safari', 'description' => 'Aventure dans les dunes du Sahara'],
            ['name' => 'Gastronomie & Vin', 'description' => 'Dégustations et circuits culinaires'],
            ['name' => 'Wellness & Spa', 'description' => 'Retraites bien-être et relaxation'],
        ];

        $categories = [];
        foreach ($categoriesData as $data) {
            $category = new Category();
            $category->setName($data['name']);
            $category->setDescription($data['description']);
            $category->setCreatedAt(new \DateTimeImmutable());
            $this->em->persist($category);
            $categories[] = $category;
        }
        
        $this->em->flush();
        $io->success(sprintf('%d catégories créées', count($categories)));
        
        return $categories;
    }

    private function generateDestinations(SymfonyStyle $io): array
    {
        $io->section('🌍 Génération des destinations');
        
        $destinationsData = [
            // Tunisia
            ['name' => 'Tunis', 'country' => 'Tunisia', 'description' => 'Capitale historique et moderne', 'region' => 'Nord'],
            ['name' => 'Sousse', 'country' => 'Tunisia', 'description' => 'Station balnéaire emblématique', 'region' => 'Côte Est'],
            ['name' => 'Hammamet', 'country' => 'Tunisia', 'description' => 'Plus belle station balnéaire', 'region' => 'Côte Est'],
            ['name' => 'Djerba', 'country' => 'Tunisia', 'description' => 'Île paradise au sud', 'region' => 'Sud'],
            ['name' => 'Kairouan', 'country' => 'Tunisia', 'description' => 'Ville religieuse et historique', 'region' => 'Centre'],
            ['name' => 'Tozeur', 'country' => 'Tunisia', 'description' => 'Portes du désert', 'region' => 'Sud-Ouest'],
            ['name' => 'Douz', 'country' => 'Tunisia', 'description' => 'Kap Verde du Sahara', 'region' => 'Sud'],
            ['name' => 'Tabarka', 'country' => 'Tunisia', 'description' => 'Perle du nord-ouest', 'region' => 'Nord-Ouest'],
            ['name' => 'Sfax', 'country' => 'Tunisia', 'description' => 'Deuxième ville du pays', 'region' => 'Centre'],
            ['name' => 'Carthage', 'country' => 'Tunisia', 'description' => 'Vestiges puniques et romains', 'region' => 'Nord'],
            // Algeria
            ['name' => 'Alger', 'country' => 'Algeria', 'description' => 'Capitale blanche', 'region' => 'Nord'],
            ['name' => 'Oran', 'country' => 'Algeria', 'description' => 'Deuxième ville du pays', 'region' => 'Ouest'],
            ['name' => 'Constantine', 'country' => 'Algeria', 'description' => 'Ville des ponts', 'region' => 'Est'],
            ['name' => 'Tlemcen', 'country' => 'Algeria', 'description' => 'Patrimoine historique', 'region' => 'Ouest'],
            // Libya
            ['name' => 'Tripoli', 'country' => 'Libya', 'description' => 'Capitale libyenne', 'region' => 'Nord'],
        ];

        $destinations = [];
        foreach ($destinationsData as $data) {
            $destination = new Destination();
            $destination->setName($data['name']);
            $destination->setCountry($data['country']);
            $destination->setRegion($data['region']);
            $destination->setCreatedAt(new \DateTimeImmutable());
            $this->em->persist($destination);
            $destinations[] = $destination;
        }
        
        $this->em->flush();
        $io->success(sprintf('%d destinations créées', count($destinations)));
        
        return $destinations;
    }

    private function generateUsers(SymfonyStyle $io): void
    {
        $io->section('👥 Génération des utilisateurs');
        
        $firstNames = ['Ahmed', 'Mohamed', 'Ali', 'Sarah', 'Fatma', 'Youssef', 'Leila', 'Karim', 'Nadia', 'Bilel', 'Amira', 'Omar', 'Hafsa', 'Rami', 'Dorsaf', 'Anis', 'Mariem', 'Habib', 'Sonia', 'Med'];
        $lastNames = ['Ben Ali', 'Mansouri', 'Khaled', 'Ben Ahmed', 'Boukhalfa', 'Trabelsi', 'Saidi', 'Hamdi', 'Benzarti', 'Chaabane', 'Mahjoub', 'Bouazizi', 'Sassi', 'Jlassi', 'Haddad', 'Miled', 'Boughanmi', 'Chouchane', 'Riahi', 'Ghanem'];
        
        $userRepo = $this->em->getRepository(User::class);
        
        for ($i = 0; $i < 20; $i++) {
            $email = strtolower($firstNames[$i] . '.' . $lastNames[$i] . '@example.com');
            
            // Skip if user already exists
            if ($userRepo->findOneBy(['email' => $email])) {
                continue;
            }
            
            $user = new User();
            $user->setEmail($email);
            $user->setFirstName($firstNames[$i]);
            $user->setLastName($lastNames[$i]);
            $user->setPhone('+216' . rand(20, 99) . rand(100000, 999999));
            $user->setPassword($this->passwordHasher->hashPassword($user, 'password123'));
            $user->setIsActive(true);
            $user->addUserRole($this->roleUser);
            
            // Random country preference
            $countries = ['Tunisia', 'Algeria', 'France', 'Germany', 'Italy', 'Morocco'];
            $user->setCountry($countries[array_rand($countries)]);
            
            $this->em->persist($user);
        }
        
        $this->em->flush();
        $io->success('20 utilisateurs créés (email: prenom.nom@example.com, mot de passe: password123)');
    }

    private function generateOrganizers(SymfonyStyle $io): array
    {
        $io->section('🏢 Génération des organisateurs');
        
        $organizersData = [
            ['agency' => 'Sahara Explorers', 'firstName' => 'Abdellah', 'lastName' => 'Masmoudi', 'email' => 'abdellah@saharaexplorers.com'],
            ['agency' => 'Medina Tours', 'firstName' => 'Fathi', 'lastName' => 'Ben Ali', 'email' => 'fathi@medinatours.com'],
            ['agency' => 'Djerba Holiday', 'firstName' => 'Sami', 'lastName' => 'Trabelsi', 'email' => 'sami@djerbaholiday.com'],
            ['agency' => 'Carthage Travel', 'firstName' => 'Hichem', 'lastName' => 'Boukhris', 'email' => 'hichem@cartagetravel.com'],
            ['agency' => 'Desert Dreams', 'firstName' => 'Lotfi', 'lastName' => 'Ghanmi', 'email' => 'lotfi@desertdreams.com'],
        ];

        $organizers = [];
        $userRepo = $this->em->getRepository(User::class);
        
        foreach ($organizersData as $data) {
            // Check if organizer already exists
            $existing = $userRepo->findOneBy(['email' => $data['email']]);
            if ($existing) {
                $organizers[] = $existing;
                continue;
            }
            
            $user = new User();
            $user->setEmail($data['email']);
            $user->setFirstName($data['firstName']);
            $user->setLastName($data['lastName']);
            $user->setPhone('+216' . rand(50, 99) . rand(100000, 999999));
            $user->setPassword($this->passwordHasher->hashPassword($user, 'organizer123'));
            $user->setIsActive(true);
            
            $roleOrganizer = $this->em->getRepository(Role::class)->findOneBy(['name' => 'ROLE_ORGANIZER']);
            if ($roleOrganizer) {
                $user->addUserRole($roleOrganizer);
            }
            
            $this->em->persist($user);
            
            // Create organizer profile
            $profile = new OrganizerProfile();
            $profile->setUser($user);
            $profile->setAgencyName($data['agency']);
            $profile->setLicenseNumber('LIC-2024-' . strtoupper(uniqid()));
            $profile->setAddress(rand(1, 500) . ' Avenue de la République, Tunis');
            $profile->setCountry('Tunisia');
            $profile->setStatus('APPROVED');
            $profile->setDescription('Agence de voyages spécialisée dans les circuits en Afrique du Nord depuis plus de 10 ans.');
            
            $this->em->persist($profile);
            $organizers[] = $user;
            
            $this->em->flush();
        }
        
        $io->success(sprintf('%d organisateurs créés', count($organizers)));
        
        return $organizers;
    }

    private function generateTrips(SymfonyStyle $io, array $categories, array $destinations, array $organizers): array
    {
        $io->section('✈️ Génération des voyages');
        
        // Get organizer profiles
        $organizerProfiles = [];
        foreach ($organizers as $user) {
            $profile = $user->getOrganizerProfile();
            if ($profile) {
                $organizerProfiles[] = $profile;
            }
        }
        
        if (empty($organizerProfiles)) {
            $io->warning('Aucun profil organisateur trouvé');
            return [];
        }
        
        $tripsData = [
            ['title' => 'Circuit historique de Carthage à Djerba', 'description' => 'Découvrez les sites archéologiques de Carthage, Kairouan et terminez par l\'Île de Djerba.', 'price' => 899, 'category' => 1, 'destination' => 9, 'duration' => 7],
            ['title' => 'Randonnée dans les montagnes de l\'Atlas', 'description' => 'Partez à l\'aventure dans les montagnes du djebel ichkeul avec des guides expérimentés.', 'price' => 650, 'category' => 0, 'destination' => 7, 'duration' => 5],
            ['title' => 'Safari dans le Grand Erg Oriental', 'description' => 'Expérience inoubliable dans les dunes de Tozeur et Douz.', 'price' => 750, 'category' => 3, 'destination' => 6, 'duration' => 4],
            ['title' => 'Circuit côtier de Hammamet à Sousse', 'description' => 'Découvrez les plus belles stations balnéaires de la côte est.', 'price' => 550, 'category' => 2, 'destination' => 2, 'duration' => 5],
            ['title' => 'Week-end spa à Djerba', 'description' => 'Séjour bien-être dans les plus beaux hotels de Djerba.', 'price' => 450, 'category' => 5, 'destination' => 3, 'duration' => 3],
            ['title' => 'Circuit gastronomique Tunis-Sfax', 'description' => 'Découvrez la cuisine tunisienne authentique.', 'price' => 700, 'category' => 4, 'destination' => 0, 'duration' => 6],
            ['title' => 'Aventure Tabarka et ses cascades', 'description' => 'Explorez le nord-ouest sauvage de la Tunisie.', 'price' => 480, 'category' => 0, 'destination' => 7, 'duration' => 4],
            ['title' => 'Immersion spirituelle à Kairouan', 'description' => 'Visitez la ville sacrée et ses monuments historiques.', 'price' => 380, 'category' => 1, 'destination' => 4, 'duration' => 3],
            ['title' => 'Plongée à Djerba', 'description' => 'Découvrez les fonds marins de l\'Île de Djerba.', 'price' => 620, 'category' => 2, 'destination' => 3, 'duration' => 5],
            ['title' => 'Chasse au trésor à Tunis', 'description' => 'Parcourez la médina de Tunis de manière ludique.', 'price' => 150, 'category' => 1, 'destination' => 0, 'duration' => 1],
            // Algeria trips
            ['title' => 'Circuit Alger la Blanche', 'description' => 'Découvrez la capitale algérienne et ses monuments coloniaux.', 'price' => 550, 'category' => 1, 'destination' => 10, 'duration' => 4],
            ['title' => 'Tlemcen historique', 'description' => 'Explorez la ville historique de Tlemcen et ses mosquées.', 'price' => 480, 'category' => 1, 'destination' => 13, 'duration' => 3],
            ['title' => 'Constantine la ville des ponts', 'description' => 'Visitez l\'une des plus anciennes villes du monde.', 'price' => 420, 'category' => 1, 'destination' => 12, 'duration' => 3],
            // Libya trips
            ['title' => 'Tripoli antique', 'description' => 'Découvrez les ruines romaines de Tripoli et ses environs.', 'price' => 680, 'category' => 1, 'destination' => 14, 'duration' => 5],
            ['title' => 'Circuit libyen complet', 'description' => 'De Tripoli à Benghazi, un voyage à travers l\'histoire.', 'price' => 1200, 'category' => 1, 'destination' => 14, 'duration' => 8],
            // Multi-country trips
            ['title' => 'Traces de la civilisation', 'description' => 'Circuit couvrant la Tunisie et l\'Algérie.', 'price' => 1500, 'category' => 1, 'destination' => 0, 'duration' => 10],
            ['title' => 'Maghrébin adventure', 'description' => 'Aventure complète à travers la Tunisie, l\'Algérie et la Libye.', 'price' => 2500, 'category' => 0, 'destination' => 0, 'duration' => 15],
            // Additional Tunisia trips
            ['title' => 'Yoga retreat Djerba', 'description' => 'Retraite de yoga et meditation à Djerba.', 'price' => 800, 'category' => 5, 'destination' => 3, 'duration' => 7],
            ['title' => 'Camping dans le désert', 'description' => 'Nuit sous les étoiles dans le Sahara tunisien.', 'price' => 350, 'category' => 3, 'destination' => 5, 'duration' => 3],
            ['title' => 'Cote nord tunisienne', 'description' => 'De Tabarka à Bizerte, les beautés du nord.', 'price' => 520, 'category' => 2, 'destination' => 7, 'duration' => 5],
            ['title' => 'Kairouan et Sbeitla', 'description' => 'Les sites archéologiques du centre tunisien.', 'price' => 450, 'category' => 1, 'destination' => 4, 'duration' => 4],
            ['title' => 'Flots bleues', 'description' => 'Croisière et découverte des îles tunisiennes.', 'price' => 950, 'category' => 2, 'destination' => 3, 'duration' => 6],
            ['title' => 'Aventure saharienne', 'description' => 'Quads et desert à Tozeur.', 'price' => 580, 'category' => 0, 'destination' => 5, 'duration' => 4],
            ['title' => 'Heritage ottoman', 'description' => 'Circuit architectural ottoman en Tunisie.', 'price' => 420, 'category' => 1, 'destination' => 1, 'duration' => 3],
            ['title' => 'Saveurs du sud', 'description' => 'Gastronomie du sud tunisien.', 'price' => 550, 'category' => 4, 'destination' => 5, 'duration' => 5],
            ['title' => 'De la medina aux plages', 'description' => 'Mix de découverte culturelle et farniente.', 'price' => 750, 'category' => 1, 'destination' => 2, 'duration' => 7],
            ['title' => 'Sunset Djerba', 'description' => 'Romantisme au coucher du soleil à Djerba.', 'price' => 680, 'category' => 5, 'destination' => 3, 'duration' => 5],
        ];

        $trips = [];
        
        foreach ($tripsData as $index => $data) {
            $trip = new Trip();
            $trip->setTitle($data['title']);
            $trip->setShortDescription($data['description']);
            $trip->setLongDescription($data['description'] . ' Ce circuit vous plongera dans l\'histoire riche de la région et vous fera découvrir des paysages à couper le souffle.');
            $trip->setBasePrice((string)$data['price']);
            $trip->setDurationDays($data['duration']);
            $trip->setDifficultyLevel(['easy', 'medium', 'difficult'][array_rand(['easy', 'medium', 'difficult'])]);
            $trip->setIsActive(true);
            $trip->setCreatedAt(new \DateTimeImmutable());
            
            // Set organizer (OrganizerProfile)
            $trip->setOrganizer($organizerProfiles[$index % count($organizerProfiles)]);
            
            // Add category
            $trip->addCategory($categories[$data['category']]);
            
            // Add destination
            $trip->addDestination($destinations[$data['destination']]);
            
            $this->em->persist($trip);
            $trips[] = $trip;
            
            // Generate sessions for each trip
            $this->generateSessions($trip, $data['duration']);
            
            $this->em->flush();
        }
        
        $io->success(sprintf('%d voyages créés avec leurs sessions', count($trips)));
        
        return $trips;
    }

    private function generateSessions(Trip $trip, int $duration): void
    {
        $startDate = new \DateTime();
        $startDate->modify('+' . rand(1, 30) . ' days');
        
        // Generate 2-4 sessions per trip
        $sessionCount = rand(2, 4);
        
        for ($i = 0; $i < $sessionCount; $i++) {
            $sessionDate = clone $startDate;
            $sessionDate->modify('+' . ($i * ($duration + 2)) . ' days');
            
            $endDate = clone $sessionDate;
            $endDate->modify('+' . $duration . ' days');
            
            $session = new TripSession();
            $session->setTrip($trip);
            $session->setStartDate($sessionDate);
            $session->setEndDate($endDate);
            $session->setMaxCapacity(rand(10, 40));
            $session->setStatus('OPEN');
            
            $this->em->persist($session);
        }
    }

    private function generateBookings(SymfonyStyle $io, array $trips): void
    {
        $io->section('📋 Génération des réservations');
        
        $userRepo = $this->em->getRepository(User::class);
        $users = $userRepo->findAll();
        
        // Filter only regular users (not organizers or admin)
        $regularUsers = [];
        foreach ($users as $user) {
            $roles = $user->getRoles();
            if (!in_array('ROLE_ORGANIZER', $roles) && !in_array('ROLE_ADMIN', $roles)) {
                $regularUsers[] = $user;
            }
        }
        
        if (empty($regularUsers)) {
            $io->warning('Aucun utilisateur régulier trouvé');
            return;
        }
        
        $statuses = ['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
        
        for ($i = 0; $i < 50; $i++) {
            $trip = $trips[array_rand($trips)];
            $user = $regularUsers[array_rand($regularUsers)];
            
            // Get a session
            $sessions = $trip->getSessions();
            if ($sessions->isEmpty()) {
                continue;
            }
            $session = $sessions[array_rand($sessions->toArray())];
            
            $booking = new Booking();
            $booking->setTrip($trip);
            $booking->setUser($user);
            $booking->setTripSession($session);
            $booking->setNumTravelers(rand(1, 4));
            $booking->setTotalPrice((string)((int)$trip->getBasePrice() * $booking->getNumTravelers()));
            $booking->setCurrency('TND');
            $booking->setStatus($statuses[array_rand($statuses)]);
            $booking->setCreatedAt(new \DateTimeImmutable());
            
            // Random booking date (past)
            $bookingDate = new \DateTime();
            $bookingDate->modify('-' . rand(1, 60) . ' days');
            $booking->setCreatedAt(\DateTimeImmutable::createFromMutable($bookingDate));
            
            $this->em->persist($booking);
            
            // Generate payment for confirmed/completed bookings
            if ($booking->getStatus() === 'CONFIRMED' || $booking->getStatus() === 'COMPLETED') {
                $payment = new Payment();
                $payment->setBooking($booking);
                $payment->setAmount($booking->getTotalPrice());
                $payment->setCurrency('TND');
                $payment->setMethod(rand(0, 1) ? 'CARD' : 'CASH');
                $payment->setStatus('COMPLETED');
                
                $paymentDate = clone $bookingDate;
                $paymentDate->modify('+' . rand(1, 3) . ' days');
                $payment->setPaidAt($paymentDate);
                
                $this->em->persist($payment);
            }
        }
        
        $this->em->flush();
        $io->success('50 réservations créées avec paiements');
    }
}
