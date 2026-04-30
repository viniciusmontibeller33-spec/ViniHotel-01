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
    // ======= TABLAS DE CONFIGURACIÓN =======
    // Tabla: room_types
    await database.exec(`
      CREATE TABLE IF NOT EXISTS room_types (
        id TEXT PRIMARY KEY CHECK(id IN ('single', 'double', 'suite', 'penthouse')),
        name TEXT NOT NULL UNIQUE,
        description TEXT
      )
    `);

    // Tabla: staff_positions
    await database.exec(`
      CREATE TABLE IF NOT EXISTS staff_positions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        requiresAuth INTEGER DEFAULT 1 CHECK(requiresAuth IN (0, 1))
      )
    `);

    // Tabla: payment_methods
    await database.exec(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        enabled INTEGER DEFAULT 1 CHECK(enabled IN (0, 1))
      )
    `);

    // ======= TABLA CENTRAL: USUARIOS =======
    await database.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        idUsuario TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        contrasena TEXT NOT NULL,
        rol TEXT NOT NULL CHECK(rol IN ('client', 'staff', 'admin')),
        phone TEXT,
        documentId TEXT UNIQUE,
        dateOfBirth DATE,
        nationality TEXT,
        address TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ======= TABLA: CLIENTES =======
    await database.exec(`
      CREATE TABLE IF NOT EXISTS clientes (
        idCliente TEXT PRIMARY KEY,
        idUsuario TEXT NOT NULL UNIQUE,
        preferredLanguage TEXT DEFAULT 'es',
        loyaltyPoints INTEGER DEFAULT 0 CHECK(loyaltyPoints >= 0),
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE CASCADE
      )
    `);

    // ======= TABLA: HOTELES =======
    await database.exec(`
      CREATE TABLE IF NOT EXISTS hoteles (
        idHotel TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        description TEXT,
        location TEXT NOT NULL,
        image TEXT,
        rating REAL CHECK(rating >= 0 AND rating <= 5),
        checkInTime TEXT DEFAULT '15:00',
        checkOutTime TEXT DEFAULT '11:00',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ======= TABLA: HOTEL AMENITIES =======
    await database.exec(`
      CREATE TABLE IF NOT EXISTS hotel_amenities (
        id TEXT PRIMARY KEY,
        hotelId TEXT NOT NULL,
        amenity TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotelId) REFERENCES hoteles(idHotel) ON DELETE CASCADE,
        UNIQUE(hotelId, amenity)
      )
    `);

    // ======= TABLA: ROOMS =======
    await database.exec(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        hotelId TEXT NOT NULL,
        name TEXT NOT NULL,
        roomTypeId TEXT NOT NULL,
        capacity INTEGER NOT NULL CHECK(capacity > 0),
        price REAL NOT NULL CHECK(price > 0),
        available INTEGER NOT NULL CHECK(available >= 0),
        image TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotelId) REFERENCES hoteles(idHotel) ON DELETE RESTRICT,
        FOREIGN KEY (roomTypeId) REFERENCES room_types(id),
        UNIQUE(hotelId, name)
      )
    `);

    // ======= TABLA: ROOM AMENITIES =======
    await database.exec(`
      CREATE TABLE IF NOT EXISTS room_amenities (
        id TEXT PRIMARY KEY,
        roomId TEXT NOT NULL,
        amenity TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE,
        UNIQUE(roomId, amenity)
      )
    `);

    // ======= TABLA: STAFF =======
    await database.exec(`
      CREATE TABLE IF NOT EXISTS staff (
        idStaff TEXT PRIMARY KEY,
        idUsuario TEXT NOT NULL UNIQUE,
        hotelId TEXT NOT NULL,
        positionId TEXT NOT NULL,
        hireDate DATE NOT NULL,
        salary REAL CHECK(salary > 0),
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'on_leave')),
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE CASCADE,
        FOREIGN KEY (hotelId) REFERENCES hoteles(idHotel) ON DELETE RESTRICT,
        FOREIGN KEY (positionId) REFERENCES staff_positions(id)
      )
    `);

    // ======= TABLA: BOOKINGS =======
    await database.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        idCliente TEXT NOT NULL,
        roomId TEXT NOT NULL,
        checkIn DATE NOT NULL,
        checkOut DATE NOT NULL,
        numberOfGuests INTEGER NOT NULL CHECK(numberOfGuests > 0),
        totalPrice REAL NOT NULL CHECK(totalPrice > 0),
        status TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN ('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled')),
        specialRequests TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (idCliente) REFERENCES clientes(idCliente) ON DELETE CASCADE,
        FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE RESTRICT,
        CHECK(checkOut > checkIn)
      )
    `);

    // ======= TABLA: INVOICES =======
    await database.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        bookingId TEXT NOT NULL UNIQUE,
        idUsuario TEXT NOT NULL,
        subtotal REAL NOT NULL CHECK(subtotal > 0),
        taxes REAL NOT NULL DEFAULT 0 CHECK(taxes >= 0),
        discount REAL NOT NULL DEFAULT 0 CHECK(discount >= 0),
        total REAL NOT NULL CHECK(total > 0),
        paymentMethod TEXT NOT NULL,
        paymentStatus TEXT NOT NULL DEFAULT 'pending' CHECK(paymentStatus IN ('pending', 'paid', 'refunded', 'cancelled')),
        issuedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        dueDate DATE,
        notes TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE RESTRICT,
        FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE RESTRICT,
        FOREIGN KEY (paymentMethod) REFERENCES payment_methods(id),
        CHECK(total = (subtotal + taxes - discount))
      )
    `);

    // ======= TABLA: INVOICE ITEMS =======
    await database.exec(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id TEXT PRIMARY KEY,
        invoiceId TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount >= 0),
        itemType TEXT NOT NULL CHECK(itemType IN ('accommodation', 'additional_charge', 'discount', 'tax')),
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
      )
    `);

    // ======= CREAR ÍNDICES =======
    await database.exec(`
      CREATE INDEX IF NOT EXISTS idx_clientes_idUsuario ON clientes(idUsuario);
      CREATE INDEX IF NOT EXISTS idx_staff_idUsuario ON staff(idUsuario);
      CREATE INDEX IF NOT EXISTS idx_staff_hotelId ON staff(hotelId);
      CREATE INDEX IF NOT EXISTS idx_rooms_hotelId ON rooms(hotelId);
      CREATE INDEX IF NOT EXISTS idx_hotel_amenities_hotelId ON hotel_amenities(hotelId);
      CREATE INDEX IF NOT EXISTS idx_room_amenities_roomId ON room_amenities(roomId);
      CREATE INDEX IF NOT EXISTS idx_bookings_idCliente ON bookings(idCliente);
      CREATE INDEX IF NOT EXISTS idx_bookings_roomId ON bookings(roomId);
      CREATE INDEX IF NOT EXISTS idx_bookings_checkIn ON bookings(checkIn);
      CREATE INDEX IF NOT EXISTS idx_bookings_checkOut ON bookings(checkOut);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
      CREATE INDEX IF NOT EXISTS idx_invoices_bookingId ON invoices(bookingId);
      CREATE INDEX IF NOT EXISTS idx_invoices_idUsuario ON invoices(idUsuario);
      CREATE INDEX IF NOT EXISTS idx_invoices_paymentStatus ON invoices(paymentStatus);
      CREATE INDEX IF NOT EXISTS idx_invoices_issuedDate ON invoices(issuedDate);
      CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
      CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
      CREATE INDEX IF NOT EXISTS idx_invoice_items_invoiceId ON invoice_items(invoiceId);
    `);

    // ======= INSERTAR DATOS INICIALES =======
    await database.exec(`
      INSERT OR IGNORE INTO room_types (id, name, description) VALUES 
      ('single', 'Habitación Simple', 'Habitación para una persona'),
      ('double', 'Habitación Doble', 'Habitación para dos personas'),
      ('suite', 'Suite', 'Suite con sala y dormitorio'),
      ('penthouse', 'Penthouse', 'Penthouse de lujo con vistas panorámicas');

      INSERT OR IGNORE INTO staff_positions (id, name, description, requiresAuth) VALUES 
      ('manager', 'Gerente', 'Gerente del hotel', 1),
      ('receptionist', 'Recepcionista', 'Personal de recepción', 1),
      ('housekeeping', 'Limpieza', 'Personal de limpieza', 0),
      ('chef', 'Chef', 'Chef del restaurante', 0),
      ('waiter', 'Mesero', 'Personal de servicio', 0),
      ('maintenance', 'Mantenimiento', 'Personal de mantenimiento', 0);

      INSERT OR IGNORE INTO payment_methods (id, name, enabled) VALUES 
      ('credit_card', 'Tarjeta de Crédito', 1),
      ('debit_card', 'Tarjeta de Débito', 1),
      ('paypal', 'PayPal', 1),
      ('bank_transfer', 'Transferencia Bancaria', 1),
      ('cash', 'Efectivo', 1);
    `);

    console.log('✅ Base de datos inicializada correctamente con 13 tablas');
  } catch (err) {
    console.error('❌ Error al inicializar la base de datos:', err);
    throw err;
  }
}

export default db;
