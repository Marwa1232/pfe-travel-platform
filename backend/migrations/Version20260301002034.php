<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260301002034 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE bookings (id INT AUTO_INCREMENT NOT NULL, num_travelers INT NOT NULL, total_price NUMERIC(10, 2) NOT NULL, currency VARCHAR(5) NOT NULL, status VARCHAR(20) NOT NULL, cancellation_reason LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, user_id INT NOT NULL, trip_id INT NOT NULL, trip_session_id INT NOT NULL, INDEX IDX_7A853C35A76ED395 (user_id), INDEX IDX_7A853C35A5BC2E0E (trip_id), INDEX IDX_7A853C35942D37C9 (trip_session_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE categories (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(100) NOT NULL, description LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE destinations (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(200) NOT NULL, country VARCHAR(50) NOT NULL, region VARCHAR(100) DEFAULT NULL, is_active TINYINT NOT NULL, created_at DATETIME NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE organizer_profiles (id INT AUTO_INCREMENT NOT NULL, agency_name VARCHAR(200) NOT NULL, license_number VARCHAR(100) DEFAULT NULL, address LONGTEXT DEFAULT NULL, country VARCHAR(50) NOT NULL, status VARCHAR(20) NOT NULL, description LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_69C1CE93A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE payments (id INT AUTO_INCREMENT NOT NULL, amount NUMERIC(10, 2) NOT NULL, currency VARCHAR(5) NOT NULL, method VARCHAR(20) NOT NULL, status VARCHAR(20) NOT NULL, transaction_ref VARCHAR(100) DEFAULT NULL, paid_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, booking_id INT NOT NULL, UNIQUE INDEX UNIQ_65D29B323301C60 (booking_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE roles (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(50) NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_B63E2EC75E237E06 (name), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE trip_images (id INT AUTO_INCREMENT NOT NULL, url VARCHAR(500) NOT NULL, is_cover TINYINT NOT NULL, created_at DATETIME NOT NULL, trip_id INT NOT NULL, INDEX IDX_F10E5C0A5BC2E0E (trip_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE trip_sessions (id INT AUTO_INCREMENT NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL, max_capacity INT NOT NULL, status VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, trip_id INT NOT NULL, INDEX IDX_3231AE03A5BC2E0E (trip_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE trips (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(200) NOT NULL, short_description LONGTEXT DEFAULT NULL, long_description LONGTEXT DEFAULT NULL, base_price NUMERIC(10, 2) NOT NULL, currency VARCHAR(5) DEFAULT \'TND\' NOT NULL, duration_days INT NOT NULL, difficulty_level VARCHAR(20) DEFAULT \'medium\' NOT NULL, is_active TINYINT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, organizer_id INT NOT NULL, INDEX IDX_AA7370DA876C4DDA (organizer_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE trip_destinations (trip_id INT NOT NULL, destination_id INT NOT NULL, INDEX IDX_20AA085AA5BC2E0E (trip_id), INDEX IDX_20AA085A816C6140 (destination_id), PRIMARY KEY (trip_id, destination_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE trip_categories (trip_id INT NOT NULL, category_id INT NOT NULL, INDEX IDX_CFE19D7EA5BC2E0E (trip_id), INDEX IDX_CFE19D7E12469DE2 (category_id), PRIMARY KEY (trip_id, category_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE users (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password_hash VARCHAR(255) NOT NULL, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, phone VARCHAR(20) DEFAULT NULL, country VARCHAR(50) DEFAULT \'Tunisia\' NOT NULL, preferred_language VARCHAR(5) DEFAULT \'fr\' NOT NULL, preferred_currency VARCHAR(5) DEFAULT \'TND\' NOT NULL, is_active TINYINT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_1483A5E9E7927C74 (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE user_roles (user_id INT NOT NULL, role_id INT NOT NULL, INDEX IDX_54FCD59FA76ED395 (user_id), INDEX IDX_54FCD59FD60322AC (role_id), PRIMARY KEY (user_id, role_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL, available_at DATETIME NOT NULL, delivered_at DATETIME DEFAULT NULL, INDEX IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750 (queue_name, available_at, delivered_at, id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE bookings ADD CONSTRAINT FK_7A853C35A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE bookings ADD CONSTRAINT FK_7A853C35A5BC2E0E FOREIGN KEY (trip_id) REFERENCES trips (id)');
        $this->addSql('ALTER TABLE bookings ADD CONSTRAINT FK_7A853C35942D37C9 FOREIGN KEY (trip_session_id) REFERENCES trip_sessions (id)');
        $this->addSql('ALTER TABLE organizer_profiles ADD CONSTRAINT FK_69C1CE93A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE payments ADD CONSTRAINT FK_65D29B323301C60 FOREIGN KEY (booking_id) REFERENCES bookings (id)');
        $this->addSql('ALTER TABLE trip_images ADD CONSTRAINT FK_F10E5C0A5BC2E0E FOREIGN KEY (trip_id) REFERENCES trips (id)');
        $this->addSql('ALTER TABLE trip_sessions ADD CONSTRAINT FK_3231AE03A5BC2E0E FOREIGN KEY (trip_id) REFERENCES trips (id)');
        $this->addSql('ALTER TABLE trips ADD CONSTRAINT FK_AA7370DA876C4DDA FOREIGN KEY (organizer_id) REFERENCES organizer_profiles (id)');
        $this->addSql('ALTER TABLE trip_destinations ADD CONSTRAINT FK_20AA085AA5BC2E0E FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE trip_destinations ADD CONSTRAINT FK_20AA085A816C6140 FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE trip_categories ADD CONSTRAINT FK_CFE19D7EA5BC2E0E FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE trip_categories ADD CONSTRAINT FK_CFE19D7E12469DE2 FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_roles ADD CONSTRAINT FK_54FCD59FA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_roles ADD CONSTRAINT FK_54FCD59FD60322AC FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE bookings DROP FOREIGN KEY FK_7A853C35A76ED395');
        $this->addSql('ALTER TABLE bookings DROP FOREIGN KEY FK_7A853C35A5BC2E0E');
        $this->addSql('ALTER TABLE bookings DROP FOREIGN KEY FK_7A853C35942D37C9');
        $this->addSql('ALTER TABLE organizer_profiles DROP FOREIGN KEY FK_69C1CE93A76ED395');
        $this->addSql('ALTER TABLE payments DROP FOREIGN KEY FK_65D29B323301C60');
        $this->addSql('ALTER TABLE trip_images DROP FOREIGN KEY FK_F10E5C0A5BC2E0E');
        $this->addSql('ALTER TABLE trip_sessions DROP FOREIGN KEY FK_3231AE03A5BC2E0E');
        $this->addSql('ALTER TABLE trips DROP FOREIGN KEY FK_AA7370DA876C4DDA');
        $this->addSql('ALTER TABLE trip_destinations DROP FOREIGN KEY FK_20AA085AA5BC2E0E');
        $this->addSql('ALTER TABLE trip_destinations DROP FOREIGN KEY FK_20AA085A816C6140');
        $this->addSql('ALTER TABLE trip_categories DROP FOREIGN KEY FK_CFE19D7EA5BC2E0E');
        $this->addSql('ALTER TABLE trip_categories DROP FOREIGN KEY FK_CFE19D7E12469DE2');
        $this->addSql('ALTER TABLE user_roles DROP FOREIGN KEY FK_54FCD59FA76ED395');
        $this->addSql('ALTER TABLE user_roles DROP FOREIGN KEY FK_54FCD59FD60322AC');
        $this->addSql('DROP TABLE bookings');
        $this->addSql('DROP TABLE categories');
        $this->addSql('DROP TABLE destinations');
        $this->addSql('DROP TABLE organizer_profiles');
        $this->addSql('DROP TABLE payments');
        $this->addSql('DROP TABLE roles');
        $this->addSql('DROP TABLE trip_images');
        $this->addSql('DROP TABLE trip_sessions');
        $this->addSql('DROP TABLE trips');
        $this->addSql('DROP TABLE trip_destinations');
        $this->addSql('DROP TABLE trip_categories');
        $this->addSql('DROP TABLE users');
        $this->addSql('DROP TABLE user_roles');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
