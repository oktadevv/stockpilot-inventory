export const CATEGORIES = ["Beverages", "Snacks", "Dairy", "Frozen", "Household", "Personal Care", "Staples"];

export const INITIAL_PRODUCTS = [
  { id: 1, name: "Arabica Coffee Beans 1kg", sku: "BEV-1001", category: "Beverages", stock: 142, threshold: 20, cost: 8400, price: 14990, supplier: "Java Roast Co.", gradient: "from-violet-500 to-indigo-600", icon: "Coffee" },
  { id: 2, name: "Organic Whole Milk 1L", sku: "DAI-2004", category: "Dairy", stock: 18, threshold: 30, cost: 1100, price: 2490, supplier: "GreenFarm Dairy", gradient: "from-sky-400 to-blue-600", icon: "Milk" },
  { id: 3, name: "Croissant Butter 6-Pack", sku: "FRZ-3012", category: "Frozen", stock: 0, threshold: 15, cost: 2200, price: 4990, supplier: "FrostBite Foods", gradient: "from-amber-400 to-orange-600", icon: "Croissant" },
  { id: 4, name: "Sea Salt Potato Chips 150g", sku: "SNK-4021", category: "Snacks", stock: 86, threshold: 25, cost: 850, price: 2190, supplier: "CrunchLine", gradient: "from-yellow-400 to-amber-600", icon: "Cookie" },
  { id: 5, name: "Eco Dish Soap 500ml", sku: "HSH-5018", category: "Household", stock: 64, threshold: 20, cost: 1600, price: 3790, supplier: "CleanNest", gradient: "from-emerald-400 to-teal-600", icon: "Sparkles" },
  { id: 6, name: "Herbal Shampoo 400ml", sku: "PC-6011", category: "Personal Care", stock: 12, threshold: 20, cost: 2900, price: 6490, supplier: "VelvetLab", gradient: "from-pink-400 to-rose-600", icon: "Droplets" },
  { id: 7, name: "Basmati Rice 5kg", sku: "STP-7002", category: "Staples", stock: 210, threshold: 40, cost: 6200, price: 11990, supplier: "GoldenGrain", gradient: "from-lime-400 to-green-600", icon: "Wheat" },
  { id: 8, name: "Cold-Pressed Orange Juice 1L", sku: "BEV-1033", category: "Beverages", stock: 45, threshold: 20, cost: 1800, price: 3990, supplier: "SunOrchard", gradient: "from-orange-400 to-red-500", icon: "CupSoda" },
  { id: 9, name: "Dark Chocolate Bar 90g", sku: "SNK-4088", category: "Snacks", stock: 9, threshold: 20, cost: 1200, price: 2990, supplier: "Cacao House", gradient: "from-stone-500 to-stone-800", icon: "Candy" },
  { id: 10, name: "Greek Yogurt 500g", sku: "DAI-2042", category: "Dairy", stock: 73, threshold: 25, cost: 1500, price: 3290, supplier: "GreenFarm Dairy", gradient: "from-cyan-400 to-sky-600", icon: "Milk" },
  { id: 11, name: "Laundry Pods 30ct", sku: "HSH-5055", category: "Household", stock: 52, threshold: 15, cost: 4100, price: 8990, supplier: "CleanNest", gradient: "from-indigo-400 to-violet-600", icon: "WashingMachine" },
  { id: 12, name: "Sourdough Loaf 600g", sku: "FRZ-3077", category: "Frozen", stock: 27, threshold: 15, cost: 1400, price: 3490, supplier: "FrostBite Foods", gradient: "from-amber-500 to-yellow-600", icon: "Wheat" },
];

export const INITIAL_SUPPLIERS = [
  { id: 1, name: "Java Roast Co.", contact: "Sinta Prabowo", email: "sales@javaroast.id", phone: "+62 812 3400 1122", products: 14, rating: 4.9, status: "Active", gradient: "from-violet-500 to-indigo-600", lastOrder: "Sep 18, 2026" },
  { id: 2, name: "GreenFarm Dairy", contact: "Daniel Chen", email: "orders@greenfarm.co", phone: "+1 415 555 0132", products: 22, rating: 4.8, status: "Active", gradient: "from-emerald-400 to-teal-600", lastOrder: "Sep 20, 2026" },
  { id: 3, name: "CrunchLine Snacks", contact: "Amelia Hart", email: "hello@crunchline.com", phone: "+44 20 7946 0018", products: 31, rating: 4.6, status: "Active", gradient: "from-amber-400 to-orange-600", lastOrder: "Sep 15, 2026" },
  { id: 4, name: "CleanNest", contact: "Ravi Kumar", email: "b2b@cleannest.io", phone: "+91 98200 44321", products: 18, rating: 4.7, status: "Pending", gradient: "from-sky-400 to-blue-600", lastOrder: "Sep 10, 2026" },
  { id: 5, name: "FrostBite Foods", contact: "Lena Fischer", email: "supply@frostbite.eu", phone: "+49 30 901820", products: 12, rating: 4.5, status: "Active", gradient: "from-cyan-400 to-blue-600", lastOrder: "Sep 19, 2026" },
  { id: 6, name: "VelvetLab Care", contact: "Yuki Tanaka", email: "trade@velvetlab.jp", phone: "+81 90 1234 5678", products: 9, rating: 4.9, status: "Inactive", gradient: "from-pink-400 to-rose-600", lastOrder: "Aug 28, 2026" },
];

export const SALES_TREND = [
  { day: "Mon", sales: 1840000, stock: 920 },
  { day: "Tue", sales: 2210000, stock: 880 },
  { day: "Wed", sales: 1980000, stock: 940 },
  { day: "Thu", sales: 2780000, stock: 860 },
  { day: "Fri", sales: 3420000, stock: 810 },
  { day: "Sat", sales: 4180000, stock: 760 },
  { day: "Sun", sales: 3860000, stock: 720 },
];

export const REVENUE_BY_DAY = [
  { day: "Mon", revenue: 1840000 }, { day: "Tue", revenue: 2210000 }, { day: "Wed", revenue: 1980000 },
  { day: "Thu", revenue: 2780000 }, { day: "Fri", revenue: 3420000 }, { day: "Sat", revenue: 4180000 }, { day: "Sun", revenue: 3860000 },
];

export const CATEGORY_SHARE = [
  { name: "Beverages", value: 28 },
  { name: "Snacks", value: 22 },
  { name: "Dairy", value: 18 },
  { name: "Household", value: 16 },
  { name: "Others", value: 16 },
];
