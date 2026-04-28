import { getDatabase } from '../utils/database.js';

export async function createRoom(roomData) {
  const db = await getDatabase();
  const { id, hotelId, name, type, price, capacity, image, amenities, available, status } = roomData;

  const result = await db.run(
    `INSERT INTO rooms (id, hotelId, name, type, price, capacity, image, amenities, available, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, hotelId, name, type, price, capacity, image, JSON.stringify(amenities), available, status]
  );

  return id;
}

export async function getRoomById(id) {
  const db = await getDatabase();
  const room = await db.get(
    'SELECT * FROM rooms WHERE id = ?',
    [id]
  );
  if (room) {
    room.amenities = JSON.parse(room.amenities);
  }
  return room;
}

export async function getRoomsByHotel(hotelId) {
  const db = await getDatabase();
  const rooms = await db.all(
    'SELECT * FROM rooms WHERE hotelId = ?',
    [hotelId]
  );
  return rooms.map(r => ({
    ...r,
    amenities: JSON.parse(r.amenities)
  }));
}

export async function getAllRooms() {
  const db = await getDatabase();
  const rooms = await db.all('SELECT * FROM rooms');
  return rooms.map(r => ({
    ...r,
    amenities: JSON.parse(r.amenities)
  }));
}

export async function updateRoom(id, roomData) {
  const db = await getDatabase();
  const { name, type, price, capacity, image, amenities, available, status } = roomData;

  const result = await db.run(
    `UPDATE rooms 
     SET name = ?, type = ?, price = ?, capacity = ?, image = ?, amenities = ?, available = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, type, price, capacity, image, JSON.stringify(amenities), available, status, id]
  );

  return result.changes > 0;
}

export async function deleteRoom(id) {
  const db = await getDatabase();
  const result = await db.run('DELETE FROM rooms WHERE id = ?', [id]);
  return result.changes > 0;
}

// Estados válidos de habitación
const VALID_ROOM_STATUSES = ['available', 'occupied', 'maintenance', 'cleaning', 'unavailable'];
const UNAVAILABLE_STATUSES = ['maintenance', 'unavailable'];

export async function checkAvailability(roomId, checkIn, checkOut, guests = null) {
  const db = await getDatabase();
  
  // Obtener información de la habitación
  const room = await db.get('SELECT status, capacity FROM rooms WHERE id = ?', [roomId]);
  
  if (!room) {
    return { available: false, reason: 'Habitación no encontrada' };
  }
  
  // Verificar estado de la habitación
  if (UNAVAILABLE_STATUSES.includes(room.status)) {
    return { available: false, reason: `Habitación no disponible (${room.status})` };
  }
  
  // Verificar capacidad si se proporciona
  if (guests !== null && guests > room.capacity) {
    return { 
      available: false, 
      reason: `La capacidad máxima es ${room.capacity} huéspedes. Solicitaste ${guests}.` 
    };
  }
  
  // Verificar conflictos de reserva
  const booking = await db.get(
    `SELECT COUNT(*) as count FROM bookings 
     WHERE roomId = ? AND status != 'cancelled'
     AND ((checkIn <= ? AND checkOut > ?) OR (checkIn < ? AND checkOut >= ?) OR (checkIn >= ? AND checkOut <= ?))`,
    [roomId, checkOut, checkIn, checkOut, checkIn, checkIn, checkOut]
  );
  
  if (booking.count > 0) {
    return { available: false, reason: 'Habitación no disponible en esas fechas' };
  }
  
  return { available: true, reason: 'Habitación disponible' };
}

export async function getRoomStatusConstraints(status) {
  // Retorna qué acciones se pueden hacer según el estado de la habitación
  const constraints = {
    'available': { canBook: true, canCheckIn: false, canCheckOut: false },
    'occupied': { canBook: false, canCheckIn: false, canCheckOut: true },
    'cleaning': { canBook: false, canCheckIn: false, canCheckOut: false },
    'maintenance': { canBook: false, canCheckIn: false, canCheckOut: false },
    'unavailable': { canBook: false, canCheckIn: false, canCheckOut: false }
  };
  
  return constraints[status] || constraints['available'];
}
