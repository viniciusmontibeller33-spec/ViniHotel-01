// Datos de prueba para cargar en la BD
import { v4 as uuidv4 } from 'uuid';

export const sampleHotels = [
  {
    idHotel: uuidv4(),
    nombre: 'Grand Hotel Elegance',
    description: 'Elegante hotel de 5 estrellas en el centro de la ciudad',
    location: 'Centro de la Ciudad',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
    rating: 4.8,
    amenities: ['WiFi', 'Piscina', 'Gym', 'Spa', 'Restaurante 24/7', 'Servicio de habitaciones']
  },
  {
    idHotel: uuidv4(),
    nombre: 'Beach Paradise Resort',
    description: 'Resort frente al mar con playas privadas',
    location: 'Zona de Playa',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    rating: 4.6,
    amenities: ['Playa Privada', 'Piscina', 'Bar', 'Actividades Acuáticas', 'Restaurante Gourmet']
  },
  {
    idHotel: uuidv4(),
    nombre: 'Mountain Retreat Lodge',
    description: 'Cabaña de montaña con vistas espectaculares',
    location: 'Zona de Montaña',
    image: 'https://images.unsplash.com/photo-1618246347337-14c6d4e28c75?w=500',
    rating: 4.7,
    amenities: ['Chimenea', 'Jacuzzi', 'Senderismo', 'WiFi', 'Cocina Equipada']
  }
];

export const sampleRooms = [
  {
    id: uuidv4(),
    hotelId: sampleHotels[0].idHotel,
    name: 'Habitación Estándar',
    type: 'standard',
    price: 120,
    capacity: 2,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500',
    amenities: ['Cama King', 'Aire Acondicionado', 'TV Smart', 'Baño Privado'],
    available: 5,
    status: 'available'
  },
  {
    id: uuidv4(),
    hotelId: sampleHotels[0].idHotel,
    name: 'Suite Presidencial',
    type: 'suite',
    price: 350,
    capacity: 4,
    image: 'https://images.unsplash.com/photo-1611077313301-6b5ea99b8e77?w=500',
    amenities: ['Sala de Estar', 'Jacuzzi', 'Balcón Privado', 'Minibar', 'Servicio Concierge'],
    available: 2,
    status: 'available'
  },
  {
    id: uuidv4(),
    hotelId: sampleHotels[1].idHotel,
    name: 'Habitación Playa',
    type: 'beach',
    price: 200,
    capacity: 2,
    image: 'https://images.unsplash.com/photo-1618246347337-14c6d4e28c75?w=500',
    amenities: ['Vista al Mar', 'Acceso Playa', 'Terraza', 'Ducha Exterior'],
    available: 8,
    status: 'available'
  },
  {
    id: uuidv4(),
    hotelId: sampleHotels[2].idHotel,
    name: 'Cabaña Deluxe',
    type: 'cabin',
    price: 180,
    capacity: 3,
    image: 'https://images.unsplash.com/photo-1606445992292-49d814d10f73?w=500',
    amenities: ['Chimenea', 'Vista Montaña', 'Terraza', 'Cocina Completa'],
    available: 3,
    status: 'available'
  }
];

export const sampleUsers = [
  {
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@example.com',
    contrasena: 'password123',
    rol: 'client',
    phone: '1234567890',
    address: 'Calle 123, Ciudad',
    dateOfBirth: '1990-01-15',
    nationality: 'Colombiano',
    documentId: '123456789'
  },
  {
    nombre: 'María',
    apellido: 'García',
    email: 'maria@example.com',
    contrasena: 'password123',
    rol: 'client',
    phone: '9876543210',
    address: 'Avenida 456, Ciudad',
    dateOfBirth: '1995-05-20',
    nationality: 'Colombiana',
    documentId: '987654321'
  },
  {
    nombre: 'Admin',
    apellido: 'Sistema',
    email: 'admin@example.com',
    contrasena: 'admin123',
    rol: 'admin',
    phone: '1111111111',
    address: 'Oficina Central',
    dateOfBirth: '1985-03-10',
    nationality: 'Colombiano',
    documentId: '111111111'
  }
];

// Función para cargar datos de prueba
export async function loadSampleData(db) {
  try {
    console.log('📊 Cargando datos de prueba...');

    // Cargar hoteles
    for (const hotel of sampleHotels) {
      await db.run(
        `INSERT INTO hoteles (idHotel, nombre, description, location, image, rating, amenities)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [hotel.idHotel, hotel.nombre, hotel.description, hotel.location, hotel.image, hotel.rating, JSON.stringify(hotel.amenities)]
      );
    }

    // Cargar habitaciones
    for (const room of sampleRooms) {
      await db.run(
        `INSERT INTO rooms (id, hotelId, name, type, price, capacity, image, amenities, available, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [room.id, room.hotelId, room.name, room.type, room.price, room.capacity, room.image, JSON.stringify(room.amenities), room.available, room.status]
      );
    }

    console.log('✅ Datos de prueba cargados exitosamente');
  } catch (error) {
    console.error('❌ Error al cargar datos de prueba:', error);
  }
}
