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
      passengerCapacity: 2,
      transmission: TransmissionType.SEMI_AUTOMATIC,
      licensePlate: "ATN-0001",
      dailyRate: 450.0,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
      images: [
        {
          imageUrl:
            "https://hondafreeway.com.br/wp-content/uploads/2023/07/TRX420-Verde01.png",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
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
      images: [
        {
          imageUrl:
            "https://cloudfront.alpes.one/public/672/516/fac/672516fac532e959610285.png",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      type: VehicleType.QUADRICYCLE,
      brand: "Honda",
      model: "TRX 420 FourTrax",
      year: 2024,
      color: "Vermelho",
      passengerCapacity: 2,
      transmission: TransmissionType.SEMI_AUTOMATIC,
      licensePlate: "ATN-0003",
      dailyRate: 450.0,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
      images: [
        {
          imageUrl:
            "https://cloudfront.alpes.one/public/672/516/fac/672516fac532e959610285.png",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      type: VehicleType.QUADRICYCLE,
      brand: "Honda",
      model: "TRX 420 FourTrax",
      year: 2024,
      color: "Vermelho",
      passengerCapacity: 2,
      transmission: TransmissionType.SEMI_AUTOMATIC,
      licensePlate: "ATN-0004",
      dailyRate: 450.0,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
      images: [
        {
          imageUrl:
            "https://cloudfront.alpes.one/public/672/516/fac/672516fac532e959610285.png",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      type: VehicleType.QUADRICYCLE,
      brand: "Honda",
      model: "TRX 420 FourTrax",
      year: 2024,
      color: "Vermelho",
      passengerCapacity: 2,
      transmission: TransmissionType.SEMI_AUTOMATIC,
      licensePlate: "ATN-0005",
      dailyRate: 450.0,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
      images: [
        {
          imageUrl:
            "https://cloudfront.alpes.one/public/672/516/fac/672516fac532e959610285.png",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      type: VehicleType.QUADRICYCLE,
      brand: "CFMOTO",
      model: "CFORCE 520L",
      year: 2024,
      color: "Jet Black",
      passengerCapacity: 2,
      transmission: TransmissionType.AUTOMATIC,
      licensePlate: "CFM-0520",
      dailyRate: 600.0,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
      images: [
        {
          imageUrl:
            "https://www.cfmoto.com/content/dam/cfmoto/site/global/product/atv/atv/cforce-520/2026/model2.png",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
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
      images: [
        {
          imageUrl:
            "https://can-am.brp.com/adobe/dynamicmedia/deliver/dm-aid--9e5b5095-302f-46d0-af2a-4d68d52c571b/orv-my26-ssv-maverick-x3-ds-turbo-scandi-blue-orange-crush-0009dtc00-studio-34fr-na.png",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
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
      images: [
        {
          imageUrl:
            "https://can-am.brp.com/content/dam/global/en/can-am-off-road/my26/studio/na/ssv/maverick-x3/ORV-MY26-SSV-Maverick-X3-MAX-Xrc-TURBO-RR-Loft-Green-Satin-0009MTF00-STUDIO-34FR-NA.png",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      type: VehicleType.UTV,
      brand: "Can-Am",
      model: "Defender MAX",
      year: 2024,
      color: "Verde Militar",
      passengerCapacity: 6,
      transmission: TransmissionType.AUTOMATIC,
      licensePlate: "UTV-0005",
      dailyRate: 2000.0,
      status: VehicleStatus.AVAILABLE,
      isActive: true,
      images: [
        {
          imageUrl:
            "https://can-am.brp.com/adobe/dynamicmedia/deliver/dm-aid--6506e3b6-f9cb-4353-8c35-98c1ef60414e/orv-ssv-my25-defender-base-hd7-compass-green-0006xsc00-studio-34fr-intl.png",
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
  ];

  for (const item of vehicles) {
    const { images, ...vehicleData } = item;

    const vehicle = await prisma.vehicle.upsert({
      where: { licensePlate: vehicleData.licensePlate },
      update: vehicleData,
      create: vehicleData,
    });

    await prisma.vehicleImage.deleteMany({
      where: { vehicleId: vehicle.id },
    });

    for (const image of images) {
      await prisma.vehicleImage.create({
        data: {
          ...image,
          vehicleId: vehicle.id,
        },
      });
    }
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
