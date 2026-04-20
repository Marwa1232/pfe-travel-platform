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
use Symfony\Component\Console\Input\InputOption;
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
    
    protected function configure(): void
    {
        $this->addOption('force', 'f', InputOption::VALUE_NONE, 'Regenerate all data (delete existing)');
    }
    
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
        
        $force = $input->getOption('force');
        
        // Clean existing data if --force is used
        if ($force) {
            $io->warning('Option --force activée: suppression des données existantes...');
            $this->cleanExistingData($io);
        }
        
        // Initialize roles
        $this->initRoles($io);
        
        // Generate categories (always regenerate if force)
        $categories = $this->generateCategories($io, $force);
        
        // Generate destinations (always regenerate if force)
        $destinations = $this->generateDestinations($io, $force);
        
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

private function cleanExistingData(SymfonyStyle $io): void
    {
        $conn = $this->em->getConnection();
        
        // Disable foreign key checks
        $conn->executeStatement('SET FOREIGN_KEY_CHECKS = 0');
        
        // Delete all data in correct order (tables referencing other tables first)
        $conn->executeStatement('DELETE FROM moments WHERE user_id IS NOT NULL');
        $conn->executeStatement('DELETE FROM notifications WHERE user_id IS NOT NULL');
        $conn->executeStatement('DELETE FROM favorites WHERE user_id IS NOT NULL');
        $conn->executeStatement('DELETE FROM reviews WHERE user_id IS NOT NULL');
        $conn->executeStatement('DELETE FROM bookings WHERE user_id IS NOT NULL');
        $conn->executeStatement('DELETE FROM user_roles WHERE user_id IS NOT NULL');
        
        // Now truncate
        $conn->executeStatement('TRUNCATE TABLE payments');
        $conn->executeStatement('TRUNCATE TABLE moment_media');
        $conn->executeStatement('TRUNCATE TABLE moments');
        $conn->executeStatement('TRUNCATE TABLE bookings');
        $conn->executeStatement('TRUNCATE TABLE trip_sessions');
        $conn->executeStatement('TRUNCATE TABLE trip_images');
        $conn->executeStatement('TRUNCATE TABLE trip_programs');
        $conn->executeStatement('TRUNCATE TABLE trip_destinations');
        $conn->executeStatement('TRUNCATE TABLE trip_categories');
        $conn->executeStatement('TRUNCATE TABLE trips');
        $conn->executeStatement('TRUNCATE TABLE organizer_profiles');
        $conn->executeStatement('TRUNCATE TABLE ai_data');
        $conn->executeStatement('TRUNCATE TABLE categories');
        $conn->executeStatement('TRUNCATE TABLE destinations');
        $conn->executeStatement('TRUNCATE TABLE notifications');
        $conn->executeStatement('TRUNCATE TABLE favorites');
        $conn->executeStatement('TRUNCATE TABLE reviews');
        $conn->executeStatement('TRUNCATE TABLE user_roles');
        $conn->executeStatement('TRUNCATE TABLE users');
        
        // Re-enable foreign key checks
        $conn->executeStatement('SET FOREIGN_KEY_CHECKS = 1');
        
        $io->info('Données existantes nettoyées');
    }

    private function generateCategories(SymfonyStyle $io, bool $force = false): array
    {
        $categories = $this->em->getRepository(Category::class)->findAll();
        if (!empty($categories) && !$force) {
            $io->info('Catégories existent déjà');
            return $categories;
        }
        // Generate new categories
        $categoriesData = [
            ['name' => 'Aventure & Randonnée', 'description' => 'Expériences aventureuses'],
            ['name' => 'Culturel & Historique', 'description' => 'Patrimoine historique'],
            ['name' => 'Plage & Relaxation', 'description' => 'Détente au bord de la mer'],
            ['name' => 'Désert & Safari', 'description' => 'Aventure dans le Sahara'],
            ['name' => 'Gastronomie', 'description' => 'Circuits culinaires'],
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

    private function generateDestinations(SymfonyStyle $io, bool $force = false): array
    {
        $destinations = $this->em->getRepository(Destination::class)->findAll();
        if (!empty($destinations) && !$force) {
            $io->info('Destinations existent déjà');
            return $destinations;
        }
        
// Image URLs for destinations (appropriate images for each location)
        $destinationImages = [
            // Tunisia - Real destination images
            'Tunis' => 'https://images.unsplash.com/photo-1569137226680-371bc1a11329?w=800', // Tunis medina
            'Sousse' => 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=800', // Sousse
            'Djerba' => 'https://images.unsplash.com/photo-1538300342682-cf57afb97285?w=800', // Djerba beach
            'Kairouan' => 'https://images.unsplash.com/photo-156oqu3568952-d97bb2e326b1?w=800', // Kairouan mosque
            'Tozeur' => 'https://images.unsplash.com/photo-1548586191-aa5803b77379?w=800', // Tozeur desert
            'Hammamet' => 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', // Hammamet
            'Tabarka' => 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800', // Tabarka
            'Sfax' => 'https://images.unsplash.com/photo-1566054758969-70401ec3ac40?w=800', // Sfax
            'Monastir' => 'https://images.unsplash.com/photo-1597212720158-24b2bf5f83a6?w=800', // Monastir
            'Mahdia' => 'https://images.unsplash.com/photo-1596436081514-dba8ff16a3d5?w=800', // Mahdia
            'El Kef' => 'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800', // El Kef
            'Bizerte' => 'https://images.unsplash.com/photo-1565008447742-97f4f6304f87?w=800', // Bizerte
            'Nabeul' => 'https://images.unsplash.com/photo-1607346256330-de2c0608e092?w=800', // Nabeul
            'Gabès' => 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', // Gabès
            'Médenine' => 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', // Médenine
            'Tataouine' => 'https://images.unsplash.com/photo-1539650116455-29cb5507af40?w=800', // Tataouine
            'Douiret' => 'https://images.unsplash.com/photo-1548586191-aa5803b77379?w=800', // Douiret
            'Chenini' => 'https://images.unsplash.com/photo-1539650116455-29cb5507af40?w=800', // Chenini
            'Matmata' => 'https://images.unsplash.com/photo-1548586191-aa5803b77379?w=800', // Matmata
            'Nefta' => 'https://images.unsplash.com/photo-1548585744-aa73c0d72942?w=800', // Nefta
            
            // Morocco - Real Moroccan destinations
            'Marrakech' => 'https://images.unsplash.com/photo-1597212720158-24b2bf5f83a6?w=800', // Marrakech
            'Fès' => 'https://images.unsplash.com/photo-1569386592116-4175f7c4d24c?w=800', // Fes
            'Casablanca' => 'https://images.unsplash.com/photo-1566054758969-70401ec3ac40?w=800', // Casablanca
            'Rabat' => 'https://images.unsplash.com/photo-1587974928442-77dc4fc0ca5e?w=800', // Rabat
            'Tanger' => 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800', // Tanger
            'Agadir' => 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', // Agadir
            'Essaouira' => 'https://images.unsplash.com/photo-1548585744-aa73c0d72942?w=800', // Essaouira
            'Ouarzazate' => 'https://images.unsplash.com/photo-1539650116455-29cb5507af40?w=800', // Ouarzazate
            'Merzouga' => 'https://images.unsplash.com/photo-1548586191-aa5803b77379?w=800', // Merzouga dunes
            'Chefchaouen' => 'https://images.unsplash.com/photo-1553244643-5b8c0b5c8b5f?w=800', // Chefchaouen blue
            'Meknès' => 'https://images.unsplash.com/photo-1569386592116-4175f7c4d24c?w=800', // Meknes
            'Volubilis' => 'https://images.unsplash.com/photo-1569386592116-4175f7c4d24c?w=800', // Volubilis
            'El Jadida' => 'https://images.unsplash.com/photo-1548585744-aa73c0d72942?w=800', // El Jadida
            'Asilah' => 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800', // Asilah
            
            // Algeria - Real Algerian destinations
            'Alger' => 'https://images.unsplash.com/photo-1566054758969-70401ec3ac40?w=800', // Alger
            'Oran' => 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', // Oran
            'Constantine' => 'https://images.unsplash.com/photo-1569386592116-4175f7c4d24c?w=800', // Constantine
            'Annaba' => 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800', // Annaba
            'Blida' => 'https://images.unsplash.com/photo-1566054758969-70401ec3ac40?w=800', // Blida
            'Tlemcen' => 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', // Tlemcen
            'Béjaïa' => 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800', // Bejaia
            'Sétif' => 'https://images.unsplash.com/photo-1566054758969-70401ec3ac40?w=800', // Setif
            'Batna' => 'https://images.unsplash.com/photo-1569386592116-4175f7c4d24c?w=800', // Batna
            'Biskra' => 'https://images.unsplash.com/photo-1548586191-aa5803b77379?w=800', // Biskra
            'Tamanrasset' => 'https://images.unsplash.com/photo-1548586191-aa5803b77379?w=800', // Tamanrasset
            'Djanet' => 'https://images.unsplash.com/photo-1539650116455-29cb5507af40?w=800', // Djanet
            'Ouargla' => 'https://images.unsplash.com/photo-1548585744-aa73c0d72942?w=800', // Ouargla
            'Ghardaïa' => 'https://images.unsplash.com/photo-1548585744-aa73c0d72942?w=800', // Ghardaia
            'Tipaza' => 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800', // Tipaza
            
            // Libya - Real Libyan destinations
            'Tripoli' => 'https://images.unsplash.com/photo-1566054758969-70401ec3ac40?w=800', // Tripoli
            'Benghazi' => 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800', // Benghazi
            'Misrata' => 'https://images.unsplash.com/photo-1566054758969-70401ec3ac40?w=800', // Misrata
            'Zliten' => 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', // Zliten
            'Tobruk' => 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800', // Tobruk
            'Derna' => 'https://images.unsplash.com/photo-1569386592116-4175f7c4d24c?w=800', // Derna
            'Ghadames' => 'https://images.unsplash.com/photo-1548585744-aa73c0d72942?w=800', // Ghadames
            'Sabha' => 'https://images.unsplash.com/photo-1548586191-aa5803b77379?w=800', // Sabha
            'Ajdabiya' => 'https://images.unsplash.com/photo-1566054758969-70401ec3ac40?w=800', // Ajdabiya
            'Al Jawf' => 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', // Al Jawf
            
            // Egypt - Real Egyptian destinations
            'Le Caire' => 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800', // Cairo pyramids
            'Alexandrie' => 'https://images.unsplash.com/photo-1566054758969-70401ec3ac40?w=800', // Alexandria
            'Louxor' => 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800', // Luxor temple
            'Assouan' => 'https://images.unsplash.com/photo-1596436081514-dba8ff16a3d5?w=800', // Aswan
            'Charm El-Cheikh' => 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', // Sharm el Sheikh
            'Hurghada' => 'https://images.unsplash.com/photo-1548585744-aa73c0d72942?w=800', // Hurghada
            'Marsa Alam' => 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', // Marsa Alam
            'Dahab' => 'https://images.unsplash.com/photo-1548585744-aa73c0d72942?w=800', // Dahab
            'Sharm El-Sheikh' => 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', // Sharm
            'Gizeh' => 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800', // Giza pyramids
            'Sakkara' => 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800', // Saqqara
            'Karnak' => 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800', // Karnak
            'Vallee des Rois' => 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800', // Valley of Kings
            'Edfou' => 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800', // Edfu
            'Edfine' => 'https://images.unsplash.com/photo-1596436081514-dba8ff16a3d5?w=800', // Edfu
        ];
        
        $destinationsData = [
            // Tunisia
            ['name' => 'Tunis', 'country' => 'Tunisia', 'region' => 'Nord'],
            ['name' => 'Sousse', 'country' => 'Tunisia', 'region' => 'Côte Est'],
            ['name' => 'Djerba', 'country' => 'Tunisia', 'region' => 'Sud'],
            ['name' => 'Kairouan', 'country' => 'Tunisia', 'region' => 'Centre'],
            ['name' => 'Tozeur', 'country' => 'Tunisia', 'region' => 'Sud-Ouest'],
            ['name' => 'Hammamet', 'country' => 'Tunisia', 'region' => 'Côte Est'],
            ['name' => 'Tabarka', 'country' => 'Tunisia', 'region' => 'Nord-Ouest'],
            ['name' => 'Sfax', 'country' => 'Tunisia', 'region' => 'Côte Est'],
            ['name' => 'Monastir', 'country' => 'Tunisia', 'region' => 'Côte Est'],
            ['name' => 'Mahdia', 'country' => 'Tunisia', 'region' => 'Côte Est'],
            ['name' => 'El Kef', 'country' => 'Tunisia', 'region' => 'Nord-Ouest'],
            ['name' => 'Bizerte', 'country' => 'Tunisia', 'region' => 'Nord'],
            ['name' => 'Nabeul', 'country' => 'Tunisia', 'region' => 'Côte Est'],
            ['name' => 'Gabès', 'country' => 'Tunisia', 'region' => 'Sud'],
            ['name' => 'Médenine', 'country' => 'Tunisia', 'region' => 'Sud'],
            ['name' => 'Tataouine', 'country' => 'Tunisia', 'region' => 'Sud'],
            ['name' => 'Douiret', 'country' => 'Tunisia', 'region' => 'Sud'],
            ['name' => 'Chenini', 'country' => 'Tunisia', 'region' => 'Sud'],
            ['name' => 'Matmata', 'country' => 'Tunisia', 'region' => 'Sud'],
            ['name' => 'Nefta', 'country' => 'Tunisia', 'region' => 'Sud-Ouest'],
            
            // Morocco
            ['name' => 'Marrakech', 'country' => 'Morocco', 'region' => 'Centre'],
            ['name' => 'Fès', 'country' => 'Morocco', 'region' => 'Nord-Est'],
            ['name' => 'Casablanca', 'country' => 'Morocco', 'region' => 'Ouest'],
            ['name' => 'Rabat', 'country' => 'Morocco', 'region' => 'Ouest'],
            ['name' => 'Tanger', 'country' => 'Morocco', 'region' => 'Nord'],
            ['name' => 'Agadir', 'country' => 'Morocco', 'region' => 'Sud-Ouest'],
            ['name' => 'Essaouira', 'country' => 'Morocco', 'region' => 'Ouest'],
            ['name' => 'Ouarzazate', 'country' => 'Morocco', 'region' => 'Sud'],
            ['name' => 'Merzouga', 'country' => 'Morocco', 'region' => 'Sud-Est'],
            ['name' => 'Chefchaouen', 'country' => 'Morocco', 'region' => 'Nord'],
            ['name' => 'Meknès', 'country' => 'Morocco', 'region' => 'Centre'],
            ['name' => 'Volubilis', 'country' => 'Morocco', 'region' => 'Nord'],
            ['name' => 'El Jadida', 'country' => 'Morocco', 'region' => 'Ouest'],
            ['name' => 'Asilah', 'country' => 'Morocco', 'region' => 'Nord'],
            
            // Algeria
            ['name' => 'Alger', 'country' => 'Algeria', 'region' => 'Nord'],
            ['name' => 'Oran', 'country' => 'Algeria', 'region' => 'Ouest'],
            ['name' => 'Constantine', 'country' => 'Algeria', 'region' => 'Nord-Est'],
            ['name' => 'Annaba', 'country' => 'Algeria', 'region' => 'Nord-Est'],
            ['name' => 'Blida', 'country' => 'Algeria', 'region' => 'Nord'],
            ['name' => 'Tlemcen', 'country' => 'Algeria', 'region' => 'Ouest'],
            ['name' => 'Béjaïa', 'country' => 'Algeria', 'region' => 'Nord'],
            ['name' => 'Sétif', 'country' => 'Algeria', 'region' => 'Nord-Est'],
            ['name' => 'Batna', 'country' => 'Algeria', 'region' => 'Est'],
            ['name' => 'Biskra', 'country' => 'Algeria', 'region' => 'Sud-Est'],
            ['name' => 'Tamanrasset', 'country' => 'Algeria', 'region' => 'Sud'],
            ['name' => 'Djanet', 'country' => 'Algeria', 'region' => 'Sud-Est'],
            ['name' => 'Ouargla', 'country' => 'Algeria', 'region' => 'Sud-Est'],
            ['name' => 'Ghardaïa', 'country' => 'Algeria', 'region' => 'Sud-Central'],
            ['name' => 'Tipaza', 'country' => 'Algeria', 'region' => 'Nord'],
            
            // Libya
            ['name' => 'Tripoli', 'country' => 'Libya', 'region' => 'Nord'],
            ['name' => 'Benghazi', 'country' => 'Libya', 'region' => 'Est'],
            ['name' => 'Misrata', 'country' => 'Libya', 'region' => 'Ouest'],
            ['name' => 'Zliten', 'country' => 'Libya', 'region' => 'Ouest'],
            ['name' => 'Tobruk', 'country' => 'Libya', 'region' => 'Est'],
            ['name' => 'Derna', 'country' => 'Libya', 'region' => 'Est'],
            ['name' => 'Ghadames', 'country' => 'Libya', 'region' => 'Ouest'],
            ['name' => 'Sabha', 'country' => 'Libya', 'region' => 'Sud'],
            ['name' => 'Ajdabiya', 'country' => 'Libya', 'region' => 'Est'],
            ['name' => 'Al Jawf', 'country' => 'Libya', 'region' => 'Est'],
            
            // Egypt
            ['name' => 'Le Caire', 'country' => 'Egypt', 'region' => 'Nord'],
            ['name' => 'Alexandrie', 'country' => 'Egypt', 'region' => 'Nord'],
            ['name' => 'Louxor', 'country' => 'Egypt', 'region' => 'Sud'],
            ['name' => 'Assouan', 'country' => 'Egypt', 'region' => 'Sud'],
            ['name' => 'Charm El-Cheikh', 'country' => 'Egypt', 'region' => 'Sinai'],
            ['name' => 'Hurghada', 'country' => 'Egypt', 'region' => 'Mer Rouge'],
            ['name' => 'Marsa Alam', 'country' => 'Egypt', 'region' => 'Mer Rouge'],
            ['name' => 'Dahab', 'country' => 'Egypt', 'region' => 'Sinai'],
            ['name' => 'Sharm El-Sheikh', 'country' => 'Egypt', 'region' => 'Sinai'],
            ['name' => 'Gizeh', 'country' => 'Egypt', 'region' => 'Nord'],
            ['name' => 'Sakkara', 'country' => 'Egypt', 'region' => 'Nord'],
            ['name' => 'Karnak', 'country' => 'Egypt', 'region' => 'Sud'],
            ['name' => 'Vallee des Rois', 'country' => 'Egypt', 'region' => 'Sud'],
            ['name' => 'Edfou', 'country' => 'Egypt', 'region' => 'Sud'],
            ['name' => 'Edfine', 'country' => 'Egypt', 'region' => 'Sud'],
        ];
        
        foreach ($destinationsData as $data) {
            $dest = new Destination();
            $dest->setName($data['name'])->setCountry($data['country'])->setRegion($data['region'])->setIsActive(true);
            // Set image if available, otherwise use a default
            $image = $destinationImages[$data['name']] ?? 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800';
            $dest->setImage($image);
            $this->em->persist($dest);
        }
        $this->em->flush();
        $io->success(count($destinationsData) . ' destinations générées (Afrique du Nord)');
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
        
        // Sample profile photos (random URLs from picsum.photos)
        $profilePhotos = [
            'https://i.pravatar.cc/150?img=1',
            'https://i.pravatar.cc/150?img=2',
            'https://i.pravatar.cc/150?img=3',
            'https://i.pravatar.cc/150?img=4',
            'https://i.pravatar.cc/150?img=5',
            null, // some users without photo
            'https://i.pravatar.cc/150?img=7',
            null, // some users without photo
        ];
        
        for ($i = 0; $i < 8; $i++) {
            $user = new User();
            $user->setEmail(strtolower($firstNames[$i] . '.' . $lastNames[$i]) . '@example.com')
                ->setFirstName($firstNames[$i])->setLastName($lastNames[$i])
                ->setPassword($this->passwordHasher->hashPassword($user, 'password123'))
                ->setIsActive(true)->setCountry('Tunisia')->setPreferredLanguage('fr')->setPreferredCurrency('TND')
                ->setProfilePhotoUrl($profilePhotos[$i])
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
        $organizerPhotos = [
            'https://i.pravatar.cc/150?img=11',
            'https://i.pravatar.cc/150?img=12',
            'https://i.pravatar.cc/150?img=13',
            'https://i.pravatar.cc/150?img=14',
        ];
        $profiles = [];
        foreach ($data as $i => $agency) {
            $user = new User();
            $user->setEmail(strtolower($agency) . '@example.com')
                ->setFirstName('Organizer' . ($i+1))->setLastName('User')
                ->setPassword($this->passwordHasher->hashPassword($user, 'organizer123'))
                ->setIsActive(true)->setStatusOrganizer('approved')
                ->setCountry('Tunisia')->setPreferredLanguage('fr')->setPreferredCurrency('TND')
                ->setProfilePhotoUrl($organizerPhotos[$i])
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
            ['title' => 'Circuit Djerba', 'desc' => 'Découvrez Djerba la blanche avec ses plages dorées, son désert et sa culture unique. Une expérience inoubliable.', 'price' => 450, 'days' => 3, 'image' => 'https://images.unsplash.com/photo-1538300342682-cf57afb97285?w=800'],
            ['title' => 'Safari Sahara', 'desc' => 'Aventure passionnante dans le désert du Sahara, explorez les dunes de Tozeur et les oasis.', 'price' => 650, 'days' => 5, 'image' => 'https://images.unsplash.com/photo-1548586191-aa5803b77379?w=800'],
            ['title' => 'Circuit Kairouan', 'desc' => 'Découvrez Kairouan la holy city, patrimoine mondial UNESCO, et explorez les zaouias et médersas.', 'price' => 350, 'days' => 2, 'image' => 'https://images.unsplash.com/photo-156oqu3568952-d97bb2e326b1?w=800'],
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
            
            // Add trip images (appropriate for each trip)
            $tripImageSets = [
                [
                    'https://images.unsplash.com/photo-1538300342682-cf57afb97285?w=800',
                    'https://images.unsplash.com/photo-1548585744-aa73c0d72942?w=800',
                    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
                ],
                [
                    'https://images.unsplash.com/photo-1548586191-aa5803b77379?w=800',
                    'https://images.unsplash.com/photo-1539650116455-29cb5507af40?w=800',
                    'https://images.unsplash.com/photo-1548585744-aa73c0d72942?w=800',
                ],
                [
                    'https://images.unsplash.com/photo-156oqu3568952-d97bb2e326b1?w=800',
                    'https://images.unsplash.com/photo-1569137226680-371bc1a11329?w=800',
                    'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800',
                ],
            ];
            foreach ($tripImageSets[$i] as $idx => $imgUrl) {
                $tripImage = new \App\Entity\TripImage();
                $tripImage->setTrip($trip)->setUrl($imgUrl)->setIsCover($idx === 0);
                $this->em->persist($tripImage);
            }
            
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
        $statuses = ['CONFIRMED', 'CONFIRMED', 'CONFIRMED', 'PENDING', 'COMPLETED'];
        
        for ($i = 0; $i < 10; $i++) {
            $trip = $trips[array_rand($trips)];
            $user = $users[array_rand($users)];
            
            // Force reload sessions
            $this->em->refresh($trip);
            $sessions = $trip->getSessions();
            
            if ($sessions->isEmpty()) {
                // Create a session for this trip
                $session = new TripSession();
                $session->setTrip($trip)->setStartDate(new \DateTime())->setEndDate(new \DateTime('+' . $trip->getDurationDays() . ' days'))
                    ->setMaxCapacity(20)->setStatus('open');
                $this->em->persist($session);
                $this->em->flush();
                $sessions->add($session);
            }
            
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
