import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log("Seeding categories for Seen Hijabi...");

  const categories = [
    { name: "فساتين | Dresses", slug: "dresses", displayOrder: 1 },
    { name: "عبايات | Abayas", slug: "abayas", displayOrder: 2 },
    { name: "طرح وحجابات | Hijabs & Scarves", slug: "hijabs", displayOrder: 3 },
    { name: "قمصان وبلوزات | Shirts & Tops", slug: "shirts-tops", displayOrder: 4 },
    { name: "سيتات وأطقم | Sets & Outfits", slug: "sets", displayOrder: 5 },
    { name: "إكسسوارات الحجاب | Accessories", slug: "accessories", displayOrder: 6 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, displayOrder: cat.displayOrder },
      create: { name: cat.name, slug: cat.slug, displayOrder: cat.displayOrder, isActive: true },
    });
  }

  // Ensure StoreSettings exists
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "Seen Hijabi",
      whatsappNumber: "+201000000000",
      instagramUrl: "https://www.instagram.com/seen.hijabi/",
      currency: "EGP",
      announcementText: "شحن مجاني لجميع محافظات مصر للطلبات المؤهلة | Free Shipping on Qualified Orders",
      announcementEnabled: true,
    },
  });

  // Ensure ShippingSettings exists
  await prisma.shippingSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      freeShippingEnabled: true,
      freeShippingMinAmount: 1000.0,
      freeShippingMinQty: 2,
      fixedShippingCost: 65.0,
    },
  });

  console.log("Categories and initial settings seeded successfully!");
}

seed()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

