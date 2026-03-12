<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260312010016 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE ai_data CHANGE data data JSON DEFAULT NULL, CHANGE score score DOUBLE PRECISION DEFAULT NULL, CHANGE expires_at expires_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE bookings CHANGE updated_at updated_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE destinations CHANGE region region VARCHAR(100) DEFAULT NULL, CHANGE image image VARCHAR(500) DEFAULT NULL, CHANGE thumbnail thumbnail VARCHAR(500) DEFAULT NULL');
        $this->addSql('ALTER TABLE organizer_profiles ADD documents JSON DEFAULT NULL, CHANGE license_number license_number VARCHAR(100) DEFAULT NULL, CHANGE website website VARCHAR(255) DEFAULT NULL, CHANGE facebook facebook VARCHAR(255) DEFAULT NULL, CHANGE instagram instagram VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE payments CHANGE transaction_ref transaction_ref VARCHAR(100) DEFAULT NULL, CHANGE paid_at paid_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE trip_programs CHANGE created_at created_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE trips CHANGE currency currency VARCHAR(5) DEFAULT \'TND\' NOT NULL, CHANGE difficulty_level difficulty_level VARCHAR(20) DEFAULT \'medium\' NOT NULL, CHANGE slug slug VARCHAR(200) DEFAULT NULL, CHANGE status status VARCHAR(20) DEFAULT \'draft\' NOT NULL, CHANGE tags tags JSON DEFAULT NULL, CHANGE inclusions inclusions JSON DEFAULT NULL, CHANGE exclusions exclusions JSON DEFAULT NULL, CHANGE meeting_point meeting_point VARCHAR(255) DEFAULT NULL, CHANGE meeting_latitude meeting_latitude VARCHAR(100) DEFAULT NULL, CHANGE meeting_longitude meeting_longitude VARCHAR(100) DEFAULT NULL, CHANGE updated_at updated_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE users CHANGE roles roles JSON NOT NULL, CHANGE phone phone VARCHAR(20) DEFAULT NULL, CHANGE country country VARCHAR(50) DEFAULT \'Tunisia\' NOT NULL, CHANGE preferred_language preferred_language VARCHAR(5) DEFAULT \'fr\' NOT NULL, CHANGE preferred_currency preferred_currency VARCHAR(5) DEFAULT \'TND\' NOT NULL, CHANGE status_organizer status_organizer VARCHAR(20) DEFAULT \'none\' NOT NULL, CHANGE interests interests JSON DEFAULT NULL, CHANGE updated_at updated_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE messenger_messages CHANGE delivered_at delivered_at DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE ai_data CHANGE data data LONGTEXT DEFAULT NULL COLLATE `utf8mb4_bin`, CHANGE score score DOUBLE PRECISION DEFAULT \'NULL\', CHANGE expires_at expires_at DATETIME DEFAULT \'NULL\'');
        $this->addSql('ALTER TABLE bookings CHANGE updated_at updated_at DATETIME DEFAULT \'NULL\'');
        $this->addSql('ALTER TABLE destinations CHANGE region region VARCHAR(100) DEFAULT \'NULL\', CHANGE image image VARCHAR(500) DEFAULT \'NULL\', CHANGE thumbnail thumbnail VARCHAR(500) DEFAULT \'NULL\'');
        $this->addSql('ALTER TABLE messenger_messages CHANGE delivered_at delivered_at DATETIME DEFAULT \'NULL\'');
        $this->addSql('ALTER TABLE organizer_profiles DROP documents, CHANGE license_number license_number VARCHAR(100) DEFAULT \'NULL\', CHANGE website website VARCHAR(255) DEFAULT \'NULL\', CHANGE facebook facebook VARCHAR(255) DEFAULT \'NULL\', CHANGE instagram instagram VARCHAR(255) DEFAULT \'NULL\'');
        $this->addSql('ALTER TABLE payments CHANGE transaction_ref transaction_ref VARCHAR(100) DEFAULT \'NULL\', CHANGE paid_at paid_at DATETIME DEFAULT \'NULL\'');
        $this->addSql('ALTER TABLE trips CHANGE currency currency VARCHAR(5) DEFAULT \'\'\'TND\'\'\' NOT NULL, CHANGE difficulty_level difficulty_level VARCHAR(20) DEFAULT \'\'\'medium\'\'\' NOT NULL, CHANGE slug slug VARCHAR(200) DEFAULT \'NULL\', CHANGE status status VARCHAR(20) DEFAULT \'\'\'draft\'\'\' NOT NULL, CHANGE tags tags LONGTEXT DEFAULT NULL COLLATE `utf8mb4_bin`, CHANGE inclusions inclusions LONGTEXT DEFAULT NULL COLLATE `utf8mb4_bin`, CHANGE exclusions exclusions LONGTEXT DEFAULT NULL COLLATE `utf8mb4_bin`, CHANGE meeting_point meeting_point VARCHAR(255) DEFAULT \'NULL\', CHANGE meeting_latitude meeting_latitude VARCHAR(100) DEFAULT \'NULL\', CHANGE meeting_longitude meeting_longitude VARCHAR(100) DEFAULT \'NULL\', CHANGE updated_at updated_at DATETIME DEFAULT \'NULL\'');
        $this->addSql('ALTER TABLE trip_programs CHANGE created_at created_at DATETIME DEFAULT \'NULL\'');
        $this->addSql('ALTER TABLE users CHANGE roles roles LONGTEXT NOT NULL COLLATE `utf8mb4_bin`, CHANGE phone phone VARCHAR(20) DEFAULT \'NULL\', CHANGE country country VARCHAR(50) DEFAULT \'\'\'Tunisia\'\'\' NOT NULL, CHANGE preferred_language preferred_language VARCHAR(5) DEFAULT \'\'\'fr\'\'\' NOT NULL, CHANGE preferred_currency preferred_currency VARCHAR(5) DEFAULT \'\'\'TND\'\'\' NOT NULL, CHANGE status_organizer status_organizer VARCHAR(20) DEFAULT \'\'\'none\'\'\' NOT NULL, CHANGE interests interests LONGTEXT DEFAULT NULL COLLATE `utf8mb4_bin`, CHANGE updated_at updated_at DATETIME DEFAULT \'NULL\'');
    }
}
