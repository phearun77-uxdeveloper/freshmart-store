import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('Seeding FreshMart database...');

  // 1. Initial Store Settings
  const defaultSettings = [
    { key: 'STORE_NAME', value: 'FreshMart Supermarket' },
    { key: 'STORE_EMAIL', value: 'support@freshmart.local' },
    { key: 'STORE_PHONE', value: '+1 (800) 555-FRES' },
    { key: 'DELIVERY_FEE', value: '4.99' },
    { key: 'FREE_DELIVERY_THRESHOLD', value: '45.00' },
    { key: 'STORE_HOURS', value: 'Mon - Sun: 7:00 AM - 10:00 PM' },
    { key: 'STORE_STATUS', value: 'OPEN' },
    { key: 'DEFAULT_LOW_STOCK_THRESHOLD', value: '10' }
  ];

  for (const setting of defaultSettings) {
    await prisma.storeSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // 2. Users (Admin and Demo Customer)
  const adminPasswordHash = await bcrypt.hash('AdminFresh2026!', 10);
  const customerPasswordHash = await bcrypt.hash('CustomerPass123!', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@freshmart.local' },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
    create: {
      name: 'Eleanor Vance',
      email: 'admin@freshmart.local',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      phone: '+1 (555) 019-2831',
      address: '100 Market St, Suite 400, San Francisco, CA'
    }
  });

  const demoCustomer = await prisma.user.upsert({
    where: { email: 'customer@freshmart.local' },
    update: {
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
    },
    create: {
      name: 'Sarah Jenkins',
      email: 'customer@freshmart.local',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      phone: '+1 (555) 438-9201',
      address: '742 Evergreen Terrace, Springfield, OR 97477'
    }
  });

  // Ensure Customer Cart exists
  await prisma.cart.upsert({
    where: { userId: demoCustomer.id },
    update: {},
    create: { userId: demoCustomer.id }
  });

  // 3. Categories
  const categoriesData = [
    {
      name: 'Fruits & Berries',
      slug: 'fruits-berries',
      description: 'Hand-picked crisp apples, fresh organic berries, and tropical fruits.',
      imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Fresh Vegetables',
      slug: 'fresh-vegetables',
      description: 'Crisp greens, root vegetables, vine-ripened tomatoes, and organic herbs.',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Dairy & Farm Eggs',
      slug: 'dairy-eggs',
      description: 'Farm-fresh whole milk, artisanal cheeses, organic butter, and pasture-raised eggs.',
      imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Artisanal Bakery',
      slug: 'bakery',
      description: 'Slow-fermented sourdough, fresh baguettes, wholesome croissants, and grain breads.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Meat & Wild Seafood',
      slug: 'meat-seafood',
      description: 'Grass-fed beef, tender organic poultry, and sustainably sourced salmon fillets.',
      imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Pantry & Grains',
      slug: 'pantry-grains',
      description: 'Extra virgin olive oil, whole grains, organic pasta, fragrant rice, and natural spices.',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Beverages & Juices',
      slug: 'beverages',
      description: 'Cold-pressed botanical juices, organic whole-bean coffee, and natural spring water.',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Household Essentials',
      slug: 'household',
      description: 'Eco-friendly cleaning supplies, recycled paper products, and gentle plant-based soaps.',
      imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const categoryMap = new Map<string, number>();

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.slug, createdCat.id);
  }

  // 4. Products (32 Authentic Supermarket Items)
  const productsData = [
    // Fruits & Berries
    {
      name: 'Organic Honeycrisp Apples',
      slug: 'organic-honeycrisp-apples',
      sku: 'FRU-APP-001',
      description: 'Crisp, sweet, and bursting with cider-like juice. Grown locally in pesticide-free orchards.',
      price: 3.99,
      promotionalPrice: 3.49,
      unit: 'per kg',
      stockQuantity: 48,
      lowStockThreshold: 15,
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: true,
      categorySlug: 'fruits-berries'
    },
    {
      name: 'Fresh Organic Cavendish Bananas',
      slug: 'fresh-organic-bananas',
      sku: 'FRU-BAN-002',
      description: 'Naturally ripened, potassium-rich golden bananas with smooth sweetness.',
      price: 1.89,
      promotionalPrice: null,
      unit: 'per bunch (approx 1.2kg)',
      stockQuantity: 65,
      lowStockThreshold: 20,
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'fruits-berries'
    },
    {
      name: 'Fresh Organic Blueberries',
      slug: 'fresh-organic-blueberries',
      sku: 'FRU-BLU-003',
      description: 'Plump, antioxidant-rich dark berries packed with vibrant sweet-tart flavor.',
      price: 4.50,
      promotionalPrice: 3.99,
      unit: 'per 250g punnet',
      stockQuantity: 34,
      lowStockThreshold: 10,
      imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: true,
      categorySlug: 'fruits-berries'
    },
    {
      name: 'Sweet California Navel Oranges',
      slug: 'sweet-navel-oranges',
      sku: 'FRU-ORA-004',
      description: 'Seedless, easy to peel, and packed with 100% daily Vitamin C per fruit.',
      price: 4.29,
      promotionalPrice: null,
      unit: 'per 2kg bag',
      stockQuantity: 42,
      lowStockThreshold: 12,
      imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'fruits-berries'
    },

    // Fresh Vegetables
    {
      name: 'Heirloom Vine-Ripened Tomatoes',
      slug: 'heirloom-vine-tomatoes',
      sku: 'VEG-TOM-001',
      description: 'Rich, aromatic heirloom varieties harvested on the vine for deep garden flavor.',
      price: 4.49,
      promotionalPrice: 3.89,
      unit: 'per kg',
      stockQuantity: 28,
      lowStockThreshold: 10,
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: true,
      categorySlug: 'fresh-vegetables'
    },
    {
      name: 'Organic Baby Spinach Leaves',
      slug: 'organic-baby-spinach',
      sku: 'VEG-SPI-002',
      description: 'Tender, pre-washed nutrient-dense baby greens perfect for salads and smoothies.',
      price: 2.99,
      promotionalPrice: null,
      unit: 'per 300g tub',
      stockQuantity: 22,
      lowStockThreshold: 8,
      imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'fresh-vegetables'
    },
    {
      name: 'Yukon Gold Potatoes',
      slug: 'yukon-gold-potatoes',
      sku: 'VEG-POT-003',
      description: 'Naturally buttery and creamy texture, ideal for roasting, mashing, or baking.',
      price: 3.75,
      promotionalPrice: null,
      unit: 'per 2.5kg bag',
      stockQuantity: 50,
      lowStockThreshold: 15,
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'fresh-vegetables'
    },
    {
      name: 'Crisp Yellow Sweet Onions',
      slug: 'crisp-yellow-onions',
      sku: 'VEG-ONI-004',
      description: 'Versatile kitchen staple with gentle caramel sweetness when sautéed.',
      price: 2.49,
      promotionalPrice: 1.99,
      unit: 'per 1.5kg bag',
      stockQuantity: 38,
      lowStockThreshold: 10,
      imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'fresh-vegetables'
    },

    // Dairy & Farm Eggs
    {
      name: 'Organic Whole Pasture Milk',
      slug: 'organic-whole-pasture-milk',
      sku: 'DAI-MIL-001',
      description: 'Non-homogenized rich pasture-raised dairy milk from family-owned regional farms.',
      price: 4.89,
      promotionalPrice: null,
      unit: 'per 2-litre bottle',
      stockQuantity: 30,
      lowStockThreshold: 12,
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: true,
      categorySlug: 'dairy-eggs'
    },
    {
      name: 'Free-Range Brown Eggs (Grade A)',
      slug: 'free-range-brown-eggs',
      sku: 'DAI-EGG-002',
      description: 'Pasture-foraged hens providing deep amber yolks with high Omega-3 content.',
      price: 5.25,
      promotionalPrice: 4.65,
      unit: 'carton of 12 eggs',
      stockQuantity: 55,
      lowStockThreshold: 15,
      imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: true,
      categorySlug: 'dairy-eggs'
    },
    {
      name: 'Aged Vermont Sharp White Cheddar',
      slug: 'aged-white-cheddar',
      sku: 'DAI-CHE-003',
      description: 'Naturally cave-aged for 18 months, delivering complex crumbly texture and bold tang.',
      price: 6.95,
      promotionalPrice: null,
      unit: 'per 250g block',
      stockQuantity: 18,
      lowStockThreshold: 6,
      imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'dairy-eggs'
    },
    {
      name: 'Cultured Salted Creamery Butter',
      slug: 'cultured-salted-butter',
      sku: 'DAI-BUT-004',
      description: 'Slow-churned European-style butter with 83% butterfat and sea salt flakes.',
      price: 4.99,
      promotionalPrice: 4.29,
      unit: 'per 250g pack',
      stockQuantity: 40,
      lowStockThreshold: 10,
      imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'dairy-eggs'
    },

    // Artisanal Bakery
    {
      name: 'San Francisco Sourdough Loaf',
      slug: 'sf-sourdough-loaf',
      sku: 'BAK-SOU-001',
      description: 'Naturally leavened with wild yeast, blistered crackling crust, and soft open crumb.',
      price: 5.49,
      promotionalPrice: null,
      unit: 'per 750g loaf',
      stockQuantity: 24,
      lowStockThreshold: 8,
      imageUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: true,
      categorySlug: 'bakery'
    },
    {
      name: 'Authentic French Baguette',
      slug: 'authentic-french-baguette',
      sku: 'BAK-BAG-002',
      description: 'Traditional 24-hour poolish fermentation, golden crisp exterior, and airy interior.',
      price: 2.89,
      promotionalPrice: 2.49,
      unit: 'per loaf (350g)',
      stockQuantity: 35,
      lowStockThreshold: 10,
      imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'bakery'
    },
    {
      name: 'Butter Croissants (4-Pack)',
      slug: 'butter-croissants-4pack',
      sku: 'BAK-CRO-003',
      description: 'Layered with pure grade-A creamery butter for unmatched flaky, airy layers.',
      price: 6.20,
      promotionalPrice: null,
      unit: 'pack of 4',
      stockQuantity: 19,
      lowStockThreshold: 5,
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'bakery'
    },
    {
      name: 'Ancient Spelt & Seed Bread',
      slug: 'ancient-spelt-seed-bread',
      sku: 'BAK-SPE-004',
      description: 'Wholesome organic spelt flour packed with toasted sunflower and pumpkin seeds.',
      price: 5.75,
      promotionalPrice: null,
      unit: 'per 600g loaf',
      stockQuantity: 15,
      lowStockThreshold: 5,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'bakery'
    },

    // Meat & Wild Seafood
    {
      name: 'Wild Alaskan Sockeye Salmon Fillet',
      slug: 'wild-alaskan-salmon',
      sku: 'MEA-SAL-001',
      description: 'Sustainably wild-caught in cold Pacific waters, rich in natural omega-3 fatty acids.',
      price: 14.99,
      promotionalPrice: 12.99,
      unit: 'per 500g fillet',
      stockQuantity: 16,
      lowStockThreshold: 6,
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: true,
      categorySlug: 'meat-seafood'
    },
    {
      name: 'Organic Free-Range Chicken Breasts',
      slug: 'organic-chicken-breasts',
      sku: 'MEA-CHI-002',
      description: 'Skinless and boneless, humanely pasture-raised without antibiotics or added hormones.',
      price: 9.89,
      promotionalPrice: null,
      unit: 'per 800g pack',
      stockQuantity: 28,
      lowStockThreshold: 10,
      imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'meat-seafood'
    },
    {
      name: 'Grass-Fed Angus Ribeye Steak',
      slug: 'grass-fed-angus-ribeye',
      sku: 'MEA-RIB-003',
      description: 'Prime marbling, 100% grass-fed and finished for intense beef tenderness and rich flavor.',
      price: 18.50,
      promotionalPrice: 16.99,
      unit: 'per 400g steak',
      stockQuantity: 14,
      lowStockThreshold: 5,
      imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: true,
      categorySlug: 'meat-seafood'
    },
    {
      name: 'Wild Atlantic Jumbo Sea Scallops',
      slug: 'wild-atlantic-scallops',
      sku: 'MEA-SCA-004',
      description: 'Dry-packed fresh sea scallops that sear to a golden caramelized crust.',
      price: 19.99,
      promotionalPrice: null,
      unit: 'per 450g pack',
      stockQuantity: 12,
      lowStockThreshold: 4,
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'meat-seafood'
    },

    // Pantry & Grains
    {
      name: 'Cold-Pressed Extra Virgin Olive Oil',
      slug: 'extra-virgin-olive-oil',
      sku: 'PAN-OIL-001',
      description: 'Single-estate Koroneiki olives cold-pressed within 4 hours of harvest. Fruity peppery finish.',
      price: 13.50,
      promotionalPrice: 11.95,
      unit: 'per 750ml glass bottle',
      stockQuantity: 32,
      lowStockThreshold: 8,
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: true,
      categorySlug: 'pantry-grains'
    },
    {
      name: 'Organic Bronze-Cut Spaghetti',
      slug: 'organic-bronze-cut-spaghetti',
      sku: 'PAN-PAS-002',
      description: 'Extruded through bronze dies from 100% durum semolina for superior sauce adhesion.',
      price: 3.25,
      promotionalPrice: null,
      unit: 'per 500g box',
      stockQuantity: 60,
      lowStockThreshold: 15,
      imageUrl: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'pantry-grains'
    },
    {
      name: 'Aromatic Himalayan Basmati Rice',
      slug: 'himalayan-basmati-rice',
      sku: 'PAN-RIC-003',
      description: 'Aged for two full years in Himalayan foothills, producing slender non-sticky grains.',
      price: 8.90,
      promotionalPrice: 7.75,
      unit: 'per 2kg bag',
      stockQuantity: 45,
      lowStockThreshold: 12,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'pantry-grains'
    },
    {
      name: 'Wildflower Raw Honey Jar',
      slug: 'wildflower-raw-honey',
      sku: 'PAN-HON-004',
      description: 'Unfiltered, unpasteurized honey retaining pure enzymes, bee pollen, and floral nectar.',
      price: 7.50,
      promotionalPrice: null,
      unit: 'per 450g glass jar',
      stockQuantity: 26,
      lowStockThreshold: 8,
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'pantry-grains'
    },

    // Beverages & Juices
    {
      name: 'Cold-Pressed Green Glow Juice',
      slug: 'cold-pressed-green-juice',
      sku: 'BEV-JUI-001',
      description: 'Crisp blend of kale, green apple, cucumber, celery, and Meyer lemon. Zero added sugar.',
      price: 5.95,
      promotionalPrice: 4.95,
      unit: 'per 500ml bottle',
      stockQuantity: 20,
      lowStockThreshold: 8,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: true,
      categorySlug: 'beverages'
    },
    {
      name: 'Organic Whole Bean Dark Roast Coffee',
      slug: 'organic-whole-bean-coffee',
      sku: 'BEV-COF-002',
      description: 'Fair-trade shade-grown beans from Colombia with velvety notes of dark cacao and hazelnut.',
      price: 11.50,
      promotionalPrice: null,
      unit: 'per 350g bag',
      stockQuantity: 35,
      lowStockThreshold: 10,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: true,
      categorySlug: 'beverages'
    },
    {
      name: 'Natural Alpine Sparkling Water (6-Pack)',
      slug: 'alpine-sparkling-water',
      sku: 'BEV-WAT-003',
      description: 'Bottled at source from mountain aquifers with fine effervescent mineral carbonation.',
      price: 6.50,
      promotionalPrice: 5.50,
      unit: '6 x 330ml glass bottles',
      stockQuantity: 40,
      lowStockThreshold: 12,
      imageUrl: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'beverages'
    },
    {
      name: 'Organic English Breakfast Black Tea',
      slug: 'organic-english-breakfast-tea',
      sku: 'BEV-TEA-004',
      description: 'Robust blend of premium Assam and Ceylon leaves for an invigorating morning cup.',
      price: 6.25,
      promotionalPrice: null,
      unit: 'box of 40 sachets',
      stockQuantity: 28,
      lowStockThreshold: 8,
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'beverages'
    },

    // Household Essentials
    {
      name: 'Plant-Based Citrus Dish Soap',
      slug: 'plant-based-dish-soap',
      sku: 'HOU-DIS-001',
      description: 'Cuts grease effectively using natural citrus extracts and coconut-based surfactants.',
      price: 3.99,
      promotionalPrice: null,
      unit: 'per 750ml pump bottle',
      stockQuantity: 38,
      lowStockThreshold: 10,
      imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'household'
    },
    {
      name: 'Eco-Friendly Bamboo Paper Towels',
      slug: 'eco-bamboo-paper-towels',
      sku: 'HOU-TOW-002',
      description: 'Ultra-absorbent 2-ply towels made from 100% sustainable organic bamboo fibers.',
      price: 8.99,
      promotionalPrice: 7.99,
      unit: 'pack of 6 rolls',
      stockQuantity: 30,
      lowStockThreshold: 10,
      imageUrl: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'household'
    },
    {
      name: 'Lavender Fields Laundry Detergent',
      slug: 'lavender-laundry-detergent',
      sku: 'HOU-LAU-003',
      description: 'Concentrated natural enzyme formula scented with pure French lavender essential oil.',
      price: 12.95,
      promotionalPrice: 11.20,
      unit: 'per 1.8-litre bottle (64 loads)',
      stockQuantity: 22,
      lowStockThreshold: 8,
      imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'household'
    },
    {
      name: 'Botanical Shea Butter Hand Wash',
      slug: 'botanical-shea-hand-wash',
      sku: 'HOU-SOA-004',
      description: 'Gentle, moisturizing formula enriched with organic shea butter and soothing chamomile.',
      price: 4.80,
      promotionalPrice: null,
      unit: 'per 500ml pump bottle',
      stockQuantity: 44,
      lowStockThreshold: 12,
      imageUrl: 'https://images.unsplash.com/photo-1608248597358-1e43485e921b?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      isFeatured: false,
      categorySlug: 'household'
    }
  ];

  for (const prod of productsData) {
    const categoryId = categoryMap.get(prod.categorySlug);
    if (!categoryId) continue;

    const { categorySlug, ...cleanProd } = prod;

    const createdProd = await prisma.product.upsert({
      where: { sku: cleanProd.sku },
      update: {
        ...cleanProd,
        categoryId,
      },
      create: {
        ...cleanProd,
        categoryId,
      }
    });

    // Record initial inventory movement if none exists
    const existingMovement = await prisma.inventoryMovement.findFirst({
      where: { productId: createdProd.id }
    });

    if (!existingMovement) {
      await prisma.inventoryMovement.create({
        data: {
          productId: createdProd.id,
          changeQuantity: createdProd.stockQuantity,
          reason: 'INITIAL_SEED_RESTOCK',
          adminUserId: adminUser.id,
        }
      });
    }
  }

  // 5. Seed a sample past completed order for the demo customer so order history works out-of-the-box
  const existingOrder = await prisma.order.findFirst({
    where: { userId: demoCustomer.id }
  });

  if (!existingOrder) {
    const orderProduct1 = await prisma.product.findFirst({ where: { sku: 'FRU-APP-001' } });
    const orderProduct2 = await prisma.product.findFirst({ where: { sku: 'DAI-EGG-002' } });

    if (orderProduct1 && orderProduct2) {
      const subtotal = (orderProduct1.price * 2) + orderProduct2.price;
      const deliveryFee = 4.99;
      const totalAmount = subtotal + deliveryFee;

      await prisma.order.create({
        data: {
          orderNumber: 'FM-2026-1001',
          userId: demoCustomer.id,
          status: 'DELIVERED',
          paymentMethod: 'CASH_ON_DELIVERY',
          paymentStatus: 'COMPLETED',
          subtotal,
          deliveryFee,
          totalAmount,
          deliveryName: demoCustomer.name,
          deliveryPhone: demoCustomer.phone || '+1 555-438-9201',
          deliveryAddress: demoCustomer.address || '742 Evergreen Terrace, Springfield, OR',
          deliveryNotes: 'Please leave with reception or on the front porch.',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          items: {
            create: [
              {
                productId: orderProduct1.id,
                productNameSnapshot: orderProduct1.name,
                unitPriceSnapshot: orderProduct1.price,
                quantity: 2,
                subtotal: orderProduct1.price * 2
              },
              {
                productId: orderProduct2.id,
                productNameSnapshot: orderProduct2.name,
                unitPriceSnapshot: orderProduct2.price,
                quantity: 1,
                subtotal: orderProduct2.price
              }
            ]
          }
        }
      });
    }
  }

  console.log('Database seeded successfully with 8 categories, 32 products, store settings, demo users, and sample orders.');
}

// Execute if run directly
seedDatabase()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
