// Mock Data for Delivery Manager Dashboard

export const dashboardMetrics = {
  activeDrivers: 24,
  pendingDeliveries: 15,
  avgDeliveryTime: '28 min',
  successRate: '96.5%',
  revenueToday: '$2,840',
  complaints: 3
};

export const drivers = [
  {
    id: 1,
    name: 'Ahmed Hassan',
    phone: '+212 612-345-678',
    email: 'ahmed.hassan@mail.com',
    status: 'active',
    rating: 4.8,
    totalDeliveries: 342,
    successRate: 97,
    earnings: 4850,
    zone: 'Casablanca Centre',
    joinDate: '2024-01-15',
    vehicle: 'Motorcycle',
    available: true,
    currentLocation: { lat: 33.5731, lng: -7.5898 }
  },
  {
    id: 2,
    name: 'Fatima Zahra',
    phone: '+212 623-456-789',
    email: 'fatima.zahra@mail.com',
    status: 'active',
    rating: 4.9,
    totalDeliveries: 421,
    successRate: 98,
    earnings: 5620,
    zone: 'Rabat Agdal',
    joinDate: '2023-11-20',
    vehicle: 'Bicycle',
    available: true,
    currentLocation: { lat: 33.9716, lng: -6.8498 }
  },
  {
    id: 3,
    name: 'Mohammed Alami',
    phone: '+212 634-567-890',
    email: 'mohammed.alami@mail.com',
    status: 'inactive',
    rating: 4.6,
    totalDeliveries: 198,
    successRate: 94,
    earnings: 3120,
    zone: 'Marrakech Gueliz',
    joinDate: '2024-03-10',
    vehicle: 'Car',
    available: false,
    currentLocation: { lat: 31.6295, lng: -7.9811 }
  },
  {
    id: 4,
    name: 'Sara Benjelloun',
    phone: '+212 645-678-901',
    email: 'sara.benjelloun@mail.com',
    status: 'active',
    rating: 4.7,
    totalDeliveries: 287,
    successRate: 96,
    earnings: 4320,
    zone: 'Tangier Malabata',
    joinDate: '2024-02-05',
    vehicle: 'Motorcycle',
    available: true,
    currentLocation: { lat: 35.7595, lng: -5.8340 }
  },
  {
    id: 5,
    name: 'Youssef Kettani',
    phone: '+212 656-789-012',
    email: 'youssef.kettani@mail.com',
    status: 'suspended',
    rating: 3.9,
    totalDeliveries: 145,
    successRate: 89,
    earnings: 2180,
    zone: 'Fes Medina',
    joinDate: '2024-04-12',
    vehicle: 'Motorcycle',
    available: false,
    currentLocation: { lat: 34.0181, lng: -5.0078 }
  }
];

export const deliveries = [
  {
    id: 'DEL-001',
    orderNumber: 'ORD-2024-1256',
    driver: 'Ahmed Hassan',
    driverId: 1,
    customer: 'Karim Bennani',
    customerPhone: '+212 611-222-333',
    boutique: 'Fashion Boutique',
    pickupAddress: '123 Rue Mohammed V, Casablanca',
    deliveryAddress: '456 Boulevard Zerktouni, Casablanca',
    status: 'in_transit',
    priority: 'normal',
    orderTime: '2024-02-12T10:30:00',
    pickupTime: '2024-02-12T10:45:00',
    estimatedDelivery: '2024-02-12T11:15:00',
    actualDelivery: null,
    distance: 5.2,
    fee: 25,
    paymentMethod: 'cash'
  },
  {
    id: 'DEL-002',
    orderNumber: 'ORD-2024-1257',
    driver: 'Fatima Zahra',
    driverId: 2,
    customer: 'Laila Idrissi',
    customerPhone: '+212 622-333-444',
    boutique: 'Tech Store',
    pickupAddress: '789 Avenue Hassan II, Rabat',
    deliveryAddress: '321 Rue de la Resistance, Rabat',
    status: 'pending',
    priority: 'urgent',
    orderTime: '2024-02-12T11:00:00',
    pickupTime: null,
    estimatedDelivery: '2024-02-12T11:45:00',
    actualDelivery: null,
    distance: 3.8,
    fee: 20,
    paymentMethod: 'card'
  },
  {
    id: 'DEL-003',
    orderNumber: 'ORD-2024-1258',
    driver: 'Sara Benjelloun',
    driverId: 4,
    customer: 'Omar Tazi',
    customerPhone: '+212 633-444-555',
    boutique: 'Home & Living',
    pickupAddress: '555 Boulevard Pasteur, Tangier',
    deliveryAddress: '789 Rue Ibn Batouta, Tangier',
    status: 'delivered',
    priority: 'normal',
    orderTime: '2024-02-12T09:00:00',
    pickupTime: '2024-02-12T09:15:00',
    estimatedDelivery: '2024-02-12T09:45:00',
    actualDelivery: '2024-02-12T09:42:00',
    distance: 4.5,
    fee: 22,
    paymentMethod: 'cash',
    rating: 5,
    customerFeedback: 'Fast and professional!'
  },
  {
    id: 'DEL-004',
    orderNumber: 'ORD-2024-1259',
    driver: 'Ahmed Hassan',
    driverId: 1,
    customer: 'Nadia Alaoui',
    customerPhone: '+212 644-555-666',
    boutique: 'Beauty Paradise',
    pickupAddress: '111 Rue Allal Ben Abdellah, Casablanca',
    deliveryAddress: '222 Boulevard Anfa, Casablanca',
    status: 'failed',
    priority: 'normal',
    orderTime: '2024-02-12T10:00:00',
    pickupTime: '2024-02-12T10:20:00',
    estimatedDelivery: '2024-02-12T10:50:00',
    actualDelivery: null,
    distance: 6.1,
    fee: 28,
    paymentMethod: 'cash',
    failureReason: 'Customer not available',
    attempts: 2
  }
];

export const onboardingApplications = [
  {
    id: 101,
    name: 'Khalid Berrada',
    email: 'khalid.berrada@mail.com',
    phone: '+212 667-890-123',
    status: 'pending',
    appliedDate: '2024-02-10',
    preferredZone: 'Casablanca Centre',
    vehicle: 'Motorcycle',
    documents: {
      idCard: 'uploaded',
      drivingLicense: 'uploaded',
      vehicleRegistration: 'uploaded',
      insurance: 'pending'
    }
  },
  {
    id: 102,
    name: 'Samira Moussaoui',
    email: 'samira.moussaoui@mail.com',
    phone: '+212 678-901-234',
    status: 'under_review',
    appliedDate: '2024-02-11',
    preferredZone: 'Rabat Agdal',
    vehicle: 'Bicycle',
    documents: {
      idCard: 'uploaded',
      drivingLicense: 'uploaded',
      vehicleRegistration: 'uploaded',
      insurance: 'uploaded'
    }
  }
];

export const zones = [
  { id: 1, name: 'Casablanca Centre', driversCount: 8, activeDeliveries: 12, avgDeliveryTime: '25 min' },
  { id: 2, name: 'Rabat Agdal', driversCount: 5, activeDeliveries: 6, avgDeliveryTime: '22 min' },
  { id: 3, name: 'Marrakech Gueliz', driversCount: 6, activeDeliveries: 8, avgDeliveryTime: '30 min' },
  { id: 4, name: 'Tangier Malabata', driversCount: 4, activeDeliveries: 5, avgDeliveryTime: '28 min' },
  { id: 5, name: 'Fes Medina', driversCount: 1, activeDeliveries: 2, avgDeliveryTime: '35 min' }
];

export const analyticsData = {
  deliveriesOverTime: [
    { date: '2024-02-05', deliveries: 45, revenue: 1125 },
    { date: '2024-02-06', deliveries: 52, revenue: 1300 },
    { date: '2024-02-07', deliveries: 48, revenue: 1200 },
    { date: '2024-02-08', deliveries: 61, revenue: 1525 },
    { date: '2024-02-09', deliveries: 58, revenue: 1450 },
    { date: '2024-02-10', deliveries: 54, revenue: 1350 },
    { date: '2024-02-11', deliveries: 67, revenue: 1675 },
    { date: '2024-02-12', deliveries: 72, revenue: 1800 }
  ],
  driverPerformance: [
    { driver: 'Ahmed Hassan', deliveries: 42, rating: 4.8, onTimeRate: 95 },
    { driver: 'Fatima Zahra', deliveries: 51, rating: 4.9, onTimeRate: 98 },
    { driver: 'Mohammed Alami', deliveries: 28, rating: 4.6, onTimeRate: 92 },
    { driver: 'Sara Benjelloun', deliveries: 36, rating: 4.7, onTimeRate: 94 }
  ],
  peakHours: [
    { hour: '08:00', deliveries: 12 },
    { hour: '09:00', deliveries: 18 },
    { hour: '10:00', deliveries: 25 },
    { hour: '11:00', deliveries: 32 },
    { hour: '12:00', deliveries: 45 },
    { hour: '13:00', deliveries: 38 },
    { hour: '14:00', deliveries: 28 },
    { hour: '15:00', deliveries: 22 },
    { hour: '16:00', deliveries: 20 },
    { hour: '17:00', deliveries: 26 },
    { hour: '18:00', deliveries: 35 },
    { hour: '19:00', deliveries: 42 },
    { hour: '20:00', deliveries: 30 }
  ]
};

export const earnings = {
  totalEarnings: 48920,
  pendingPayouts: 5640,
  paidThisMonth: 12850,
  driverEarnings: [
    { driver: 'Ahmed Hassan', pending: 850, paid: 4000, total: 4850 },
    { driver: 'Fatima Zahra', pending: 1220, paid: 4400, total: 5620 },
    { driver: 'Mohammed Alami', pending: 520, paid: 2600, total: 3120 },
    { driver: 'Sara Benjelloun', pending: 820, paid: 3500, total: 4320 }
  ]
};

export const issues = [
  {
    id: 'ISS-001',
    deliveryId: 'DEL-004',
    type: 'failed_delivery',
    priority: 'high',
    description: 'Customer not available after 2 attempts',
    driver: 'Ahmed Hassan',
    status: 'open',
    createdAt: '2024-02-12T10:50:00',
    resolvedAt: null
  },
  {
    id: 'ISS-002',
    deliveryId: 'DEL-012',
    type: 'delay',
    priority: 'medium',
    description: 'Traffic jam causing 20+ min delay',
    driver: 'Fatima Zahra',
    status: 'in_progress',
    createdAt: '2024-02-12T11:15:00',
    resolvedAt: null
  },
  {
    id: 'ISS-003',
    deliveryId: 'DEL-008',
    type: 'customer_complaint',
    priority: 'high',
    description: 'Package damaged during delivery',
    driver: 'Mohammed Alami',
    status: 'resolved',
    createdAt: '2024-02-11T16:30:00',
    resolvedAt: '2024-02-11T18:00:00'
  }
];

export const pricingRules = [
  { id: 1, name: 'Base Fee', amount: 15, type: 'fixed', active: true },
  { id: 2, name: 'Per Kilometer', amount: 2, type: 'per_km', active: true },
  { id: 3, name: 'Peak Hour Surcharge (12-14h)', amount: 5, type: 'time_based', active: true },
  { id: 4, name: 'Weekend Bonus', amount: 3, type: 'day_based', active: true },
  { id: 5, name: 'Urgent Delivery', amount: 10, type: 'priority', active: true }
];

export const recentActivity = [
  { time: '2 min ago', text: 'Ahmed Hassan completed delivery DEL-001', type: 'success' },
  { time: '5 min ago', text: 'New delivery DEL-015 assigned to Fatima Zahra', type: 'info' },
  { time: '12 min ago', text: 'Sara Benjelloun started delivery DEL-013', type: 'info' },
  { time: '18 min ago', text: 'Delivery DEL-004 failed - Customer not available', type: 'error' },
  { time: '25 min ago', text: 'Mohammed Alami went offline', type: 'warning' },
  { time: '32 min ago', text: 'New driver application from Khalid Berrada', type: 'info' }
];

export const notifications = [
  { id: 1, title: 'High demand in Casablanca Centre', message: '15 pending deliveries, consider reassigning', time: '5 min ago', read: false, type: 'alert' },
  { id: 2, title: 'Driver performance review due', message: 'Ahmed Hassan monthly review is pending', time: '1 hour ago', read: false, type: 'info' },
  { id: 3, title: 'New driver application', message: 'Samira Moussaoui applied for Rabat zone', time: '2 hours ago', read: true, type: 'info' },
  { id: 4, title: 'Payment processed', message: 'Weekly payout of 12,500 MAD completed', time: '1 day ago', read: true, type: 'success' }
];

export const chatMessages = [
  { id: 1, sender: 'Ahmed Hassan', message: 'Customer changed delivery address', time: '10:32 AM', fromDriver: true },
  { id: 2, sender: 'Manager', message: 'Please confirm new address in the app', time: '10:33 AM', fromDriver: false },
  { id: 3, sender: 'Ahmed Hassan', message: 'Done, heading there now', time: '10:34 AM', fromDriver: true }
];

export const schedules = [
  { driver: 'Ahmed Hassan', monday: '9-17', tuesday: '9-17', wednesday: '9-17', thursday: '9-17', friday: '9-17', saturday: 'Off', sunday: 'Off' },
  { driver: 'Fatima Zahra', monday: '8-16', tuesday: '8-16', wednesday: '8-16', thursday: '8-16', friday: '8-16', saturday: '9-14', sunday: 'Off' },
  { driver: 'Mohammed Alami', monday: 'Off', tuesday: '10-18', wednesday: '10-18', thursday: '10-18', friday: '10-18', saturday: '10-18', sunday: '10-18' }
];
