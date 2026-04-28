import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../data');
const dbPath = path.join(dataDir, 'vinihotel.db');

// Crear carpeta data si no existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

export async function getDatabase() {
  if (db) return db;

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Configurar SQLite para mejor persistencia
  await db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA cache_size = -64000;
    PRAGMA temp_store = MEMORY;
    PRAGMA mmap_size = 30000000;
    PRAGMA page_size = 4096;
  `);

  // Configurar timeout para operaciones concurrentes
  db.configure('busyTimeout', 5000);

  return db;
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}

export async function initializeDatabase() {
  const database = await getDatabase();

  try {
    // Tabla: hoteles
    await database.exec(`
      CREATE TABLE IF NOT EXISTS hoteles (
        idHotel TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        image TEXT NOT NULL,
        rating REAL NOT NULL,
        amenities TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla: rooms
    await database.exec(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        hotelId TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        price REAL NOT NULL,
        capacity INTEGER NOT NULL,
        image TEXT NOT NULL,
        amenities TEXT NOT NULL,
        available INTEGER NOT NULL DEFAULT 1,
        status TEXT DEFAULT 'available',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotelId) REFERENCES hoteles(idHotel)
      )
    `);

    // Tabla: usuarios
    await database.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        idUsuario INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        contrasena TEXT NOT NULL,
        rol TEXT NOT NULL DEFAULT 'client',
        phone TEXT,
        address TEXT,
        dateOfBirth DATE,
        nationality TEXT,
        documentId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla: clientes
    await database.exec(`
      CREATE TABLE IF NOT EXISTS clientes (
        idCliente INTEGER PRIMARY KEY AUTOINCREMENT,
        telefono TEXT,
        documentoIdentidad TEXT,
        idUsuario INTEGER NOT NULL UNIQUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE CASCADE
      )
    `);

    // Tabla: staff
    await database.exec(`
      CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        hotelId TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        hireDate DATE NOT NULL,
        idUsuario INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotelId) REFERENCES hoteles(idHotel),
        FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario)
      )
    `);

    // Tabla: bookings
    await database.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        roomId TEXT NOT NULL,
        idCliente INTEGER NOT NULL,
        checkIn DATE NOT NULL,
        checkOut DATE NOT NULL,
        guests INTEGER NOT NULL,
        totalPrice REAL NOT NULL,
        paymentMethod TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        paymentStatus TEXT NOT NULL DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (roomId) REFERENCES rooms(id),
        FOREIGN KEY (idCliente) REFERENCES clientes(idCliente)
      )
    `);

    // Tabla: invoices
    await database.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        bookingId TEXT NOT NULL,
        userId INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        taxes REAL NOT NULL,
        total REAL NOT NULL,
        additionalCharges TEXT,
        paymentMethod TEXT NOT NULL,
        paymentStatus TEXT NOT NULL DEFAULT 'pending',
        issuedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bookingId) REFERENCES bookings(id),
        FOREIGN KEY (userId) REFERENCES usuarios(idUsuario)
      )
    `);

    console.log('✅ Base de datos inicializada correctamente');
  } catch (err) {
    console.error('❌ Error al inicializar la base de datos:', err);
    throw err;
  }
}

export default db;
