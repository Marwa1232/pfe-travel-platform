<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260305235000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create ai_data table for storing AI recommendations and data';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE ai_data (
            id INT AUTO_INCREMENT NOT NULL,
            trip_id INT NOT NULL,
            user_id INT DEFAULT NULL,
            data_type VARCHAR(50) NOT NULL,
            data JSON DEFAULT NULL,
            score DOUBLE PRECISION DEFAULT NULL,
            generated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            expires_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            is_active TINYINT(1) NOT NULL,
            INDEX IDX_ai_data_trip_id (trip_id),
            INDEX IDX_ai_data_user_id (user_id),
            INDEX IDX_ai_data_data_type (data_type),
            INDEX IDX_ai_data_is_active (is_active),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE ai_data');
    }
}
