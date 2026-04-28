import bcrypt from 'bcryptjs';
import { getDatabase } from '../utils/database.js';

export async function createUser(userData) {
  const db = await getDatabase();
  const { nombre, apellido, email, contrasena, rol = 'client', phone, address, dateOfBirth, nationality, documentId } = userData;

  // Hashear contraseña
  const hashedPassword = await bcrypt.hash(contrasena, 10);

  const result = await db.run(
    `INSERT INTO usuarios (nombre, apellido, email, contrasena, rol, phone, address, dateOfBirth, nationality, documentId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, apellido, email, hashedPassword, rol, phone, address, dateOfBirth, nationality, documentId]
  );

  return result.lastID;
}

export async function getUserById(idUsuario) {
  const db = await getDatabase();
  const user = await db.get(
    'SELECT * FROM usuarios WHERE idUsuario = ?',
    [idUsuario]
  );
  return user;
}

export async function getUserByEmail(email) {
  const db = await getDatabase();
  const user = await db.get(
    'SELECT * FROM usuarios WHERE email = ?',
    [email]
  );
  return user;
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function updateUser(idUsuario, userData) {
  const db = await getDatabase();
  const { nombre, apellido, phone, address, dateOfBirth, nationality, documentId } = userData;

  const result = await db.run(
    `UPDATE usuarios 
     SET nombre = ?, apellido = ?, phone = ?, address = ?, dateOfBirth = ?, nationality = ?, documentId = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE idUsuario = ?`,
    [nombre, apellido, phone, address, dateOfBirth, nationality, documentId, idUsuario]
  );

  return result.changes > 0;
}

export async function getAllUsers() {
  const db = await getDatabase();
  const users = await db.all('SELECT idUsuario, nombre, apellido, email, rol, phone, address, createdAt FROM usuarios');
  return users;
}

export async function deleteUser(idUsuario) {
  const db = await getDatabase();
  const result = await db.run('DELETE FROM usuarios WHERE idUsuario = ?', [idUsuario]);
  return result.changes > 0;
}
