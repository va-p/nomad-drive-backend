/*
  Warnings:

  - Added the required column `passengerCapacity` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `vehicles` ADD COLUMN `passengerCapacity` INTEGER NOT NULL,
    MODIFY `transmission` ENUM('MANUAL', 'SEMI_AUTOMATIC', 'AUTOMATIC') NOT NULL;
