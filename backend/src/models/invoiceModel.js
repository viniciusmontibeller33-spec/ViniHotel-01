import { getDatabase } from '../utils/database.js';

export async function createInvoice(invoiceData) {
  const db = await getDatabase();
  const { id, bookingId, userId, subtotal, taxes, total, additionalCharges, paymentMethod, paymentStatus } = invoiceData;

  const result = await db.run(
    `INSERT INTO invoices (id, bookingId, userId, subtotal, taxes, total, additionalCharges, paymentMethod, paymentStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, bookingId, userId, subtotal, taxes, total, JSON.stringify(additionalCharges), paymentMethod, paymentStatus]
  );

  return id;
}

export async function getInvoiceById(id) {
  const db = await getDatabase();
  const invoice = await db.get(
    'SELECT * FROM invoices WHERE id = ?',
    [id]
  );
  if (invoice) {
    invoice.additionalCharges = JSON.parse(invoice.additionalCharges || '{}');
  }
  return invoice;
}

export async function getInvoicesByUser(userId) {
  const db = await getDatabase();
  const invoices = await db.all(
    `SELECT inv.*, b.roomId, r.hotelId, h.nombre as hotelName
     FROM invoices inv
     JOIN bookings b ON inv.bookingId = b.id
     JOIN rooms r ON b.roomId = r.id
     JOIN hoteles h ON r.hotelId = h.idHotel
     WHERE inv.userId = ?
     ORDER BY inv.issuedDate DESC`,
    [userId]
  );
  return invoices.map(inv => ({
    ...inv,
    additionalCharges: JSON.parse(inv.additionalCharges || '{}')
  }));
}

export async function getInvoicesByBooking(bookingId) {
  const db = await getDatabase();
  const invoices = await db.all(
    'SELECT * FROM invoices WHERE bookingId = ?',
    [bookingId]
  );
  return invoices.map(inv => ({
    ...inv,
    additionalCharges: JSON.parse(inv.additionalCharges || '{}')
  }));
}

export async function getAllInvoices() {
  const db = await getDatabase();
  const invoices = await db.all(
    `SELECT inv.*, u.email, u.nombre, u.apellido
     FROM invoices inv
     JOIN usuarios u ON inv.userId = u.idUsuario`
  );
  return invoices.map(inv => ({
    ...inv,
    additionalCharges: JSON.parse(inv.additionalCharges || '{}')
  }));
}

export async function updateInvoice(id, invoiceData) {
  const db = await getDatabase();
  const { paymentStatus, paymentMethod } = invoiceData;

  const result = await db.run(
    `UPDATE invoices 
     SET paymentStatus = ?, paymentMethod = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [paymentStatus, paymentMethod, id]
  );

  return result.changes > 0;
}

export async function deleteInvoice(id) {
  const db = await getDatabase();
  const result = await db.run('DELETE FROM invoices WHERE id = ?', [id]);
  return result.changes > 0;
}
