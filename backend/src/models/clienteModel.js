import { getDatabase } from '../utils/database.js';

export async function createCliente(idUsuario, telefono, documentoIdentidad) {
  const db = await getDatabase();

  const result = await db.run(
    `INSERT INTO clientes (idUsuario, telefono, documentoIdentidad)
     VALUES (?, ?, ?)`,
    [idUsuario, telefono, documentoIdentidad]
  );

  return result.lastID;
}

export async function getClienteByUsuario(idUsuario) {
  const db = await getDatabase();
  const cliente = await db.get(
    'SELECT * FROM clientes WHERE idUsuario = ?',
    [idUsuario]
  );
  return cliente;
}

export async function getClienteById(idCliente) {
  const db = await getDatabase();
  const cliente = await db.get(
    'SELECT c.*, u.* FROM clientes c JOIN usuarios u ON c.idUsuario = u.idUsuario WHERE c.idCliente = ?',
    [idCliente]
  );
  return cliente;
}

export async function updateCliente(idCliente, telefono, documentoIdentidad) {
  const db = await getDatabase();
  const result = await db.run(
    `UPDATE clientes 
     SET telefono = ?, documentoIdentidad = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE idCliente = ?`,
    [telefono, documentoIdentidad, idCliente]
  );

  return result.changes > 0;
}

export async function getAllClientes() {
  const db = await getDatabase();
  const clientes = await db.all(
    `SELECT c.idCliente, c.telefono, c.documentoIdentidad, u.nombre, u.apellido, u.email, u.phone
     FROM clientes c
     JOIN usuarios u ON c.idUsuario = u.idUsuario`
  );
  return clientes;
}

export async function deleteCliente(idCliente) {
  const db = await getDatabase();
  const result = await db.run('DELETE FROM clientes WHERE idCliente = ?', [idCliente]);
  return result.changes > 0;
}
