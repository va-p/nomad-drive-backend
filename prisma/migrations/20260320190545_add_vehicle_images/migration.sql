-- CreateTable
CREATE TABLE `vehicle_images` (
    `id` VARCHAR(191) NOT NULL,
    `vehicle_id` VARCHAR(191) NOT NULL,
    `image_url` TEXT NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `caption` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `vehicle_images_vehicle_id_idx`(`vehicle_id`),
    INDEX `vehicle_images_vehicle_id_is_primary_idx`(`vehicle_id`, `is_primary`),
    INDEX `vehicle_images_vehicle_id_display_order_idx`(`vehicle_id`, `display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX IF NOT EXISTS `rentals_vehicle_id_idx` ON `rentals`(`vehicle_id`);

-- AddForeignKey
ALTER TABLE `vehicle_images` ADD CONSTRAINT `vehicle_images_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX IF NOT EXISTS `rentals_user_id_idx` ON `rentals`(`user_id`);
DROP INDEX IF EXISTS `rentals_user_id_fkey` ON `rentals`;
