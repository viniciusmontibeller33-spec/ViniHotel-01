import { getDatabase } from '../utils/database.js';

export async function createStaff(staffData) {
  const db = await getDatabase();
  const { id, name, position, hotelId, email, phone, status, hireDate, idUsuario } = staffData;

  const result = await db.run(
    `INSERT INTO staff (id, name, position, hotelId, email, phone, status, hireDate, idUsuario)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, position, hotelId, email, phone, status, hireDate, idUsuario]
  );

  return id;
}

export async function getStaffById(id) {
  const db = await getDatabase();
  const staff = await db.get(
    'SELECT * FROM staff WHERE id = ?',
    [id]
  );
  return staff;
}

export async function getStaffByHotel(hotelId) {
  const db = await getDatabase();
  const staff = await db.all(
    'SELECT * FROM staff WHERE hotelId = ?',
    [hotelId]
  );
  return staff;
}

export async function getAllStaff() {
  const db = await getDatabase();
  const staff = await db.all(
    `SELECT s.*, h.nombre as hotelName
     FROM staff s
     LEFT JOIN hoteles h ON s.hotelId = h.idHotel`
  );
  return staff;
}

export async function updateStaff(id, staffData) {
  const db = await getDatabase();
  const { name, position, email, phone, status } = staffData;

  const result = await db.run(
    `UPDATE staff 
     SET name = ?, position = ?, email = ?, phone = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, position, email, phone, status, id]
  );

  return result.changes > 0;
}

export async function deleteStaff(id) {
  const db = await getDatabase();
  const result = await db.run('DELETE FROM staff WHERE id = ?', [id]);
  return result.changes > 0;
}

export async function getStaffByUsuario(idUsuario) {
  const db = await getDatabase();
  const staff = await db.get(
    'SELECT * FROM staff WHERE idUsuario = ?',
    [idUsuario]
  );
  return staff;
}
