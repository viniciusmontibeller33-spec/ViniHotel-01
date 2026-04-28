-- ===============================================
-- VINIHOTEL DATABASE SCHEMA (3NF NORMALIZED)
-- SQLite3 Database Structure
-- Production-Ready with Full Integrity Constraints
-- ===============================================

PRAGMA foreign_keys = ON;

-- ===============================================
-- TABLAS DE CONFIGURACIÓN (Enums)
-- ===============================================

CREATE TABLE IF NOT EXISTS room_types (
  id TEXT PRIMARY KEY CHECK(id IN ('single', 'double', 'suite', 'penthouse')),
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS staff_positions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  requiresAuth INTEGER DEFAULT 1 CHECK(requiresAuth IN (0, 1))
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  enabled INTEGER DEFAULT 1 CHECK(enabled IN (0, 1))
);

-- ===============================================
-- TABLA CENTRAL: USUARIOS
-- Almacena todos los usuarios del sistema
-- (sin duplicación de datos entre clientes y staff)
-- ===============================================

CREATE TABLE IF NOT EXISTS usuarios (
  idUsuario TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  rol TEXT NOT NULL CHECK(rol IN ('client', 'staff', 'admin')),
  phone TEXT,
  documentId TEXT UNIQUE,
  dateOfBirth DATE,
  nationality TEXT,
  address TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- TABLA: CLIENTES
-- Extensión de usuarios para clientes
-- Evita duplicación manteniendo referencia a usuarios
-- ===============================================

CREATE TABLE IF NOT EXISTS clientes (
  idCliente TEXT PRIMARY KEY,
  idUsuario TEXT NOT NULL UNIQUE,
  preferredLanguage TEXT DEFAULT 'es',
  loyaltyPoints INTEGER DEFAULT 0 CHECK(loyaltyPoints >= 0),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario) ON DELETE CASCADE
);

-- ===============================================
-- TABLA: HOTELES
-- Información de hoteles sin redundancia
-- ===============================================

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
);

-- ===============================================
-- TABLA: HOTEL AMENITIES
-- Normalizada: amenidades de hotel en tabla separada
-- ===============================================

CREATE TABLE IF NOT EXISTS hotel_amenities (
  id TEXT PRIMARY KEY,
  hotelId TEXT NOT NULL,
  amenity TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotelId) REFERENCES hoteles(idHotel) ON DELETE CASCADE,
  UNIQUE(hotelId, amenity)
);

-- ===============================================
-- TABLA: ROOMS
-- Habitaciones sin redundancia de amenities o tipo
-- ===============================================

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
);

-- ===============================================
-- TABLA: ROOM AMENITIES
-- Normalizada: amenidades de room en tabla separada
-- ===============================================

CREATE TABLE IF NOT EXISTS room_amenities (
  id TEXT PRIMARY KEY,
  roomId TEXT NOT NULL,
  amenity TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE,
  UNIQUE(roomId, amenity)
);

-- ===============================================
-- TABLA: STAFF
-- Personal hotelero
-- Extensión de usuarios (relación 1:1 con usuarios si tiene rol staff)
-- ===============================================

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
);

-- ===============================================
-- TABLA: BOOKINGS
-- Reservas de habitaciones normalizadas
-- Sin duplicación de información
-- ===============================================

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
);

-- ===============================================
-- TABLA: INVOICES
-- Facturas de reservas
-- Fuente única de verdad para estado de pago
-- ===============================================

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
);

-- ===============================================
-- TABLA: INVOICE ITEMS
-- Normalizada: desglose de cargos adicionales
-- ===============================================

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoiceId TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount >= 0),
  itemType TEXT NOT NULL CHECK(itemType IN ('accommodation', 'additional_charge', 'discount', 'tax')),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
);

-- ===============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ===============================================

-- Índices en claves foráneas (búsquedas comunes)
CREATE INDEX IF NOT EXISTS idx_clientes_idUsuario ON clientes(idUsuario);
CREATE INDEX IF NOT EXISTS idx_staff_idUsuario ON staff(idUsuario);
CREATE INDEX IF NOT EXISTS idx_staff_hotelId ON staff(hotelId);

-- Índices en búsquedas por hotel
CREATE INDEX IF NOT EXISTS idx_rooms_hotelId ON rooms(hotelId);
CREATE INDEX IF NOT EXISTS idx_hotel_amenities_hotelId ON hotel_amenities(hotelId);
CREATE INDEX IF NOT EXISTS idx_room_amenities_roomId ON room_amenities(roomId);

-- Índices en booking (búsquedas frecuentes)
CREATE INDEX IF NOT EXISTS idx_bookings_idCliente ON bookings(idCliente);
CREATE INDEX IF NOT EXISTS idx_bookings_roomId ON bookings(roomId);
CREATE INDEX IF NOT EXISTS idx_bookings_checkIn ON bookings(checkIn);
CREATE INDEX IF NOT EXISTS idx_bookings_checkOut ON bookings(checkOut);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Índices en invoices
CREATE INDEX IF NOT EXISTS idx_invoices_bookingId ON invoices(bookingId);
CREATE INDEX IF NOT EXISTS idx_invoices_idUsuario ON invoices(idUsuario);
CREATE INDEX IF NOT EXISTS idx_invoices_paymentStatus ON invoices(paymentStatus);
CREATE INDEX IF NOT EXISTS idx_invoices_issuedDate ON invoices(issuedDate);

-- Índices en usuarios (búsqueda por email común)
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Índices en invoice_items
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoiceId ON invoice_items(invoiceId);

-- ===============================================
-- DATOS DE INICIALIZACIÓN
-- ===============================================

-- Tipos de habitaciones
INSERT OR IGNORE INTO room_types (id, name, description) VALUES 
('single', 'Habitación Simple', 'Habitación para una persona'),
('double', 'Habitación Doble', 'Habitación para dos personas'),
('suite', 'Suite', 'Suite con sala y dormitorio'),
('penthouse', 'Penthouse', 'Penthouse de lujo con vistas panorámicas');

-- Posiciones de staff
INSERT OR IGNORE INTO staff_positions (id, name, description, requiresAuth) VALUES 
('manager', 'Gerente', 'Gerente del hotel', 1),
('receptionist', 'Recepcionista', 'Personal de recepción', 1),
('housekeeping', 'Limpieza', 'Personal de limpieza', 0),
('chef', 'Chef', 'Chef del restaurante', 0),
('waiter', 'Mesero', 'Personal de servicio', 0),
('maintenance', 'Mantenimiento', 'Personal de mantenimiento', 0);

-- Métodos de pago
INSERT OR IGNORE INTO payment_methods (id, name, enabled) VALUES 
('credit_card', 'Tarjeta de Crédito', 1),
('debit_card', 'Tarjeta de Débito', 1),
('paypal', 'PayPal', 1),
('bank_transfer', 'Transferencia Bancaria', 1),
('cash', 'Efectivo', 1);

-- ===============================================
-- VISTAS ÚTILES
-- ===============================================

-- Vista: Información completa de reservas
CREATE VIEW IF NOT EXISTS v_bookings_complete AS
SELECT 
  b.id as bookingId,
  b.checkIn,
  b.checkOut,
  b.numberOfGuests,
  b.totalPrice,
  b.status,
  b.createdAt,
  u.nombre,
  u.apellido,
  u.email,
  h.nombre as hotelName,
  r.name as roomName,
  rt.name as roomType,
  r.capacity,
  r.price
FROM bookings b
JOIN clientes c ON b.idCliente = c.idCliente
JOIN usuarios u ON c.idUsuario = u.idUsuario
JOIN rooms r ON b.roomId = r.id
JOIN hoteles h ON r.hotelId = h.idHotel
JOIN room_types rt ON r.roomTypeId = rt.id;

-- Vista: Estado de pagos
CREATE VIEW IF NOT EXISTS v_invoices_complete AS
SELECT 
  i.id as invoiceId,
  i.bookingId,
  i.subtotal,
  i.taxes,
  i.discount,
  i.total,
  i.paymentStatus,
  i.paymentMethod,
  i.issuedDate,
  u.nombre,
  u.apellido,
  u.email
FROM invoices i
JOIN usuarios u ON i.idUsuario = u.idUsuario;

-- Vista: Disponibilidad de habitaciones
CREATE VIEW IF NOT EXISTS v_room_availability AS
SELECT 
  r.id as roomId,
  r.name as roomName,
  rt.name as roomType,
  h.idHotel,
  h.nombre as hotelName,
  r.capacity,
  r.price,
  r.available as totalRooms,
  (SELECT COUNT(*) FROM bookings b 
   WHERE b.roomId = r.id 
   AND b.status IN ('confirmed', 'checked-in')
   AND b.checkOut > DATE('now')
   AND b.checkIn <= DATE('now')) as bookedRooms,
  CASE WHEN r.available > 0 THEN 'available' ELSE 'full' END as status
FROM rooms r
JOIN hoteles h ON r.hotelId = h.idHotel
JOIN room_types rt ON r.roomTypeId = rt.id;
-- RELACIONES PRINCIPALES
-- ===============================================

/*
usuarios (1) -----> (N) clientes
usuarios (1) -----> (N) staff
hoteles (1) -----> (N) rooms
hoteles (1) -----> (N) staff
rooms (1) -----> (N) bookings
clientes (1) -----> (N) bookings
bookings (1) -----> (N) invoices
usuarios (1) -----> (N) invoices
*/

-- ===============================================
-- QUERIES ÚTILES
-- ===============================================

-- Ver todas las reservas de un cliente
-- SELECT b.* FROM bookings b 
-- JOIN clientes c ON b.idCliente = c.idCliente 
-- WHERE c.idUsuario = ?;

-- Ver disponibilidad de una habitación
-- SELECT * FROM rooms WHERE id = ? AND available > 0;

-- Ver ingresos por hotel
-- SELECT h.nombre, SUM(i.total) as ingresos 
-- FROM invoices i 
-- JOIN bookings b ON i.bookingId = b.id 
-- JOIN rooms r ON b.roomId = r.id 
-- JOIN hoteles h ON r.hotelId = h.idHotel 
-- GROUP BY h.idHotel;
