-- CreateIndex
CREATE INDEX IF NOT EXISTS `rentals_status_idx` ON `rentals`(`status`);

-- CreateIndex
CREATE INDEX IF NOT EXISTS `rentals_start_date_end_date_idx` ON `rentals`(`start_date`, `end_date`);

-- CreateIndex
CREATE INDEX IF NOT EXISTS `rentals_vehicle_id_status_start_date_end_date_idx` ON `rentals`(`vehicle_id`, `status`, `start_date`, `end_date`);

-- CreateIndex
CREATE INDEX IF NOT EXISTS `users_email_idx` ON `users`(`email`);

-- CreateIndex
CREATE INDEX IF NOT EXISTS `users_clerk_id_idx` ON `users`(`clerk_id`);

-- CreateIndex
CREATE INDEX IF NOT EXISTS `users_role_idx` ON `users`(`role`);

-- CreateIndex
CREATE INDEX IF NOT EXISTS `vehicles_status_idx` ON `vehicles`(`status`);

-- CreateIndex
CREATE INDEX IF NOT EXISTS `vehicles_type_idx` ON `vehicles`(`type`);

-- CreateIndex
CREATE INDEX IF NOT EXISTS `vehicles_is_active_idx` ON `vehicles`(`is_active`);

-- CreateIndex
CREATE INDEX IF NOT EXISTS `vehicles_status_is_active_idx` ON `vehicles`(`status`, `is_active`);

-- RedefineIndex - Create new index and safely drop old one if it exists
CREATE INDEX IF NOT EXISTS `rentals_user_id_idx` ON `rentals`(`user_id`);
DROP INDEX IF EXISTS `rentals_user_id_fkey` ON `rentals`;

-- RedefineIndex - Create new index and safely drop old one if it exists
CREATE INDEX IF NOT EXISTS `rentals_vehicle_id_idx` ON `rentals`(`vehicle_id`);
DROP INDEX IF EXISTS `rentals_vehicle_id_fkey` ON `rentals`;
