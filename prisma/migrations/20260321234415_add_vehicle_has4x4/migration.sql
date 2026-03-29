-- AlterTable
ALTER TABLE `vehicles` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `has_4x4` BOOLEAN NOT NULL DEFAULT false;
