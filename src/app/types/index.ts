export interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string;
  image: string;
  rating: number;
  amenities: string[];
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  image: string;
  amenities: string[];
  available: number;
  status?: 'available' | 'occupied' | 'cleaning' | 'maintenance';
}

export interface Booking {
  id: string;
  hotelName: string;
  hotelId: string;
  roomName: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  guestName: string;
  guestEmail: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'checked-in';
  createdAt: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  roomStatus?: 'available' | 'occupied' | 'cleaning' | 'maintenance';
}

export interface Invoice {
  id: string;
  bookingId: string;
  userId: string;
  hotelName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  subtotal: number;
  taxes: number;
  additionalCharges: AdditionalCharge[];
  total: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  issuedDate: string;
}

export interface AdditionalCharge {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  hotelId: string;
  hotelName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  hireDate: string;
  role: 'admin' | 'receptionist' | 'manager' | 'housekeeping';
  permissions: string[];
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'staff' | 'admin';
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  documentId?: string;
  createdAt: string;
}

export interface RoomStatus {
  roomId: string;
  hotelId: string;
  roomName: string;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  lastUpdated: string;
  assignedTo?: string;
  notes?: string;
}

export interface CleaningTask {
  id: string;
  roomId: string;
  roomName: string;
  hotelId: string;
  hotelName: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}