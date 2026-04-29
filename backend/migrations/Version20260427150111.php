<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260427150111 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE loyalty_offers (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, discount_type VARCHAR(30) NOT NULL, discount_value NUMERIC(10, 2) NOT NULL, points_required INT NOT NULL, is_active TINYINT DEFAULT 1 NOT NULL, expires_at DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, organizer_id INT NOT NULL, trip_id INT DEFAULT NULL, INDEX IDX_1D3B5A73876C4DDA (organizer_id), INDEX IDX_1D3B5A73A5BC2E0E (trip_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE loyalty_points (id INT AUTO_INCREMENT NOT NULL, total_points INT DEFAULT 0 NOT NULL, used_points INT DEFAULT 0 NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_E0C7D07DA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE loyalty_transactions (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(20) NOT NULL, points INT NOT NULL, description VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, booking_id INT DEFAULT NULL, INDEX IDX_F721D983A76ED395 (user_id), INDEX IDX_F721D9833301C60 (booking_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE loyalty_offers ADD CONSTRAINT FK_1D3B5A73876C4DDA FOREIGN KEY (organizer_id) REFERENCES organizer_profiles (id)');
        $this->addSql('ALTER TABLE loyalty_offers ADD CONSTRAINT FK_1D3B5A73A5BC2E0E FOREIGN KEY (trip_id) REFERENCES trips (id)');
        $this->addSql('ALTER TABLE loyalty_points ADD CONSTRAINT FK_E0C7D07DA76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE loyalty_transactions ADD CONSTRAINT FK_F721D983A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE loyalty_transactions ADD CONSTRAINT FK_F721D9833301C60 FOREIGN KEY (booking_id) REFERENCES bookings (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE loyalty_offers DROP FOREIGN KEY FK_1D3B5A73876C4DDA');
        $this->addSql('ALTER TABLE loyalty_offers DROP FOREIGN KEY FK_1D3B5A73A5BC2E0E');
        $this->addSql('ALTER TABLE loyalty_points DROP FOREIGN KEY FK_E0C7D07DA76ED395');
        $this->addSql('ALTER TABLE loyalty_transactions DROP FOREIGN KEY FK_F721D983A76ED395');
        $this->addSql('ALTER TABLE loyalty_transactions DROP FOREIGN KEY FK_F721D9833301C60');
        $this->addSql('DROP TABLE loyalty_offers');
        $this->addSql('DROP TABLE loyalty_points');
        $this->addSql('DROP TABLE loyalty_transactions');
    }
}
