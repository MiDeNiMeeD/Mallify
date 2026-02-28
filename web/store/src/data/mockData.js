// Mock data for Boutique Owner Dashboard

export const dashboardStats = {
  totalRevenue: 45680,
  totalOrders: 328,
  pendingOrders: 15,
  completedOrders: 298,
  activeProducts: 87,
  lowStockProducts: 12,
  totalCustomers: 1240,
  averageRating: 4.7,
  monthlyGrowth: 12.5,
  revenueGrowth: 8.3,
};

export const recentOrders = [
  { id: "ORD-001", customer: "Sarah Johnson", items: 3, total: 245.50, status: "pending", date: "2026-02-14 10:30" },
  { id: "ORD-002", customer: "Michael Chen", items: 1, total: 89.99, status: "processing", date: "2026-02-14 09:15" },
  { id: "ORD-003", customer: "Emily Davis", items: 5, total: 432.00, status: "completed", date: "2026-02-13 16:45" },
  { id: "ORD-004", customer: "James Wilson", items: 2, total: 156.75, status: "pending", date: "2026-02-13 14:20" },
  { id: "ORD-005", customer: "Lisa Anderson", items: 4, total: 298.30, status: "completed", date: "2026-02-13 11:00" },
];

export const allOrders = [
  { id: "ORD-001", customer: "Sarah Johnson", email: "sarah.j@email.com", items: 3, total: 245.50, status: "pending", date: "2026-02-14 10:30", payment: "Credit Card" },
  { id: "ORD-002", customer: "Michael Chen", email: "m.chen@email.com", items: 1, total: 89.99, status: "processing", date: "2026-02-14 09:15", payment: "PayPal" },
  { id: "ORD-003", customer: "Emily Davis", email: "emily.d@email.com", items: 5, total: 432.00, status: "completed", date: "2026-02-13 16:45", payment: "Credit Card" },
  { id: "ORD-004", customer: "James Wilson", email: "j.wilson@email.com", items: 2, total: 156.75, status: "pending", date: "2026-02-13 14:20", payment: "Debit Card" },
  { id: "ORD-005", customer: "Lisa Anderson", email: "lisa.a@email.com", items: 4, total: 298.30, status: "completed", date: "2026-02-13 11:00", payment: "Credit Card" },
  { id: "ORD-006", customer: "Robert Taylor", email: "r.taylor@email.com", items: 2, total: 178.90, status: "processing", date: "2026-02-12 15:30", payment: "PayPal" },
  { id: "ORD-007", customer: "Jennifer White", email: "jen.white@email.com", items: 6, total: 545.25, status: "completed", date: "2026-02-12 13:00", payment: "Credit Card" },
  { id: "ORD-008", customer: "David Brown", email: "d.brown@email.com", items: 1, total: 65.00, status: "cancelled", date: "2026-02-12 10:45", payment: "Debit Card" },
  { id: "ORD-009", customer: "Maria Garcia", email: "maria.g@email.com", items: 3, total: 213.50, status: "completed", date: "2026-02-11 17:20", payment: "Credit Card" },
  { id: "ORD-010", customer: "Thomas Martinez", email: "t.martinez@email.com", items: 7, total: 678.00, status: "processing", date: "2026-02-11 14:15", payment: "PayPal" },
];

export const products = [
  { id: "PRD-001", name: "Summer Floral Dress", category: "Dresses", price: 89.99, stock: 45, status: "active", image: "dress1.jpg", sales: 124 },
  { id: "PRD-002", name: "Classic Denim Jacket", category: "Jackets", price: 129.99, stock: 8, status: "active", image: "jacket1.jpg", sales: 89 },
  { id: "PRD-003", name: "Leather Crossbody Bag", category: "Bags", price: 65.00, stock: 0, status: "out-of-stock", image: "bag1.jpg", sales: 156 },
  { id: "PRD-004", name: "Casual White Sneakers", category: "Shoes", price: 79.99, stock: 23, status: "active", image: "shoes1.jpg", sales: 201 },
  { id: "PRD-005", name: "Bohemian Maxi Skirt", category: "Skirts", price: 54.99, stock: 31, status: "active", image: "skirt1.jpg", sales: 78 },
  { id: "PRD-006", name: "Silk Evening Gown", category: "Dresses", price: 245.00, stock: 5, status: "active", image: "dress2.jpg", sales: 34 },
  { id: "PRD-007", name: "Designer Sunglasses", category: "Accessories", price: 159.99, stock: 67, status: "active", image: "sunglasses1.jpg", sales: 143 },
  { id: "PRD-008", name: "Wool Blend Coat", category: "Coats", price: 189.99, stock: 12, status: "active", image: "coat1.jpg", sales: 56 },
  { id: "PRD-009", name: "Pearl Necklace", category: "Jewelry", price: 98.50, stock: 3, status: "active", image: "necklace1.jpg", sales: 92 },
  { id: "PRD-010", name: "Vintage Leather Belt", category: "Accessories", price: 45.00, stock: 89, status: "active", image: "belt1.jpg", sales: 167 },
];

export const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
export const outOfStockProducts = products.filter(p => p.stock === 0);

export const promotions = [
  { id: "PROMO-001", name: "Spring Sale 2026", type: "Seasonal", discount: "20%", code: "SPRING20", startDate: "2026-03-01", endDate: "2026-03-31", status: "scheduled", uses: 0, maxUses: 1000 },
  { id: "PROMO-002", name: "Valentine's Special", type: "Holiday", discount: "$15 off", code: "LOVE15", startDate: "2026-02-10", endDate: "2026-02-15", status: "active", uses: 278, maxUses: 500 },
  { id: "PROMO-003", name: "New Customer Discount", type: "Welcome", discount: "10%", code: "WELCOME10", startDate: "2026-01-01", endDate: "2026-12-31", status: "active", uses: 456, maxUses: 0 },
  { id: "PROMO-004", name: "Flash Sale Weekend", type: "Flash Sale", discount: "30%", code: "FLASH30", startDate: "2026-02-08", endDate: "2026-02-09", status: "expired", uses: 523, maxUses: 500 },
  { id: "PROMO-005", name: "Buy 2 Get 1 Free", type: "BOGO", discount: "BOGO", code: "BOGO2026", startDate: "2026-02-01", endDate: "2026-02-28", status: "active", uses: 189, maxUses: 300 },
];

export const reviews = [
  { id: "REV-001", customer: "Sarah Johnson", product: "Summer Floral Dress", rating: 5, comment: "Absolutely love this dress! The quality is amazing and fits perfectly.", date: "2026-02-13", status: "approved" },
  { id: "REV-002", customer: "Michael Chen", product: "Classic Denim Jacket", rating: 4, comment: "Great jacket, but runs a bit small. Consider ordering one size up.", date: "2026-02-12", status: "approved" },
  { id: "REV-003", customer: "Emily Davis", product: "Leather Crossbody Bag", rating: 5, comment: "Perfect size and beautiful leather quality. Highly recommend!", date: "2026-02-12", status: "approved" },
  { id: "REV-004", customer: "James Wilson", product: "Casual White Sneakers", rating: 3, comment: "Comfortable but the color yellows quickly. Not as white as expected.", date: "2026-02-11", status: "pending" },
  { id: "REV-005", customer: "Lisa Anderson", product: "Bohemian Maxi Skirt", rating: 5, comment: "Stunning skirt! Got so many compliments. Will buy more colors.", date: "2026-02-10", status: "approved" },
  { id: "REV-006", customer: "Robert Taylor", product: "Designer Sunglasses", rating: 2, comment: "Disappointed with the quality. Feels cheap for the price.", date: "2026-02-09", status: "pending" },
];

export const messages = [
  { id: "MSG-001", customer: "Sarah Johnson", subject: "Question about sizing", message: "Hi, I'm interested in the Summer Floral Dress. Can you provide measurements for size M?", date: "2026-02-14 11:20", status: "unread" },
  { id: "MSG-002", customer: "Michael Chen", subject: "Order status inquiry", message: "When will my order #ORD-002 be shipped? It's been in processing for 2 days.", date: "2026-02-14 09:45", status: "unread" },
  { id: "MSG-003", customer: "Emily Davis", subject: "Thank you!", message: "Just received my order and everything is perfect! Thank you for the fast shipping.", date: "2026-02-13 18:30", status: "read" },
  { id: "MSG-004", customer: "James Wilson", subject: "Return request", message: "I'd like to return the sneakers. They don't fit well. What's the return process?", date: "2026-02-13 15:10", status: "replied" },
  { id: "MSG-005", customer: "Lisa Anderson", subject: "Wholesale inquiry", message: "Do you offer wholesale pricing for bulk orders? I'm interested in ordering 50+ pieces.", date: "2026-02-12 14:00", status: "read" },
];

export const analyticsData = [
  { month: "Aug", revenue: 28500, orders: 234 },
  { month: "Sep", revenue: 32100, orders: 267 },
  { month: "Oct", revenue: 29800, orders: 251 },
  { month: "Nov", revenue: 38200, orders: 289 },
  { month: "Dec", revenue: 42600, orders: 312 },
  { month: "Jan", revenue: 39400, orders: 298 },
  { month: "Feb", revenue: 45680, orders: 328 },
];

export const topProducts = [
  { name: "Casual White Sneakers", sales: 201, revenue: 16079.99 },
  { name: "Vintage Leather Belt", sales: 167, revenue: 7515.00 },
  { name: "Leather Crossbody Bag", sales: 156, revenue: 10140.00 },
  { name: "Designer Sunglasses", sales: 143, revenue: 22878.57 },
  { name: "Summer Floral Dress", sales: 124, revenue: 11158.76 },
];

export const ordersByStatus = [
  { status: "Completed", count: 298, percentage: 68.5 },
  { status: "Processing", count: 30, percentage: 6.9 },
  { status: "Pending", count: 15, percentage: 3.4 },
  { status: "Cancelled", count: 92, percentage: 21.2 },
];

export const customerLocations = [
  { city: "New York", orders: 125 },
  { city: "Los Angeles", orders: 98 },
  { city: "Chicago", orders: 76 },
  { city: "Houston", orders: 54 },
  { city: "Phoenix", orders: 43 },
];

export const boutiqueInfo = {
  name: "Fashion Haven Boutique",
  owner: "Alexandra Martinez",
  email: "contact@fashionhaven.com",
  phone: "+1 (555) 123-4567",
  address: "123 Fashion Street, New York, NY 10001",
  description: "Premium fashion boutique offering curated collections of contemporary and designer clothing, accessories, and footwear for the modern woman.",
  established: "2020",
  website: "www.fashionhaven.com",
  instagram: "@fashionhavenboutique",
  facebook: "FashionHavenBoutique",
  taxId: "12-3456789",
  businessLicense: "NYC-BL-2020-45678",
};

export const workingHours = [
  { day: "Monday", isOpen: true, open: "09:00", close: "18:00" },
  { day: "Tuesday", isOpen: true, open: "09:00", close: "18:00" },
  { day: "Wednesday", isOpen: true, open: "09:00", close: "18:00" },
  { day: "Thursday", isOpen: true, open: "09:00", close: "20:00" },
  { day: "Friday", isOpen: true, open: "09:00", close: "20:00" },
  { day: "Saturday", isOpen: true, open: "10:00", close: "17:00" },
  { day: "Sunday", isOpen: false, open: "", close: "" },
];

export const deliveryOptions = [
  { id: 1, name: "Standard Shipping", description: "Regular delivery to your doorstep", enabled: true, cost: 8.99, estimatedDays: "5-7 business days" },
  { id: 2, name: "Express Shipping", description: "Faster delivery for urgent orders", enabled: true, cost: 15.99, estimatedDays: "2-3 business days" },
  { id: 3, name: "Overnight Delivery", description: "Next day delivery for immediate needs", enabled: false, cost: 29.99, estimatedDays: "1 business day" },
  { id: 4, name: "Local Pickup", description: "Pick up from our store location", enabled: true, cost: 0, estimatedDays: "Same day" },
];
