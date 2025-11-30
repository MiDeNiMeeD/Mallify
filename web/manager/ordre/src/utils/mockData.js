// Mock Data for Delivery Manager Dashboard

export const mockDrivers = [
  {
    id: 'DRV001',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@email.com',
    phone: '+212 6 12 34 56 78',
    status: 'active',
    rating: 4.8,
    totalDeliveries: 342,
    completionRate: 98.5,
    earnings: 12450,
    zone: 'Zone A - Downtown',
    avatar: 'https://i.pravatar.cc/150?img=12',
    joinedDate: '2024-01-15',
    vehicle: 'Motorcycle',
    avgDeliveryTime: 28
  },
  {
    id: 'DRV002',
    name: 'Fatima Zahra',
    email: 'fatima.z@email.com',
    phone: '+212 6 23 45 67 89',
    status: 'active',
    rating: 4.9,
    totalDeliveries: 428,
    completionRate: 99.2,
    earnings: 15680,
    zone: 'Zone B - Suburbs',
    avatar: 'https://i.pravatar.cc/150?img=45',
    joinedDate: '2023-11-20',
    vehicle: 'Car',
    avgDeliveryTime: 32
  },
  {
    id: 'DRV003',
    name: 'Youssef Alami',
    email: 'youssef.a@email.com',
    phone: '+212 6 34 56 78 90',
    status: 'inactive',
    rating: 4.6,
    totalDeliveries: 215,
    completionRate: 96.8,
    earnings: 8920,
    zone: 'Zone A - Downtown',
    avatar: 'https://i.pravatar.cc/150?img=33',
    joinedDate: '2024-03-10',
    vehicle: 'Motorcycle',
    avgDeliveryTime: 30
  },
  {
    id: 'DRV004',
    name: 'Salma Bennani',
    email: 'salma.b@email.com',
    phone: '+212 6 45 67 89 01',
    status: 'active',
    rating: 4.7,
    totalDeliveries: 389,
    completionRate: 97.4,
    earnings: 13250,
    zone: 'Zone C - Industrial',
    avatar: 'https://i.pravatar.cc/150?img=47',
    joinedDate: '2024-02-05',
    vehicle: 'Bicycle',
    avgDeliveryTime: 25
  },
  {
    id: 'DRV005',
    name: 'Omar Idrissi',
    email: 'omar.i@email.com',
    phone: '+212 6 56 78 90 12',
    status: 'suspended',
    rating: 3.9,
    totalDeliveries: 156,
    completionRate: 89.5,
    earnings: 5430,
    zone: 'Zone B - Suburbs',
    avatar: 'https://i.pravatar.cc/150?img=68',
    joinedDate: '2024-04-12',
    vehicle: 'Motorcycle',
    avgDeliveryTime: 38
  }
];

export const mockDeliveries = [
  {
    id: 'DEL001',
    orderId: 'ORD12345',
    driverId: 'DRV001',
    driverName: 'Ahmed Hassan',
    status: 'in_transit',
    pickupAddress: '123 Boutique St, Downtown',
    deliveryAddress: '456 Customer Ave, Apt 5B',
    customerName: 'Sara El Amrani',
    customerPhone: '+212 6 11 22 33 44',
    estimatedTime: '15 mins',
    distance: '3.2 km',
    fee: 25,
    createdAt: '2024-01-23T14:30:00',
    pickupTime: '2024-01-23T14:45:00',
    currentLocation: { lat: 33.5731, lng: -7.5898 }
  },
  {
    id: 'DEL002',
    orderId: 'ORD12346',
    driverId: 'DRV002',
    driverName: 'Fatima Zahra',
    status: 'pending',
    pickupAddress: '789 Mall Plaza, Suburbs',
    deliveryAddress: '321 Residential Rd, Villa 12',
    customerName: 'Karim Benjelloun',
    customerPhone: '+212 6 22 33 44 55',
    estimatedTime: '25 mins',
    distance: '5.8 km',
    fee: 35,
    createdAt: '2024-01-23T15:00:00',
    currentLocation: null
  },
  {
    id: 'DEL003',
    orderId: 'ORD12347',
    driverId: 'DRV004',
    driverName: 'Salma Bennani',
    status: 'delivered',
    pickupAddress: '555 Store Center, Industrial',
    deliveryAddress: '888 Office Complex, Floor 3',
    customerName: 'Mehdi Tazi',
    customerPhone: '+212 6 33 44 55 66',
    estimatedTime: 'Completed',
    distance: '2.1 km',
    fee: 20,
    createdAt: '2024-01-23T13:00:00',
    pickupTime: '2024-01-23T13:15:00',
    deliveryTime: '2024-01-23T13:35:00',
    currentLocation: null
  }
];

export const mockMetrics = {
  activeDrivers: 12,
  pendingDeliveries: 8,
  avgDeliveryTime: 28,
  successRate: 97.8,
  revenueToday: 4250,
  customerComplaints: 3,
  totalDeliveriesToday: 45,
  onTimeDeliveryRate: 94.2
};

export const mockAnalytics = {
  deliveriesPerDay: [
    { date: '2024-01-17', count: 38 },
    { date: '2024-01-18', count: 42 },
    { date: '2024-01-19', count: 35 },
    { date: '2024-01-20', count: 48 },
    { date: '2024-01-21', count: 41 },
    { date: '2024-01-22', count: 52 },
    { date: '2024-01-23', count: 45 }
  ],
  revenuePerDay: [
    { date: '2024-01-17', revenue: 3800 },
    { date: '2024-01-18', revenue: 4200 },
    { date: '2024-01-19', revenue: 3500 },
    { date: '2024-01-20', revenue: 4800 },
    { date: '2024-01-21', revenue: 4100 },
    { date: '2024-01-22', revenue: 5200 },
    { date: '2024-01-23', revenue: 4250 }
  ],
  driverPerformance: [
    { name: 'Fatima Z.', deliveries: 428, rating: 4.9 },
    { name: 'Salma B.', deliveries: 389, rating: 4.7 },
    { name: 'Ahmed H.', deliveries: 342, rating: 4.8 },
    { name: 'Youssef A.', deliveries: 215, rating: 4.6 },
    { name: 'Omar I.', deliveries: 156, rating: 3.9 }
  ]
};

export const mockZones = [
  { id: 'zone-a', name: 'Zone A - Downtown', drivers: 5, activeDeliveries: 12, color: '#6366f1' },
  { id: 'zone-b', name: 'Zone B - Suburbs', drivers: 4, activeDeliveries: 8, color: '#8b5cf6' },
  { id: 'zone-c', name: 'Zone C - Industrial', drivers: 3, activeDeliveries: 5, color: '#ec4899' }
];

export const mockPricingRules = [
  { id: 1, name: 'Base Fee', value: 15, type: 'fixed', zone: 'All Zones' },
  { id: 2, name: 'Per Kilometer', value: 5, type: 'per_km', zone: 'All Zones' },
  { id: 3, name: 'Peak Hour Surge', value: 1.5, type: 'multiplier', zone: 'All Zones', time: '12:00-14:00, 19:00-21:00' },
  { id: 4, name: 'Weekend Bonus', value: 1.2, type: 'multiplier', zone: 'All Zones', days: 'Sat-Sun' }
];

export const mockDisputes = [
  {
    id: 'DIS001',
    deliveryId: 'DEL045',
    driverId: 'DRV003',
    driverName: 'Youssef Alami',
    customerName: 'Laila Mansouri',
    issue: 'Late Delivery',
    description: 'Order arrived 45 minutes late, food was cold',
    status: 'pending',
    createdAt: '2024-01-23T12:30:00',
    priority: 'high'
  },
  {
    id: 'DIS002',
    deliveryId: 'DEL032',
    driverId: 'DRV005',
    driverName: 'Omar Idrissi',
    customerName: 'Hassan Berrada',
    issue: 'Wrong Address',
    description: 'Driver delivered to wrong location',
    status: 'resolved',
    createdAt: '2024-01-22T18:15:00',
    resolvedAt: '2024-01-23T09:00:00',
    priority: 'medium'
  }
];

export const mockEarnings = {
  totalEarnings: 55730,
  pendingPayouts: 12450,
  paidOut: 43280,
  driverEarnings: [
    { driverId: 'DRV001', name: 'Ahmed Hassan', earnings: 12450, pending: 2340, status: 'pending' },
    { driverId: 'DRV002', name: 'Fatima Zahra', earnings: 15680, pending: 0, status: 'paid' },
    { driverId: 'DRV004', name: 'Salma Bennani', earnings: 13250, pending: 3120, status: 'pending' },
    { driverId: 'DRV003', name: 'Youssef Alami', earnings: 8920, pending: 0, status: 'paid' },
    { driverId: 'DRV005', name: 'Omar Idrissi', earnings: 5430, pending: 890, status: 'pending' }
  ]
};

export const mockNotifications = [
  {
    id: 1,
    type: 'alert',
    title: 'High Demand Alert',
    message: 'Zone A experiencing high delivery demand. Consider activating more drivers.',
    time: '5 mins ago',
    read: false
  },
  {
    id: 2,
    type: 'success',
    title: 'Driver Onboarded',
    message: 'New driver "Karim Alaoui" successfully onboarded and activated.',
    time: '1 hour ago',
    read: false
  },
  {
    id: 3,
    type: 'warning',
    title: 'Dispute Filed',
    message: 'New dispute filed for delivery DEL045. Requires attention.',
    time: '2 hours ago',
    read: true
  }
];

export const mockOnboardingApplications = [
  {
    id: 'APP001',
    name: 'Karim Alaoui',
    email: 'karim.a@email.com',
    phone: '+212 6 77 88 99 00',
    vehicle: 'Motorcycle',
    license: 'Verified',
    insurance: 'Pending',
    backgroundCheck: 'Verified',
    status: 'pending',
    appliedDate: '2024-01-20',
    documents: ['license.pdf', 'insurance.pdf', 'id_card.pdf']
  },
  {
    id: 'APP002',
    name: 'Nadia Tahiri',
    email: 'nadia.t@email.com',
    phone: '+212 6 88 99 00 11',
    vehicle: 'Car',
    license: 'Verified',
    insurance: 'Verified',
    backgroundCheck: 'Pending',
    status: 'pending',
    appliedDate: '2024-01-22',
    documents: ['license.pdf', 'insurance.pdf', 'id_card.pdf', 'vehicle_reg.pdf']
  }
];
