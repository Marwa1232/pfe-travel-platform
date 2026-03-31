<?php

namespace App\Command;

use App\Entity\User;
use App\Entity\Role;
use App\Entity\OrganizerProfile;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-admin-organizer',
    description: 'Create admin and organizer accounts',
)]
class CreateAdminOrganizerCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Create or get ROLE_ADMIN
        $roleAdmin = $this->em->getRepository(Role::class)->findOneBy(['name' => 'ROLE_ADMIN']);
        if (!$roleAdmin) {
            $roleAdmin = new Role();
            $roleAdmin->setName('ROLE_ADMIN');
            $this->em->persist($roleAdmin);
            $io->success('Created ROLE_ADMIN');
        }

        // Create or get ROLE_ORGANIZER
        $roleOrganizer = $this->em->getRepository(Role::class)->findOneBy(['name' => 'ROLE_ORGANIZER']);
        if (!$roleOrganizer) {
            $roleOrganizer = new Role();
            $roleOrganizer->setName('ROLE_ORGANIZER');
            $this->em->persist($roleOrganizer);
            $io->success('Created ROLE_ORGANIZER');
        }

        $this->em->flush();

        // Create Admin User
        $adminEmail = 'admin@example.com';
        $admin = $this->em->getRepository(User::class)->findOneBy(['email' => $adminEmail]);
        
        if (!$admin) {
            $admin = new User();
            $admin->setEmail($adminEmail);
            $admin->setFirstName('Admin');
            $admin->setLastName('User');
            $admin->setPhone('+21612345678');
            $admin->setPassword($this->passwordHasher->hashPassword($admin, 'admin123'));
            $admin->setIsActive(true);
            $admin->addUserRole($roleAdmin);
            
            $this->em->persist($admin);
            $io->success('Created admin account: admin@example.com / admin123');
        } else {
            $io->warning('Admin account already exists: admin@example.com');
        }

        // Create Organizer User
        $organizerEmail = 'organizer@example.com';
        $organizer = $this->em->getRepository(User::class)->findOneBy(['email' => $organizerEmail]);
        
        if (!$organizer) {
            $organizer = new User();
            $organizer->setEmail($organizerEmail);
            $organizer->setFirstName('Organizer');
            $organizer->setLastName('User');
            $organizer->setPhone('+21698765432');
            $organizer->setPassword($this->passwordHasher->hashPassword($organizer, 'organizer123'));
            $organizer->setIsActive(true);
            $organizer->addUserRole($roleOrganizer);
            
            $this->em->persist($organizer);
            
            // Create Organizer Profile
            $organizerProfile = new OrganizerProfile();
            $organizerProfile->setUser($organizer);
            $organizerProfile->setAgencyName('Travel Agency');
            $organizerProfile->setLicenseNumber('LIC-2026-001');
            $organizerProfile->setAddress('Tunis, Tunisia');
            $organizerProfile->setCountry('Tunisia');
            $organizerProfile->setStatus('APPROVED');
            $organizerProfile->setDescription('Official travel organizer');
            
            $this->em->persist($organizerProfile);
            
            $io->success('Created organizer account: organizer@example.com / organizer123');
        } else {
            $io->warning('Organizer account already exists: organizer@example.com');
        }

        $this->em->flush();

        $io->success('Admin and Organizer accounts have been created successfully!');
        
        return Command::SUCCESS;
    }
}
