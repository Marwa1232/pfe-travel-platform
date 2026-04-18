<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260416150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create favorites table for user trip favorites';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE favorites (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            trip_id INT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX IDX_5FA6DB9A76ED395 (user_id),
            INDEX IDX_5FA6DB9A5A05F7 (trip_id),
            UNIQUE INDEX unique_user_trip (user_id, trip_id),
            CONSTRAINT FK_5FA6DB9A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            CONSTRAINT FK_5FA6DB9A5A05F7 FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE=InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE favorites');
    }
}
