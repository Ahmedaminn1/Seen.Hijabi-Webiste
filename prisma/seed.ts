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
  console.log("Seeding categories requested by client (Samar)...");

  // 1. Client specific categories
  const categoriesData = [
    { name: "بلوزات | Blouses", slug: "blouses", displayOrder: 1 },
    { name: "فساتين خروج | Outdoor Dresses", slug: "outdoor-dresses", displayOrder: 2 },
    { name: "سوتات وأطقم | Suits & Sets", slug: "suits-sets", displayOrder: 3 },
    { name: "بناطيل قماش | Fabric Pants", slug: "fabric-pants", displayOrder: 4 },
    { name: "جواكت | Jackets", slug: "jackets", displayOrder: 5 },
    { name: "كاردات وكارديجان | Cardigans", slug: "cardigans", displayOrder: 6 },
    { name: "طرح وحجابات | Hijabs & Scarves", slug: "hijabs", displayOrder: 7 },
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, displayOrder: cat.displayOrder, isActive: true },
      create: { name: cat.name, slug: cat.slug, displayOrder: cat.displayOrder, isActive: true },
    });
    categoryMap.set(cat.slug, c.id);
  }

  // Deactivate old unused categories if any
  await prisma.category.updateMany({
    where: { slug: { notIn: categoriesData.map((c) => c.slug) } },
    data: { isActive: false },
  });

  console.log("Categories synchronized successfully!");

  // 2. Ensure StoreSettings and ShippingSettings exist
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {
      storeName: "Seen Hijabi",
      announcementText: "شحن مجاني لجميع محافظات مصر للطلبات من 1,000 ج.م أو عند طلب قطعتين فأكثر",
      announcementEnabled: true,
      logoUrl: "/images/logo.png",
    },
    create: {
      id: "default",
      storeName: "Seen Hijabi",
      whatsappNumber: "+201000000000",
      instagramUrl: "https://www.instagram.com/seen.hijabi/",
      currency: "EGP",
      announcementText: "شحن مجاني لجميع محافظات مصر للطلبات من 1,000 ج.م أو عند طلب قطعتين فأكثر",
      announcementEnabled: true,
      logoUrl: "/images/logo.png",
    },
  });

  await prisma.shippingSettings.upsert({
    where: { id: "default" },
    update: {
      freeShippingEnabled: true,
      freeShippingMinAmount: 1000.0,
      freeShippingMinQty: 2,
      fixedShippingCost: 65.0,
    },
    create: {
      id: "default",
      freeShippingEnabled: true,
      freeShippingMinAmount: 1000.0,
      freeShippingMinQty: 2,
      fixedShippingCost: 65.0,
    },
  });

  // 3. Products Data for each requested category
  const products = [
    {
      name: "سوت أوفر سايز هودي وبنطلون ميلتون",
      slug: "oversized-hoodie-pants-suit",
      description: "طقم سوت مريح وأنيق مكون من هودي مريح وبنطلون قطن ميلتون مبطن، مثالي للإطلالات اليومية ومشاوير الجامعة والخروج السريع بطابع محتشم وراقي.",
      price: 1150,
      discountPercent: 15,
      isDiscountActive: true,
      isBestSeller: true,
      isNewArrival: true,
      isFeatured: true,
      categorySlug: "suits-sets",
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      colors: [
        { name: "بيج نود | Nude Beige", hexCode: "#D8C4B6" },
        { name: "أسود فاحم | Pure Black", hexCode: "#1E1E1E" },
        { name: "رمادي ميلانج | Melange Grey", hexCode: "#8E8E93" },
      ],
      sizes: ["M", "L", "XL"],
      stockPerVariant: 12,
    },
    {
      name: "فستان خروج كريب فاخر بحزام",
      slug: "luxury-crepe-outdoor-dress",
      description: "فستان خروج ناعم مصمم من قماش الكريب السعودي عالي الجودة مع قصة فضفاضة مريحة وحزام خصر متناسق، لا يشف ويوفر راحة وأناقة متكاملة للمناسبات والخروج.",
      price: 1350,
      discountPercent: null,
      isDiscountActive: false,
      isBestSeller: true,
      isNewArrival: true,
      isFeatured: true,
      categorySlug: "outdoor-dresses",
      imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
      colors: [
        { name: "بيج كريمي | Creamy Beige", hexCode: "#E8D8C8" },
        { name: "موف مغبر | Dusty Mauve", hexCode: "#7A687F" },
        { name: "زيتوني راقي | Olive Green", hexCode: "#556B2F" },
      ],
      sizes: ["S", "M", "L", "XL"],
      stockPerVariant: 10,
    },
    {
      name: "كارديجان صوف شتوي طويل مفتوح",
      slug: "long-open-winter-cardigan",
      description: "كارديجان مفتوح طويل بقماش صوف ناعم دافئ، يتميز بتصميم عصري وأكمام مريحة، يمكن تنسيقه مع فستان أو سوت لإطلالة شتوية مميزة وجذابة.",
      price: 950,
      discountPercent: 10,
      isDiscountActive: true,
      isBestSeller: true,
      isNewArrival: false,
      isFeatured: true,
      categorySlug: "cardigans",
      imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
      colors: [
        { name: "هافان دافئ | Warm Tan", hexCode: "#A0522D" },
        { name: "أوف وايت | Off White", hexCode: "#F5F5F0" },
        { name: "أسود | Black", hexCode: "#1A1A1A" },
      ],
      sizes: ["Free Size"],
      stockPerVariant: 15,
    },
    {
      name: "بلوزة ستان شيك بأكمام فوليوم",
      slug: "chic-satin-blouse-volume-sleeves",
      description: "بلوزة ستان حريري راقية بتفاصيل مميزة عند الياقة وأكمام مزمومة، مناسبة للمقابلات والزيارات الرسمية وتمنحك لمسة من الفخامة والنعومة.",
      price: 680,
      discountPercent: null,
      isDiscountActive: false,
      isBestSeller: false,
      isNewArrival: true,
      isFeatured: false,
      categorySlug: "blouses",
      imageUrl: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80",
      colors: [
        { name: "أبيض ناصع | Crisp White", hexCode: "#FFFFFF" },
        { name: "شامبانيا | Champagne", hexCode: "#F7E7CE" },
        { name: "نبيتي أنيق | Burgundy", hexCode: "#722F37" },
      ],
      sizes: ["S", "M", "L"],
      stockPerVariant: 8,
    },
    {
      name: "جاكت بليزر تويد أنيق مبطن",
      slug: "elegant-tweed-blazer-jacket",
      description: "جاكت بليزر من خامة التويد المتقنة مع بطانة حريرية وأزرار ذهبية عتيقة، يضفي هيبة وأناقة متناهية على أي إطلالة محتشمة.",
      price: 1650,
      discountPercent: 20,
      isDiscountActive: true,
      isBestSeller: true,
      isNewArrival: true,
      isFeatured: true,
      categorySlug: "jackets",
      imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
      colors: [
        { name: "كاروهات كحلي | Navy Plaid", hexCode: "#1B263B" },
        { name: "بيج تويد | Beige Tweed", hexCode: "#C4A482" },
      ],
      sizes: ["S", "M", "L"],
      stockPerVariant: 7,
    },
    {
      name: "بنطلون قماش كلاسيك بقصة وايد ليج",
      slug: "classic-wide-leg-fabric-pants",
      description: "بنطلون قماش صيفي/خريفي بقصة واسعة ومريحة مع جيوب جانبية وخصر مرتفع، قطعة أساسية لكل فتاة تبحث عن الراحة والأناقة المحتشمة.",
      price: 590,
      discountPercent: null,
      isDiscountActive: false,
      isBestSeller: true,
      isNewArrival: false,
      isFeatured: false,
      categorySlug: "fabric-pants",
      imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
      colors: [
        { name: "أسود كلاسيك | Classic Black", hexCode: "#111111" },
        { name: "بيج كاكاو | Cocoa Beige", hexCode: "#B39283" },
        { name: "رصاصي غامق | Dark Grey", hexCode: "#3A3A3C" },
      ],
      sizes: ["S", "M", "L", "XL"],
      stockPerVariant: 14,
    },
    {
      name: "طرحة شيفون كريب تركي فاخر",
      slug: "luxury-turkish-crepe-chiffon-hijab",
      description: "طرحة كريب شيفون تركي ثابتة على الرأس بدون تزحلق، خفيفة وسهلة اللف بأطراف ليزر مبرومة وألوان كلاسيكية تتناسب مع كافة الإطلالات.",
      price: 220,
      discountPercent: null,
      isDiscountActive: false,
      isBestSeller: true,
      isNewArrival: true,
      isFeatured: false,
      categorySlug: "hijabs",
      imageUrl: "/images/hero-model.jpg",
      colors: [
        { name: "نود بيج | Nude Beige", hexCode: "#E0D0C0" },
        { name: "كشمير روز | Cashmere Rose", hexCode: "#C98A7D" },
        { name: "أسود ملكي | Royal Black", hexCode: "#000000" },
      ],
      sizes: ["Free Size"],
      stockPerVariant: 25,
    },
  ];

  console.log("Seeding products with complete variants and inventory...");

  for (const prod of products) {
    const categoryId = categoryMap.get(prod.categorySlug);

    // Upsert Product
    const createdProduct = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        discountPercent: prod.discountPercent,
        isDiscountActive: prod.isDiscountActive,
        isBestSeller: prod.isBestSeller,
        isNewArrival: prod.isNewArrival,
        isFeatured: prod.isFeatured,
        categoryId: categoryId || null,
        isActive: true,
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        discountPercent: prod.discountPercent,
        isDiscountActive: prod.isDiscountActive,
        isBestSeller: prod.isBestSeller,
        isNewArrival: prod.isNewArrival,
        isFeatured: prod.isFeatured,
        categoryId: categoryId || null,
        isActive: true,
      },
    });

    // Primary Image
    await prisma.productImage.deleteMany({ where: { productId: createdProduct.id } });
    await prisma.productImage.create({
      data: {
        productId: createdProduct.id,
        url: prod.imageUrl,
        isPrimary: true,
        displayOrder: 0,
        altText: prod.name,
      },
    });

    // Colors
    await prisma.productColor.deleteMany({ where: { productId: createdProduct.id } });
    const colorRecords = [];
    for (const c of prod.colors) {
      const rec = await prisma.productColor.create({
        data: {
          productId: createdProduct.id,
          name: c.name,
          hexCode: c.hexCode,
        },
      });
      colorRecords.push(rec);
    }

    // Sizes
    await prisma.productSize.deleteMany({ where: { productId: createdProduct.id } });
    const sizeRecords = [];
    for (let i = 0; i < prod.sizes.length; i++) {
      const s = prod.sizes[i];
      const rec = await prisma.productSize.create({
        data: {
          productId: createdProduct.id,
          name: s,
          displayOrder: i,
        },
      });
      sizeRecords.push(rec);
    }

    // Variants (Matrix: Color x Size) + Inventory
    for (const color of colorRecords) {
      for (const size of sizeRecords) {
        const sku = `${prod.slug.slice(0, 6).toUpperCase()}-${color.name.slice(0, 3).toUpperCase()}-${size.name}`;
        const variant = await prisma.productVariant.upsert({
          where: {
            productId_colorId_sizeId: {
              productId: createdProduct.id,
              colorId: color.id,
              sizeId: size.id,
            },
          },
          update: { sku },
          create: {
            productId: createdProduct.id,
            colorId: color.id,
            sizeId: size.id,
            sku,
          },
        });

        await prisma.inventory.upsert({
          where: { variantId: variant.id },
          update: { quantity: prod.stockPerVariant },
          create: {
            variantId: variant.id,
            quantity: prod.stockPerVariant,
            lowStockThreshold: 2,
          },
        });
      }
    }
  }

  console.log("All categories, products, colors, sizes, and inventories seeded successfully!");
}

seed()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
