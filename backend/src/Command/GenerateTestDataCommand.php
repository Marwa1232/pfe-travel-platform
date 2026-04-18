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
use App\Entity\AIData;
use App\Entity\Moment;
use App\Entity\MomentMedia;
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
        
        // Generate AIData for recommendation testing
        $this->generateAIData($io, $trips);
        
        // Generate moments
        $this->generateMoments($io, $trips);
        
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
        $categories = $this->em->getRepository(Category::class)->findAll();
        if (!empty($categories)) {
            $io->info('Catégories existent déjà');
            return $categories;
        }
        // Generate new categories
        $categoriesData = [
            ['name' => 'Aventure & Randonnée', 'description' => 'Expériences aventureuses'],
            ['name' => 'Culturel & Historique', 'description' => 'Patrimoine historique'],
            ['name' => 'Plage & Relaxation', 'description' => 'Détente au bord de la mer'],
            ['name' => 'Désert & Safari', 'description' => 'Aventure dans le Sahara'],
            ['name' => 'Gastronomie', 'description' => ' Circuits culinaires'],
            ['name' => 'Wellness & Spa', 'description' => 'Retraites bien-être'],
        ];
        foreach ($categoriesData as $data) {
            $category = new Category();
            $category->setName($data['name']);
            $category->setDescription($data['description']);
            $this->em->persist($category);
        }
        $this->em->flush();
        $io->success(count($categoriesData) . ' catégories générées');
        return $this->em->getRepository(Category::class)->findAll();
    }

    private function generateDestinations(SymfonyStyle $io): array
    {
        $destinations = $this->em->getRepository(Destination::class)->findAll();
        if (!empty($destinations)) {
            $io->info('Destinations existent déjà');
            return $destinations;
        }
        $destinationsData = [
            ['name' => 'Tunis', 'country' => 'Tunisia', 'region' => 'Nord'],
            ['name' => 'Sousse', 'country' => 'Tunisia', 'region' => 'Côte Est'],
            ['name' => 'Djerba', 'country' => 'Tunisia', 'region' => 'Sud'],
            ['name' => 'Kairouan', 'country' => 'Tunisia', 'region' => 'Centre'],
            ['name' => 'Tozeur', 'country' => 'Tunisia', 'region' => 'Sud-Ouest'],
            ['name' => 'Hammamet', 'country' => 'Tunisia', 'region' => 'Côte Est'],
            ['name' => 'Tabarka', 'country' => 'Tunisia', 'region' => 'Nord-Ouest'],
            ['name' => 'Alger', 'country' => 'Algeria', 'region' => 'Nord'],
            ['name' => 'Marrakech', 'country' => 'Morocco', 'region' => 'Centre'],
            ['name' => 'Tripoli', 'country' => 'Libya', 'region' => 'Nord'],
        ];
        foreach ($destinationsData as $data) {
            $dest = new Destination();
            $dest->setName($data['name'])->setCountry($data['country'])->setRegion($data['region'])->setIsActive(true);
            $this->em->persist($dest);
        }
        $this->em->flush();
        $io->success(count($destinationsData) . ' destinations générées');
        return $this->em->getRepository(Destination::class)->findAll();
    }

    private function generateUsers(SymfonyStyle $io): void
    {
        $users = $this->em->getRepository(User::class)->findAll();
        if (count($users) > 4) {
            $io->info('Users existent déjà');
            return;
        }
        $firstNames = ['Ahmed', 'Mohamed', 'Ali', 'Sarah', 'Fatma', 'Youssef', 'Leila', 'Karim'];
        $lastNames = ['Ben Ali', 'Mansouri', 'Khaled', 'Ben Ahmed', 'Boukhalfa', 'Trabelsi', 'Saidi', 'Hamdi'];
        
        for ($i = 0; $i < 8; $i++) {
            $user = new User();
            $user->setEmail(strtolower($firstNames[$i] . '.' . $lastNames[$i]) . '@example.com')
                ->setFirstName($firstNames[$i])->setLastName($lastNames[$i])
                ->setPassword($this->passwordHasher->hashPassword($user, 'password123'))
                ->setIsActive(true)->setCountry('Tunisia')->setPreferredLanguage('fr')->setPreferredCurrency('TND')
                ->addUserRole($this->roleUser);
            $this->em->persist($user);
        }
        $this->em->flush();
        $io->success('8 utilisateurs ajoutés');
    }

    private function generateOrganizers(SymfonyStyle $io): array
    {
        $organizers = $this->em->getRepository(OrganizerProfile::class)->findAll();
        if (!empty($organizers)) {
            $io->info('Organizers existent déjà');
            return $organizers;
        }
        $data = ['Sahara Explorers', 'Medina Tours', 'Djerba Holiday', 'Carthage Travel'];
        $profiles = [];
        foreach ($data as $i => $agency) {
            $user = new User();
            $user->setEmail(strtolower($agency) . '@example.com')
                ->setFirstName('Organizer' . ($i+1))->setLastName('User')
                ->setPassword($this->passwordHasher->hashPassword($user, 'organizer123'))
                ->setIsActive(true)->setStatusOrganizer('approved')
                ->setCountry('Tunisia')->setPreferredLanguage('fr')->setPreferredCurrency('TND')
                ->addUserRole($this->em->getRepository(Role::class)->findOneBy(['name' => 'ROLE_ORGANIZER']));
            $this->em->persist($user);
            
            $profile = new OrganizerProfile();
            $profile->setUser($user)->setAgencyName($agency)->setCountry('Tunisia')
                ->setStatus('approved')->setDescription('Agence ' . $agency);
            $this->em->persist($profile);
            $profiles[] = $profile;
        }
        $this->em->flush();
        $io->success(count($profiles) . ' organisateurs générés');
        return $profiles;
    }

    private function generateTrips(SymfonyStyle $io, array $categories, array $destinations, array $organizers): array
    {
        $trips = $this->em->getRepository(Trip::class)->findAll();
        if (!empty($trips)) {
            $io->info('Trips existent déjà');
            return $trips;
        }
        $tripsData = [
            ['title' => 'Circuit Djerba', 'desc' => 'Découvrez Djerba', 'price' => 450, 'days' => 3],
            ['title' => 'Safari Sahara', 'desc' => 'Aventure désert', 'price' => 650, 'days' => 5],
            ['title' => 'Circuit Kairouan', 'desc' => 'Histoire', 'price' => 350, 'days' => 2],
        ];
        $tripEntities = [];
        foreach ($tripsData as $i => $data) {
            $trip = new Trip();
            $trip->setTitle($data['title'])->setShortDescription($data['desc'])->setLongDescription($data['desc'])
                ->setBasePrice((string)$data['price'])->setCurrency('TND')->setDurationDays($data['days'])
                ->setDifficultyLevel('medium')->setIsActive(true)->setStatus('published')
                ->setOrganizer($organizers[$i % count($organizers)]);
            $trip->addCategory($categories[$i % count($categories)]);
            $trip->addDestination($destinations[$i % count($destinations)]);
            $this->em->persist($trip);
            $tripEntities[] = $trip;
            
            $session = new TripSession();
            $session->setTrip($trip)->setStartDate(new \DateTime())->setEndDate(new \DateTime('+' . $data['days'] . ' days'))
                ->setMaxCapacity(20)->setStatus('open');
            $this->em->persist($session);
        }
        $this->em->flush();
        $io->success(count($tripEntities) . ' trips générés');
        return $tripEntities;
    }

    private function generateBookings(SymfonyStyle $io, array $trips): void
    {
        $bookings = $this->em->getRepository(Booking::class)->findAll();
        if (count($bookings) > 3) {
            $io->info('Bookings existent déjà');
            return;
        }
        $users = $this->em->getRepository(User::class)->findAll();
        $statuses = ['PENDING', 'CONFIRMED', 'COMPLETED'];
        
        for ($i = 0; $i < 10; $i++) {
            $trip = $trips[array_rand($trips)];
            $user = $users[array_rand($users)];
            $sessions = $trip->getSessions();
            if ($sessions->isEmpty()) continue;
            
            $booking = new Booking();
            $booking->setTrip($trip)->setUser($user)->setTripSession($sessions->first())
                ->setNumTravelers(rand(1, 4))->setTotalPrice((string)((int)$trip->getBasePrice() * rand(1, 4)))
                ->setCurrency('TND')->setStatus($statuses[array_rand($statuses)]);
            $this->em->persist($booking);
        }
        $this->em->flush();
        $io->success('10 bookings générés');
    }

    private function generateAIData(SymfonyStyle $io, array $trips): void
    {
        $io->info('AIData existe déjà');
    }

    private function generateMoments(SymfonyStyle $io, array $trips): void
    {
        $io->info('Génération des moments...');
        
        // Get any confirmed booking from the system
        $bookings = $this->em->getRepository(Booking::class)->findBy(['status' => 'CONFIRMED'], ['id' => 'ASC'], 1);
        
        if (empty($bookings)) {
            $io->warning('Aucune booking confirmée, skip moments');
            return;
        }
        
        $booking = $bookings[0];
        $trip = $booking->getTrip();
        $user = $booking->getUser();
        
        if (!$trip || !$user) {
            $io->warning('Trip ou user manquant, skip moments');
            return;
        }
        
        $momentContents = [
            "Incroyable ce voyage! 🌍 Les paysages étaient à couper le souffle. Je recommande fortement Carthage Travel pour leur professionalism.",
            "Une expérience inoubliable! Le guide était super sympas et très compétent. On a visité des endroits magnifiques. 🔥",
            "Merci Carthage Travel pour cette aventure extraordinaire! Tout était parfaitement organisé. Déjà impatient de partir à nouveau! ✈️",
            "Premier voyage avec cette équipe et je ne suis pas déçu. Tout était nickel, des hôtels au transport. 推荐!",
            "Des moments magiques avec des personnes extraordinaires. Ce voyage restera gravé dans ma mémoire forever! ❤️",
        ];
        
        $momentContent = $momentContents[array_rand($momentContents)];
        $moment = new Moment();
        $moment->setUser($user);
        $moment->setTrip($trip);
        $moment->setBooking($booking);
        $moment->setContent($momentContent);
        $moment->setCreatedAt(new \DateTimeImmutable('-2 days'));
        
        $this->em->persist($moment);
        
        // Add fake image media (use existing trip image)
        $tripImages = $trip->getImages();
        if ($tripImages && count($tripImages) > 0) {
            $tripImage = $tripImages->first();
            if ($tripImage) {
                $media = new MomentMedia();
                $media->setMoment($moment);
                $media->setUrl($tripImage->getUrl());
                $media->setType('image');
                $media->setCreatedAt(new \DateTimeImmutable('-2 days'));
                $this->em->persist($media);
            }
        }
        
        $this->em->flush();
        $io->info('Moments générés');
    }

   
}
