import { prisma } from "../src/lib/prisma";
import { VehicleType, TransmissionType, VehicleStatus } from "@prisma/client";

async function main() {
  console.log("🌱 Starting vehicle seeding process...");

  const vehicles = [
    {
      type: VehicleType.QUADRICYCLE,
      brand: "Honda",
      model: "TRX 420 FourTrax",
      year: 2023,
      color: "Verde",
      passengerCapacity: 2, // Adapted with a custom seat for passenger
      transmission: TransmissionType.SEMI_AUTOMATIC,
      licensePlate: "ATN-0001",
      dailyRate: 450.0,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    {
      type: VehicleType.QUADRICYCLE,
      brand: "Honda",
      model: "TRX 420 FourTrax",
      year: 2024,
      color: "Vermelho",
      passengerCapacity: 2,
      transmission: TransmissionType.SEMI_AUTOMATIC,
      licensePlate: "ATN-0002",
      dailyRate: 450.0,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    {
      type: VehicleType.QUADRICYCLE,
      brand: "CFMOTO",
      model: "CFORCE 520L",
      year: 2024,
      color: "Azul",
      passengerCapacity: 2,
      transmission: TransmissionType.AUTOMATIC,
      licensePlate: "CFM-0520",
      dailyRate: 600.0,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    {
      type: VehicleType.UTV,
      brand: "Can-Am",
      model: "Maverick X3",
      year: 2023,
      color: "Preto/Amarelo",
      passengerCapacity: 2,
      transmission: TransmissionType.AUTOMATIC,
      licensePlate: "UTV-0002",
      dailyRate: 1500.0,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
    {
      type: VehicleType.UTV,
      brand: "Can-Am",
      model: "Maverick X3 MAX",
      year: 2024,
      color: "Preto",
      passengerCapacity: 4,
      transmission: TransmissionType.AUTOMATIC,
      licensePlate: "UTV-0004",
      dailyRate: 1800.0,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
    },
  ];

  // Insert or Update each vehicle into the database
  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: { licensePlate: vehicle.licensePlate },
      update: vehicle,
      create: vehicle,
    });
  }

  console.log("✅ Seeding completed successfully! Atins fleet is ready.");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
