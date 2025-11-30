// Mock data for deliveries
export const mockDeliveries = [
  {
    id: "DEL001",
    customerName: "Ahmed Ben Ali",
    address: "Avenue Habib Bourguiba, Centre Ville, Tunis 1000",
    notes: "Leave at front door, ring bell",
    status: "assigned", // assigned, in-progress, delivered
    packageCount: 2,
    estimatedTime: "15 min",
    destination: {
      latitude: 36.8065,
      longitude: 10.1815,
    },
  },
  {
    id: "DEL002",
    customerName: "Fatma Trabelsi",
    address: "Rue de la Liberté, Lafayette, Tunis 1002",
    notes: "Apartment 4B, call on arrival",
    status: "assigned",
    packageCount: 1,
    estimatedTime: "25 min",
    destination: {
      latitude: 36.8189,
      longitude: 10.1658,
    },
  },
  {
    id: "DEL003",
    customerName: "Mohamed Gharbi",
    address: "Avenue Léopold Sédar Senghor, Les Berges du Lac, Tunis 1053",
    notes: "Business address, deliver to reception",
    status: "in-progress",
    packageCount: 3,
    estimatedTime: "10 min",
    destination: {
      latitude: 36.842,
      longitude: 10.2441,
    },
  },
  {
    id: "DEL004",
    customerName: "Sonia Mansour",
    address: "Boulevard Yahia Ibn Omar, Sousse 4000",
    notes: "Contact customer before delivery",
    status: "delivered",
    packageCount: 1,
    estimatedTime: "Completed",
    destination: {
      latitude: 35.8256,
      longitude: 10.6369,
    },
  },
  {
    id: "DEL005",
    customerName: "Karim Bouazizi",
    address: "Avenue Hedi Chaker, Sousse Ville, Sousse 4000",
    notes: "Ring the doorbell twice",
    status: "pending",
    packageCount: 2,
    estimatedTime: "20 min",
    destination: {
      latitude: 35.8278,
      longitude: 10.6409,
    },
  },
  {
    id: "DEL006",
    customerName: "Leila Hamdi",
    address: "Rue de la République, Médina, Tunis 1000",
    notes: "Old medina area, narrow streets",
    status: "picked_up",
    packageCount: 1,
    estimatedTime: "12 min",
    destination: {
      latitude: 36.7969,
      longitude: 10.1712,
    },
  },
];

// Mock earnings data
export const mockEarnings = {
  today: {
    amount: 127.5,
    deliveries: 8,
    hours: 5.5,
  },
  week: {
    amount: 645.75,
    deliveries: 42,
    hours: 28.5,
  },
  month: {
    amount: 2580.0,
    deliveries: 168,
    hours: 112,
  },
  // Weekly earnings data for chart (last 7 days)
  weeklyData: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: [95.5, 110.25, 125.75, 98.5, 130.0, 85.75, 127.5],
  },
  // Monthly earnings data for chart (last 4 weeks)
  monthlyData: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    data: [580.25, 645.75, 710.5, 643.5],
  },
  // Hourly breakdown for today
  hourlyData: {
    labels: ["9AM", "10AM", "11AM", "12PM", "1PM", "2PM"],
    data: [18.5, 22.75, 25.5, 21.0, 23.25, 16.5],
  },
};

// Mock driver profile
export const mockDriver = {
  name: "David Martinez",
  email: "david.martinez@driver.com",
  phone: "+1 (555) 123-4567",
  vehicleType: "Sedan - Toyota Camry",
  licensePlate: "ABC-1234",
  rating: 4.8,
  totalDeliveries: 1250,
  memberSince: "January 2023",
};
