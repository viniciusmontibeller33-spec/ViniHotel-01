# 📊 Documentación de la Base de Datos ViniHotel

## 📁 7 Tablas Principales

### 1️⃣ USUARIOS
Almacena todos los usuarios del sistema (clientes, staff, admins)

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| idUsuario | INTEGER | PK AUTO | ID único usuario (auto-incremento) |
| nombre | TEXT | NOT NULL | Nombre del usuario |
| apellido | TEXT | NOT NULL | Apellido del usuario |
| email | TEXT | UNIQUE | Email único para login |
| contrasena | TEXT | NOT NULL | Contraseña hasheada (bcrypt) |
| rol | TEXT | DEFAULT 'client' | client / staff / admin |
| phone | TEXT | NULLABLE | Teléfono de contacto |
| address | TEXT | NULLABLE | Dirección |
| dateOfBirth | DATE | NULLABLE | Fecha de nacimiento |
| nationality | TEXT | NULLABLE | Nacionalidad |
| documentId | TEXT | NULLABLE | ID documento (cédula, pasaporte, etc) |
| createdAt | DATETIME | DEFAULT NOW | Fecha de creación |
| updatedAt | DATETIME | DEFAULT NOW | Última actualización |

---

### 2️⃣ CLIENTES
Información adicional específica de clientes (1:1 con USUARIOS)

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| idCliente | INTEGER | PK AUTO | ID único cliente |
| telefono | TEXT | NULLABLE | Teléfono cliente |
| documentoIdentidad | TEXT | NULLABLE | Documento de identidad |
| idUsuario | INTEGER | FK UNIQUE | Referencia a usuario |
| createdAt | DATETIME | DEFAULT NOW | Fecha de creación |
| updatedAt | DATETIME | DEFAULT NOW | Última actualización |

**Relación:**
```
USUARIOS (1) -----> (1) CLIENTES
Cada usuario cliente tiene UN registro en clientes
```

---

### 3️⃣ HOTELES
Información de los hoteles

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| idHotel | TEXT | PK | ID único (UUID) |
| nombre | TEXT | NOT NULL | Nombre hotel |
| description | TEXT | NOT NULL | Descripción detallada |
| location | TEXT | NOT NULL | Ubicación geográfica |
| image | TEXT | NOT NULL | URL imagen principal |
| rating | REAL | NOT NULL | Puntuación 0-5 |
| amenities | TEXT | NOT NULL | JSON con comodidades |
| createdAt | DATETIME | DEFAULT NOW | Fecha creación |
| updatedAt | DATETIME | DEFAULT NOW | Última actualización |

**Ejemplo amenities JSON:**
```json
["WiFi", "Piscina", "Gym", "Spa", "Restaurante 24/7", "Servicio de habitaciones"]
```

---

### 4️⃣ ROOMS
Habitaciones de cada hotel

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | TEXT | PK | ID único (UUID) |
| hotelId | TEXT | FK | Referencia al hotel |
| name | TEXT | NOT NULL | Nombre habitación (ej: Suite Presidencial) |
| type | TEXT | NOT NULL | Tipo (standard, deluxe, suite, etc) |
| price | REAL | NOT NULL | Precio por noche en USD |
| capacity | INTEGER | NOT NULL | Número de personas máximo |
| image | TEXT | NOT NULL | URL imagen habitación |
| amenities | TEXT | NOT NULL | JSON con servicios |
| available | INTEGER | DEFAULT 1 | Cantidad disponible (stock) |
| status | TEXT | DEFAULT 'available' | available / maintenance / booked |
| createdAt | DATETIME | DEFAULT NOW | Fecha creación |
| updatedAt | DATETIME | DEFAULT NOW | Última actualización |

**Relación:**
```
HOTELES (1) -----> (N) ROOMS
Un hotel tiene VARIAS habitaciones
```

---

### 5️⃣ STAFF
Personal hotelero (recepcionistas, housekeeping, gerentes, etc)

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | TEXT | PK | ID único (UUID) |
| name | TEXT | NOT NULL | Nombre completo |
| position | TEXT | NOT NULL | Cargo (receptionist, housekeeper, manager) |
| hotelId | TEXT | FK | Hotel donde trabaja |
| email | TEXT | NOT NULL | Email contacto |
| phone | TEXT | NULLABLE | Teléfono |
| status | TEXT | DEFAULT 'active' | active / inactive / on-leave |
| hireDate | DATE | NOT NULL | Fecha de contratación |
| idUsuario | INTEGER | FK NULLABLE | Referencia a usuario (si tiene login) |
| createdAt | DATETIME | DEFAULT NOW | Fecha creación |
| updatedAt | DATETIME | DEFAULT NOW | Última actualización |

**Relaciones:**
```
HOTELES (1) -----> (N) STAFF
USUARIOS (1) -----> (N) STAFF
Un staff puede no tener usuario asociado
```

---

### 6️⃣ BOOKINGS
Reservas de habitaciones

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | TEXT | PK | ID único (UUID) |
| roomId | TEXT | FK | Habitación reservada |
| idCliente | INTEGER | FK | Cliente que reserva |
| checkIn | DATE | NOT NULL | Fecha entrada |
| checkOut | DATE | NOT NULL | Fecha salida |
| guests | INTEGER | NOT NULL | Número huéspedes |
| totalPrice | REAL | NOT NULL | Precio total en USD |
| paymentMethod | TEXT | NOT NULL | credit_card / debit_card / paypal / twallet |
| status | TEXT | DEFAULT 'confirmed' | confirmed / checked-in / checked-out / cancelled |
| paymentStatus | TEXT | DEFAULT 'pending' | pending / paid / refunded |
| createdAt | DATETIME | DEFAULT NOW | Fecha creación |
| updatedAt | DATETIME | DEFAULT NOW | Última actualización |

**Relaciones:**
```
ROOMS (1) -----> (N) BOOKINGS
CLIENTES (1) -----> (N) BOOKINGS
Una habitación puede tener múltiples reservas en fechas diferentes
Un cliente puede hacer múltiples reservas
```

---

### 7️⃣ INVOICES
Facturas / Recibos de pagos

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | TEXT | PK | ID único (UUID) |
| bookingId | TEXT | FK | Reserva asociada |
| userId | INTEGER | FK | Usuario que paga |
| subtotal | REAL | NOT NULL | Total sin impuestos |
| taxes | REAL | NOT NULL | Impuestos/IVA |
| total | REAL | NOT NULL | Total final (subtotal + taxes) |
| additionalCharges | TEXT | NULLABLE | JSON con cargos adicionales |
| paymentMethod | TEXT | NOT NULL | Método de pago usado |
| paymentStatus | TEXT | DEFAULT 'pending' | pending / paid / failed / refunded |
| issuedDate | DATETIME | DEFAULT NOW | Fecha emisión factura |
| createdAt | DATETIME | DEFAULT NOW | Fecha creación |
| updatedAt | DATETIME | DEFAULT NOW | Última actualización |

**Ejemplo additionalCharges JSON:**
```json
{
  "resort_fee": 15.00,
  "service_charge": 20.50,
  "parking": 10.00
}
```

**Relaciones:**
```
BOOKINGS (1) -----> (N) INVOICES
USUARIOS (1) -----> (N) INVOICES
Una reserva puede tener múltiples facturas (parciales, reembolsos, etc)
```

---

## 🔗 Diagrama de Relaciones

```
USUARIOS
  ├─ 1:1 ─────> CLIENTES
  ├─ 1:N ─────> STAFF
  └─ 1:N ─────> INVOICES

HOTELES
  ├─ 1:N ─────> ROOMS
  └─ 1:N ─────> STAFF

ROOMS
  └─ 1:N ─────> BOOKINGS

CLIENTES
  └─ 1:N ─────> BOOKINGS

BOOKINGS
  └─ 1:N ─────> INVOICES
```

---

## 🔍 Índices Creados para Optimizar

```sql
CREATE INDEX idx_rooms_hotelId ON rooms(hotelId);
CREATE INDEX idx_clientes_idUsuario ON clientes(idUsuario);
CREATE INDEX idx_staff_hotelId ON staff(hotelId);
CREATE INDEX idx_bookings_roomId ON bookings(roomId);
CREATE INDEX idx_bookings_idCliente ON bookings(idCliente);
CREATE INDEX idx_invoices_bookingId ON invoices(bookingId);
CREATE INDEX idx_usuarios_email ON usuarios(email);
```

---

## 📋 Tipos de Datos SQLite

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| TEXT | Texto variable | 'Juan Pérez' |
| INTEGER | Números enteros | 25, -100, 0 |
| REAL | Números decimales | 99.99, 150.5 |
| DATE | Fecha ISO8601 | '2026-04-12' |
| DATETIME | Fecha y hora | '2026-04-12 21:59:21' |

---

## 🔐 Comandos SQL Útiles

### Ver todas las reservas de un cliente
```sql
SELECT b.* FROM bookings b 
JOIN clientes c ON b.idCliente = c.idCliente 
WHERE c.idUsuario = 1;
```

### Ver disponibilidad de una habitación
```sql
SELECT * FROM rooms WHERE id = 'room-uuid' AND available > 0;
```

### Ver ingresos por hotel
```sql
SELECT h.nombre, SUM(i.total) as ingresos 
FROM invoices i 
JOIN bookings b ON i.bookingId = b.id 
JOIN rooms r ON b.roomId = r.id 
JOIN hoteles h ON r.hotelId = h.idHotel 
GROUP BY h.idHotel;
```

### Ver reservas en conflicto (fechas solapadas)
```sql
SELECT * FROM bookings 
WHERE roomId = 'room-uuid' 
  AND status != 'cancelled'
  AND checkIn < '2026-05-01' 
  AND checkOut > '2026-04-20';
```

### Ver clientes más frecuentes
```sql
SELECT u.nombre, u.apellido, COUNT(b.id) as reservas 
FROM bookings b 
JOIN clientes c ON b.idCliente = c.idCliente 
JOIN usuarios u ON c.idUsuario = u.idUsuario 
GROUP BY u.idUsuario 
ORDER BY reservas DESC 
LIMIT 10;
```

---

## 💾 Ubicación de la BD

```
Ubicación: c:\Users\Eduardo\Downloads\ViniHotel-main\backend\data\vinihotel.db
Tipo: SQLite3
Tamaño: Dinámico (crece conforme se agregan datos)
```

---

## 🛠️ Herramientas para ver la BD

1. **DB Browser for SQLite** - https://sqlitebrowser.org/
2. **VS Code Extension** - "SQLite" (ms-vscode.sqlite)
3. **Online** - https://sqliteonline.com/
4. **Command Line** - `sqlite3 vinihotel.db`

---

## ✅ Validaciones en la BD

- `email` en `usuarios` es UNIQUE
- `idUsuario` en `clientes` es UNIQUE (1:1)
- Todas las Foreign Keys están habilitadas (`PRAGMA foreign_keys = ON`)
- ON DELETE CASCADE en clientes garantiza que al eliminar usuario se elimina cliente
- Timestamps automáticos con DEFAULT CURRENT_TIMESTAMP

---

## 🚀 Próximos Pasos

- Ver datos con DB Browser
- Hacer queries personalizadas
- Crear reportes (ingresos, ocupación, etc)
- Hacer backups de la BD
