# ViniHotel Backend

Backend Node.js + Express para la aplicación de reservas de hoteles ViniHotel.

## 📋 Requisitos

- Node.js >= 16
- npm o yarn

## 🚀 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env` en la raíz del backend con las variables de entorno

3. Iniciar el servidor:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── models/           # Modelos de datos
│   ├── routes/           # Rutas API
│   ├── middleware/       # Middleware (auth, validación)
│   ├── utils/            # Utilidades (database, etc)
│   └── server.js         # Entrada principal
├── data/                 # BD SQLite (vinihotel.db)
├── package.json
├── .env                  # Variables de entorno
└── .gitignore
```

## 🔌 API Endpoints

### Autenticación (`/api/auth`)
- `POST /register` - Registrar nuevo usuario
- `POST /login` - Iniciar sesión
- `GET /me` - Obtener perfil actual
- `PUT /profile` - Actualizar perfil

### Hoteles (`/api/hotels`)
- `GET /` - Listar todos los hoteles
- `GET /:idHotel` - Obtener hotel por ID
- `POST /` - Crear hotel (admin)
- `PUT /:idHotel` - Actualizar hotel (admin)
- `DELETE /:idHotel` - Eliminar hotel (admin)

### Habitaciones (`/api/rooms`)
- `GET /` - Listar todas las habitaciones
- `GET /hotel/:hotelId` - Habitaciones por hotel
- `GET /:id` - Obtener habitación por ID
- `POST /` - Crear habitación (admin)
- `PUT /:id` - Actualizar habitación (admin)
- `DELETE /:id` - Eliminar habitación (admin)
- `POST /check-availability` - Verificar disponibilidad

### Reservas (`/api/bookings`)
- `GET /my-bookings` - Mis reservas
- `GET /:id` - Obtener reserva por ID
- `POST /` - Crear nueva reserva
- `PUT /:id` - Actualizar reserva
- `POST /:id/cancel` - Cancelar reserva
- `GET /` - Todas las reservas (admin/staff)

### Facturas (`/api/invoices`)
- `GET /my-invoices` - Mis facturas
- `GET /:id` - Obtener factura por ID
- `POST /` - Crear factura
- `PUT /:id` - Actualizar factura
- `GET /` - Todas las facturas (admin)

## 🔐 Autenticación

Las rutas protegidas requieren un header `Authorization` con el formato:
```
Authorization: Bearer <token>
```

El token se obtiene al hacer login o register.

## 🗄️ Base de Datos

La BD SQLite se crea automáticamente al iniciar el servidor. Incluye las siguientes tablas:
- usuarios
- clientes
- hoteles
- rooms
- bookings
- invoices
- staff

## 📝 Variables de Entorno

```
PORT=5000
DATABASE_PATH=./data/vinihotel.db
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 🧪 Testing

Para hacer requests a la API, puedes usar:
- Postman
- Insomnia
- cURL
- Cliente HTTP de VS Code

Ejemplo con cURL:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","contrasena":"password123"}'
```

## 📚 Notas

- Cambiar `JWT_SECRET` en producción
- Las contraseñas se hashean con bcrypt
- CORS está configurado para localhost:5173 (frontend Vite)
- Las rutas protegidas requieren token JWT válido
