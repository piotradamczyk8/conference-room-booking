<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migracja tworząca tabele rooms i reservations.
 */
final class Version20260114140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Utworzenie tabel rooms i reservations z indeksami';
    }

    public function up(Schema $schema): void
    {
        // Tabela rooms
        $this->addSql('
            CREATE TABLE rooms (
                id UUID NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT DEFAULT NULL,
                capacity INTEGER NOT NULL,
                floor VARCHAR(50) DEFAULT NULL,
                amenities JSON NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(id)
            )
        ');
        
        $this->addSql('COMMENT ON COLUMN rooms.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN rooms.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN rooms.updated_at IS \'(DC2Type:datetime_immutable)\'');

        // Tabela reservations
        $this->addSql('
            CREATE TABLE reservations (
                id UUID NOT NULL,
                room_id UUID NOT NULL,
                reserved_by VARCHAR(100) NOT NULL,
                title VARCHAR(200) DEFAULT NULL,
                start_time TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                end_time TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                notes TEXT DEFAULT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(id)
            )
        ');
        
        $this->addSql('COMMENT ON COLUMN reservations.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN reservations.room_id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN reservations.start_time IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN reservations.end_time IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN reservations.created_at IS \'(DC2Type:datetime_immutable)\'');

        // Indeksy dla reservations
        $this->addSql('CREATE INDEX idx_reservation_time_range ON reservations (room_id, start_time, end_time)');
        $this->addSql('CREATE INDEX idx_reservation_start_time ON reservations (start_time)');

        // Foreign key
        $this->addSql('
            ALTER TABLE reservations 
            ADD CONSTRAINT fk_reservations_room 
            FOREIGN KEY (room_id) REFERENCES rooms (id) 
            ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        ');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE reservations DROP CONSTRAINT fk_reservations_room');
        $this->addSql('DROP TABLE reservations');
        $this->addSql('DROP TABLE rooms');
    }
}
