-- AlterTable
ALTER TABLE `vehicles` ADD COLUMN `blocked_days_of_week` JSON NULL,
    ADD COLUMN `owner_id` VARCHAR(191) NULL,
    MODIFY `status` ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE', 'UNAVAILABLE', 'BLOCKED_BY_OWNER') NOT NULL DEFAULT 'AVAILABLE';

-- CreateTable
CREATE TABLE `owners` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `document` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `owners_document_key`(`document`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `vehicles_owner_id_idx` ON `vehicles`(`owner_id`);

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `owners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
