import { getDatabase } from '../utils/database.js';

export async function createBooking(bookingData) {
  const db = await getDatabase();
  const { id, roomId, idCliente, checkIn, checkOut, guests, totalPrice, paymentMethod, status, paymentStatus } = bookingData;

  const result = await db.run(
    `INSERT INTO bookings (id, roomId, idCliente, checkIn, checkOut, numberOfGuests, totalPrice, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, roomId, idCliente || null, checkIn, checkOut, guests, totalPrice, status || 'confirmed']
  );

  return id;
}

export async function getBookingById(id) {
  const db = await getDatabase();
  const booking = await db.get(
    `SELECT b.*, r.name as roomName, r.hotelId, h.nombre as hotelName, c.idUsuario
     FROM bookings b
     JOIN rooms r ON b.roomId = r.id
     JOIN hoteles h ON r.hotelId = h.idHotel
     JOIN clientes c ON b.idCliente = c.idCliente
     WHERE b.id = ?`,
    [id]
  );
  return booking;
}

export async function getBookingsByCliente(idCliente) {
  const db = await getDatabase();
  const bookings = await db.all(
    `SELECT b.*, r.name as roomName, r.type, r.price, h.nombre as hotelName, h.location
     FROM bookings b
     JOIN rooms r ON b.roomId = r.id
     JOIN hoteles h ON r.hotelId = h.idHotel
     WHERE b.idCliente = ?
     ORDER BY b.createdAt DESC`,
    [idCliente]
  );
  return bookings;
}

export async function getBookingsByHotel(hotelId) {
  const db = await getDatabase();
  const bookings = await db.all(
    `SELECT b.*, r.name as roomName, c.idUsuario, u.email, u.nombre, u.apellido
     FROM bookings b
     JOIN rooms r ON b.roomId = r.id
     JOIN clientes c ON b.idCliente = c.idCliente
     JOIN usuarios u ON c.idUsuario = u.idUsuario
     WHERE r.hotelId = ?
     ORDER BY b.checkIn ASC`,
    [hotelId]
  );
  return bookings;
}

export async function getAllBookings() {
  const db = await getDatabase();
  const bookings = await db.all(
    `SELECT b.*, r.name as roomName, h.nombre as hotelName, u.email
     FROM bookings b
     JOIN rooms r ON b.roomId = r.id
     JOIN hoteles h ON r.hotelId = h.idHotel
     JOIN clientes c ON b.idCliente = c.idCliente
     JOIN usuarios u ON c.idUsuario = u.idUsuario`
  );
  return bookings;
}

export async function updateBooking(id, bookingData) {
  const db = await getDatabase();
  const { status, paymentStatus, totalPrice } = bookingData;

  const result = await db.run(
    `UPDATE bookings 
     SET status = ?, paymentStatus = ?, totalPrice = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, paymentStatus, totalPrice, id]
  );

  return result.changes > 0;
}

export async function cancelBooking(id) {
  const db = await getDatabase();
  const result = await db.run(
    `UPDATE bookings 
     SET status = 'cancelled', paymentStatus = 'refunded', updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [id]
  );

  return result.changes > 0;
}

export async function deleteBooking(id) {
  const db = await getDatabase();
  const result = await db.run('DELETE FROM bookings WHERE id = ?', [id]);
  return result.changes > 0;
}
