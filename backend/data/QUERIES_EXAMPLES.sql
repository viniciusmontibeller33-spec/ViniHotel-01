-- ===============================================
-- VINIHOTEL - QUERIES SQL DE EJEMPLO
-- Instrucciones útiles para la BD
-- ===============================================

-- ===============================================
-- 1️⃣ USUARIOS - Gestión de usuarios
-- ===============================================

-- Ver todos los usuarios
SELECT * FROM usuarios;

-- Ver solo clientes
SELECT * FROM usuarios WHERE rol = 'client';

-- Ver solo staff
SELECT * FROM usuarios WHERE rol = 'staff';

-- Ver solo admins
SELECT * FROM usuarios WHERE rol = 'admin';

-- Buscar usuario por email
SELECT * FROM usuarios WHERE email = 'juan@example.com';

-- Ver usuarios por fecha de registro (últimos 7 días)
SELECT * FROM usuarios 
WHERE createdAt >= datetime('now', '-7 days') 
ORDER BY createdAt DESC;

-- Contar usuarios por rol
SELECT rol, COUNT(*) as cantidad 
FROM usuarios 
GROUP BY rol;

-- ===============================================
-- 2️⃣ CLIENTES - Información de clientes
-- ===============================================

-- Ver todos los clientes con su información de usuario
SELECT c.idCliente, u.nombre, u.apellido, u.email, c.telefono, c.documentoIdentidad 
FROM clientes c
JOIN usuarios u ON c.idUsuario = u.idUsuario;

-- Ver cliente específico con todos sus datos
SELECT c.*, u.* 
FROM clientes c
JOIN usuarios u ON c.idUsuario = u.idUsuario 
WHERE c.idCliente = 1;

-- Clientes que más han reservado
SELECT u.idUsuario, u.nombre, u.apellido, COUNT(b.id) as total_reservas
FROM usuarios u
JOIN clientes c ON u.idUsuario = c.idUsuario
JOIN bookings b ON c.idCliente = b.idCliente
GROUP BY u.idUsuario
ORDER BY total_reservas DESC
LIMIT 10;

-- ===============================================
-- 3️⃣ HOTELES - Información de hoteles
-- ===============================================

-- Ver todos los hoteles
SELECT idHotel, nombre, location, rating FROM hoteles;

-- Ver hotel específico
SELECT * FROM hoteles WHERE idHotel = 'hotel-uuid';

-- Hoteles ordenados por rating
SELECT nombre, location, rating FROM hoteles ORDER BY rating DESC;

-- Contar habitaciones por hotel
SELECT h.nombre, COUNT(r.id) as total_habitaciones
FROM hoteles h
LEFT JOIN rooms r ON h.idHotel = r.hotelId
GROUP BY h.idHotel;

-- Hotel con mejor rating
SELECT * FROM hoteles ORDER BY rating DESC LIMIT 1;

-- ===============================================
-- 4️⃣ HABITACIONES - Gestión de rooms
-- ===============================================

-- Ver todas las habitaciones
SELECT r.id, r.name, r.type, r.price, r.capacity, h.nombre as hotel 
FROM rooms r
JOIN hoteles h ON r.hotelId = h.idHotel;

-- Habitaciones disponibles de un hotel
SELECT id, name, type, price, capacity, available 
FROM rooms 
WHERE hotelId = 'hotel-uuid' AND available > 0;

-- Habitaciones por tipo
SELECT type, COUNT(*) as cantidad, AVG(price) as precio_promedio
FROM rooms
GROUP BY type;

-- Habitaciones más caras
SELECT name, type, price, capacity FROM rooms ORDER BY price DESC LIMIT 10;

-- Habitaciones menos ocupadas
SELECT r.name, r.hotelId, COUNT(b.id) as reservas 
FROM rooms r
LEFT JOIN bookings b ON r.id = b.roomId
GROUP BY r.id
ORDER BY reservas ASC
LIMIT 10;

-- ===============================================
-- 5️⃣ RESERVAS - Gestión de bookings
-- ===============================================

-- Ver todas las reservas
SELECT b.*, r.name as habitacion, h.nombre as hotel 
FROM bookings b
JOIN rooms r ON b.roomId = r.id
JOIN hoteles h ON r.hotelId = h.idHotel;

-- Reservas activas (no canceladas)
SELECT * FROM bookings 
WHERE status != 'cancelled' 
ORDER BY checkIn ASC;

-- Mis reservas como cliente (idCliente = 1)
SELECT b.*, r.name, r.type, h.nombre as hotel 
FROM bookings b
JOIN rooms r ON b.roomId = r.id
JOIN hoteles h ON r.hotelId = h.idHotel
WHERE b.idCliente = 1
ORDER BY b.checkIn DESC;

-- Reservas en una fecha específica
SELECT * FROM bookings 
WHERE checkIn <= '2026-05-01' AND checkOut >= '2026-05-01'
AND status != 'cancelled';

-- Habitación ocupada en rango de fechas
SELECT COUNT(*) as reservas_conflictivas FROM bookings 
WHERE roomId = 'room-uuid' 
  AND status != 'cancelled'
  AND checkIn < '2026-05-10' 
  AND checkOut > '2026-05-05';

-- Reservas pendientes de pago
SELECT b.id, r.name, h.nombre, b.totalPrice, b.checkIn, b.checkOut 
FROM bookings b
JOIN rooms r ON b.roomId = r.id
JOIN hoteles h ON r.hotelId = h.idHotel
WHERE b.paymentStatus = 'pending'
ORDER BY b.createdAt DESC;

-- Ingresos por reserva (últimos 30 días)
SELECT SUM(totalPrice) as total_ingresos 
FROM bookings 
WHERE createdAt >= datetime('now', '-30 days');

-- Ocupación promedio por hotel (últimos 30 días)
SELECT h.nombre, 
       COUNT(DISTINCT b.id) as reservas,
       AVG(JULIANDAY(b.checkOut) - JULIANDAY(b.checkIn)) as promedio_noches
FROM bookings b
JOIN rooms r ON b.roomId = r.id
JOIN hoteles h ON r.hotelId = h.idHotel
WHERE b.createdAt >= datetime('now', '-30 days')
GROUP BY h.idHotel;

-- ===============================================
-- 6️⃣ FACTURAS - Gestión de invoices
-- ===============================================

-- Ver todas las facturas
SELECT * FROM invoices ORDER BY issuedDate DESC;

-- Mis facturas como usuario (userId = 1)
SELECT i.*, b.id as booking_id 
FROM invoices i
JOIN bookings b ON i.bookingId = b.id
WHERE i.userId = 1
ORDER BY i.issuedDate DESC;

-- Facturas pagadas
SELECT * FROM invoices WHERE paymentStatus = 'paid';

-- Facturas pendientes
SELECT * FROM invoices WHERE paymentStatus = 'pending';

-- Ingresos totales
SELECT SUM(total) as ingresos_totales FROM invoices;

-- Ingresos este mes
SELECT SUM(total) as ingresos_mes 
FROM invoices 
WHERE strftime('%Y-%m', issuedDate) = strftime('%Y-%m', 'now');

-- Ingresos por método de pago
SELECT paymentMethod, COUNT(*) as transacciones, SUM(total) as monto
FROM invoices
GROUP BY paymentMethod;

-- Factura específica con detalles
SELECT i.*, b.roomId, b.checkIn, b.checkOut, r.name, r.price 
FROM invoices i
JOIN bookings b ON i.bookingId = b.id
JOIN rooms r ON b.roomId = r.id
WHERE i.id = 'invoice-uuid';

-- ===============================================
-- 7️⃣ STAFF - Personal hotelero
-- ===============================================

-- Ver todo el staff
SELECT s.name, s.position, h.nombre as hotel, s.email, s.status 
FROM staff s
JOIN hoteles h ON s.hotelId = h.idHotel;

-- Staff activo por hotel
SELECT h.nombre, COUNT(s.id) as empleados 
FROM staff s
JOIN hoteles h ON s.hotelId = h.idHotel
WHERE s.status = 'active'
GROUP BY h.idHotel;

-- Staff sin usuario asociado (sin login)
SELECT * FROM staff WHERE idUsuario IS NULL;

-- Empleados contratados recientemente (últimos 30 días)
SELECT name, position, hireDate 
FROM staff 
WHERE hireDate >= date('now', '-30 days')
ORDER BY hireDate DESC;

-- ===============================================
-- 8️⃣ REPORTES Y ANÁLISIS
-- ===============================================

-- Dashboard: Resumen general
SELECT 
  (SELECT COUNT(*) FROM usuarios) as total_usuarios,
  (SELECT COUNT(*) FROM usuarios WHERE rol = 'client') as clientes,
  (SELECT COUNT(*) FROM hoteles) as hoteles,
  (SELECT COUNT(*) FROM rooms) as habitaciones,
  (SELECT COUNT(*) FROM bookings) as reservas,
  (SELECT SUM(total) FROM invoices WHERE paymentStatus = 'paid') as ingresos_totales;

-- Reporte: Ocupación por hotel (este mes)
SELECT 
  h.nombre,
  COUNT(DISTINCT b.id) as reservas,
  SUM(JULIANDAY(b.checkOut) - JULIANDAY(b.checkIn)) as total_noches,
  ROUND(AVG(JULIANDAY(b.checkOut) - JULIANDAY(b.checkIn)), 2) as promedio_noches,
  ROUND(SUM(b.totalPrice), 2) as ingresos
FROM bookings b
JOIN rooms r ON b.roomId = r.id
JOIN hoteles h ON r.hotelId = h.idHotel
WHERE strftime('%Y-%m', b.checkIn) = strftime('%Y-%m', 'now')
GROUP BY h.idHotel
ORDER BY ingresos DESC;

-- Reporte: Habitación más reservada
SELECT 
  r.name, 
  r.type, 
  h.nombre as hotel,
  COUNT(b.id) as reservas,
  ROUND(SUM(b.totalPrice), 2) as ingresos
FROM bookings b
JOIN rooms r ON b.roomId = r.id
JOIN hoteles h ON r.hotelId = h.idHotel
GROUP BY r.id
ORDER BY reservas DESC
LIMIT 10;

-- Reporte: Métodos de pago más usados
SELECT 
  paymentMethod, 
  COUNT(*) as transacciones,
  ROUND(AVG(total), 2) as promedio_monto,
  ROUND(SUM(total), 2) as monto_total
FROM invoices
GROUP BY paymentMethod
ORDER BY transacciones DESC;

-- Reporte: Clientes nuevos este mes
SELECT 
  u.idUsuario,
  u.nombre,
  u.apellido,
  u.email,
  u.createdAt,
  COUNT(b.id) as reservas_realizadas
FROM usuarios u
LEFT JOIN clientes c ON u.idUsuario = c.idUsuario
LEFT JOIN bookings b ON c.idCliente = b.idCliente
WHERE u.rol = 'client' AND strftime('%Y-%m', u.createdAt) = strftime('%Y-%m', 'now')
GROUP BY u.idUsuario
ORDER BY u.createdAt DESC;

-- ===============================================
-- 9️⃣ MANTENIMIENTO DE BD
-- ===============================================

-- Ver tamaño de la BD (aproximado)
-- SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();

-- Eliminar reservas canceladas hace más de 90 días
-- DELETE FROM bookings 
-- WHERE status = 'cancelled' 
-- AND createdAt < datetime('now', '-90 days');

-- Actualizar estado de reservas pasadas a 'checked-out'
UPDATE bookings 
SET status = 'checked-out'
WHERE status = 'checked-in' AND checkOut < date('now');

-- Contar registros por tabla
SELECT 'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'hoteles', COUNT(*) FROM hoteles
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'staff', COUNT(*) FROM staff;

-- ===============================================
-- 🔟 VALIDACIÓN DE INTEGRIDAD
-- ===============================================

-- Verificar clientes sin usuario asociado
SELECT * FROM clientes WHERE idUsuario NOT IN (SELECT idUsuario FROM usuarios);

-- Verificar bookings sin cliente válido
SELECT * FROM bookings WHERE idCliente NOT IN (SELECT idCliente FROM clientes);

-- Verificar bookings sin habitación válida
SELECT * FROM bookings WHERE roomId NOT IN (SELECT id FROM rooms);

-- Verificar invoices sin booking válido
SELECT * FROM invoices WHERE bookingId NOT IN (SELECT id FROM bookings);

-- Verificar habitaciones sin hotel válido
SELECT * FROM rooms WHERE hotelId NOT IN (SELECT idHotel FROM hoteles);
