<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260516120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove preferred_language and preferred_currency columns from users table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("ALTER TABLE users DROP preferred_language, DROP preferred_currency");
    }

    public function down(Schema $schema): void
    {
        $this->addSql("ALTER TABLE users ADD preferred_language VARCHAR(5) DEFAULT 'fr' NOT NULL, ADD preferred_currency VARCHAR(5) DEFAULT 'TND' NOT NULL");
    }
}