# 🚀 Guía de Instalación y Uso - Backend ViniHotel

## Paso 1: Instalar Node.js

Descarga e instala Node.js desde https://nodejs.org (versión 16+)

## Paso 2: Instalar Dependencias

Abre una terminal (cmd o PowerShell) y navega a la carpeta backend:

```bash
cd c:\Users\Eduardo\Downloads\ViniHotel-main\backend
npm install
```

Este comando descargará todas las dependencias necesarias.

## Paso 3: Iniciar el Backend

En la mismo terminal, ejecuta:

```bash
npm run dev
```

Deberías ver algo como:
```
✅ Base de datos inicializada correctamente
✅ Servidor corriendo en http://localhost:5000
🔌 CORS habilitado para: http://localhost:5173
```

## Paso 4: Iniciar el Frontend

En otra terminal, navega a la carpeta raiz del proyecto:

```bash
cd c:\Users\Eduardo\Downloads\ViniHotel-main
npm run dev
```

El frontend estará en: http://localhost:5173

## 📚 Cómo Usar

### 1. Registro/Login
- Primero regístrate en el frontend
- Se crea automáticamente un token JWT
- El token se guarda en localStorage

### 2. API Endpoints Disponibles

**Autenticación:**
- POST `/api/auth/register` - Registrar usuario
- POST `/api/auth/login` - Iniciar sesión
- GET `/api/auth/me` - Obtener perfil
- PUT `/api/auth/profile` - Actualizar perfil

**Hoteles:**
- GET `/api/hotels` - Listar todos
- GET `/api/hotels/:idHotel` - Obtener uno
- POST `/api/hotels` - Crear (admin)
- PUT `/api/hotels/:idHotel` - Actualizar (admin)
- DELETE `/api/hotels/:idHotel` - Eliminar (admin)

**Habitaciones:**
- GET `/api/rooms` - Listar todas
- GET `/api/rooms/hotel/:hotelId` - Por hotel
- GET `/api/rooms/:id` - Obtener una
- POST `/api/rooms/check-availability` - Verificar disponibilidad
- POST `/api/rooms` - Crear (admin)
- PUT `/api/rooms/:id` - Actualizar (admin)
- DELETE `/api/rooms/:id` - Eliminar (admin)

**Reservas:**
- GET `/api/bookings/my-bookings` - Mis reservas
- GET `/api/bookings/:id` - Obtener una
- POST `/api/bookings` - Crear reserva
- PUT `/api/bookings/:id` - Actualizar
- POST `/api/bookings/:id/cancel` - Cancelar
- GET `/api/bookings` - Todas (admin/staff)

**Facturas:**
- GET `/api/invoices/my-invoices` - Mis facturas
- GET `/api/invoices/:id` - Obtener una
- POST `/api/invoices` - Crear
- PUT `/api/invoices/:id` - Actualizar
- GET `/api/invoices` - Todas (admin)

## 🧪 Testing con cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"juan@example.com\",\"contrasena\":\"password123\"}"

# Obtener hoteles
curl http://localhost:5000/api/hotels

# Obtener perfil (requiere token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/me
```

## 🔧 Troubleshooting

**Error: "sqlite3 not found"**
```bash
npm install sqlite3 --build-from-source
```

**Error: Puerto 5000 en uso**
```bash
# Cambiar puerto en .env
PORT=5001
```

**CORS error en frontend**
```bash
# Asegúrate que CORS_ORIGIN en .env sea:
CORS_ORIGIN=http://localhost:5173
```

## 📝 Datos de Prueba

El backend crea datos de prueba automáticamente. Para agregar más:

1. Edita `src/utils/sampleData.js`
2. Elimina la BD: `data/vinihotel.db` (se recrea al iniciar)
3. Reinicia el servidor

## 🔐 JWT Token

- Se genera al login/register
- Dura 7 días (configurado en .env)
- Se almacena en localStorage del navegador
- Se envía en header `Authorization: Bearer <token>`

## 🗄️ Base de Datos

- **Tipo:** SQLite
- **Archivo:** `backend/data/vinihotel.db`
- **Se crea automáticamente** al iniciar el servidor
- Contiene 7 tablas: usuarios, clientes, hoteles, rooms, bookings, invoices, staff

## 🚨 Importante

- **NO** subir `.env` a git
- Cambiar `JWT_SECRET` en producción
- Las contraseñas se hashean automáticamente con bcrypt
- Validar siempre en el frontend antes de enviar al backend

¡El backend está listo para usar!
