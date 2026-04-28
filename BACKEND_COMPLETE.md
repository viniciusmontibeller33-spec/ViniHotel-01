# ✅ ViniHotel Backend - Completado

## 📊 Resumen de lo Creado

He creado un **Backend Node.js + Express con SQLite** completamente funcional para tu aplicación ViniHotel.

---

## 📁 Estructura del Backend

```
ViniHotel-main/
├── backend/                          ← NUEVO
│   ├── src/
│   │   ├── models/                  ← Modelos BD (7 archivos)
│   │   │   ├── userModel.js         [Gestión usuarios + bcrypt]
│   │   │   ├── clienteModel.js      [Clientes]
│   │   │   ├── hotelModel.js        [Hoteles]
│   │   │   ├── roomModel.js         [Habitaciones + disponibilidad]
│   │   │   ├── bookingModel.js      [Reservas]
│   │   │   ├── invoiceModel.js      [Facturas]
│   │   │   └── staffModel.js        [Personal]
│   │   ├── routes/                  ← APIs REST (5 archivos)
│   │   │   ├── auth.js              [Login, register, perfil]
│   │   │   ├── hotels.js            [CRUD hoteles]
│   │   │   ├── rooms.js             [CRUD habitaciones]
│   │   │   ├── bookings.js          [CRUD reservas]
│   │   │   └── invoices.js          [CRUD facturas]
│   │   ├── middleware/              ← Seguridad (2 archivos)
│   │   │   ├── auth.js              [JWT, roles]
│   │   │   └── validation.js        [Validación campos]
│   │   ├── utils/
│   │   │   ├── database.js          [SQLite + tablas auto-creadas]
│   │   │   └── sampleData.js        [3 hoteles + 4 habitaciones]
│   │   └── server.js                [Express principal]
│   ├── data/
│   │   └── vinihotel.db             [BD SQLite - auto-creada]
│   ├── package.json                 [Dependencias]
│   ├── .env                         [Config (PORT, JWT_SECRET, etc)]
│   ├── .gitignore                   [Ignorar node_modules]
│   └── README.md                    [Docs técnico backend]
│
├── src/
│   └── utils/
│       └── apiClient.ts             ← NUEVO: Cliente HTTP frontend
│
├── QUICKSTART.md                    ← NUEVO: Guía rápida
├── BACKEND_SETUP.md                 ← NUEVO: Setup paso a paso
├── INTEGRATION_GUIDE.md             ← NUEVO: Integración React
├── EXAMPLES.md                      ← NUEVO: Ejemplos componentes
└── README.md                        [Original proyecto]
```

---

## 🎯 Qué Incluye

### ✅ Base de Datos (SQLite)

**7 Tablas creadas automáticamente:**
- `usuarios` - Email, contraseña (hasheada con bcrypt), rol
- `clientes` - Info adicional clientes
- `hoteles` - Hoteles con amenidades
- `rooms` - Habitaciones con precios
- `bookings` - Reservas con validación de disponibilidad
- `invoices` - Facturas con impuestos
- `staff` - Personal hotelero

### ✅ APIs REST (30+ Endpoints)

| Recurso | GET | POST | PUT | DELETE |
|---------|-----|------|-----|--------|
| Auth | ✅ /me | ✅ login, register | ✅ profile | ❌ |
| Hotels | ✅ list, detail | ✅ admin | ✅ admin | ✅ admin |
| Rooms | ✅ list, detail, by-hotel | ✅ admin | ✅ admin | ✅ admin |
| Bookings | ✅ my-list, detail | ✅ create | ✅ update | ✅ cancel |
| Invoices | ✅ my-list, detail | ✅ create | ✅ update | ❌ |

### ✅ Seguridad

- **JWT Tokens** (7 días, auto-renovables)
- **bcryptjs** (contraseñas hasheadas)
- **Roles**: client, staff, admin
- **CORS** habilitado para port 5173
- **Validación** de campos en todas las rutas

### ✅ Cliente HTTP (Frontend)

- Clase `ApiClient` en `src/utils/apiClient.ts`
- Gestión automática de tokens
- Métodos para todos los endpoints
- Manejo de errores 401

### ✅ Documentación

1. **QUICKSTART.md** - Inicia en 3 pasos
2. **BACKEND_SETUP.md** - Setup detallado
3. **INTEGRATION_GUIDE.md** - Conectar React con backend
4. **EXAMPLES.md** - 6 componentes listos para copiar
5. **backend/README.md** - Referencia técnica

---

## 🚀 Cómo Usar (3 pasos)

### 1️⃣ Instalar Backend

```bash
cd backend
npm install
```

### 2️⃣ Ejecutar Backend

```bash
npm run dev
```

Verás:
```
✅ Base de datos inicializada correctamente
✅ Servidor corriendo en http://localhost:5000
🔌 CORS habilitado para: http://localhost:5173
```

### 3️⃣ Ejecutar Frontend

```bash
npm run dev
```

Backend: http://localhost:5000 ✅
Frontend: http://localhost:5173 ✅

---

## 🧪 Testing

**Credenciales de prueba:**
```
Email: juan@example.com
Contraseña: password123

Email: maria@example.com
Contraseña: password123

Email: admin@example.com
Contraseña: admin123 (admin)
```

**Datos precargados:**
- 3 hoteles (5 estrellas, playa, montaña)
- 4 habitaciones variadas
- Amenidades realistas (WiFi, Piscina, etc)

---

## 📡 API Endpoints Principales

```
POST   /api/auth/register           Registrarse
POST   /api/auth/login              Iniciar sesión
GET    /api/auth/me                 Obtener perfil
PUT    /api/auth/profile            Actualizar perfil

GET    /api/hotels                  Listar hoteles
GET    /api/hotels/:id              Detalle hotel
POST   /api/hotels                  Crear (admin)
PUT    /api/hotels/:id              Editar (admin)
DELETE /api/hotels/:id              Eliminar (admin)

GET    /api/rooms                   Listar habitaciones
GET    /api/rooms/hotel/:id         Por hotel
POST   /api/rooms/check-availability Verificar disponibilidad

POST   /api/bookings                Crear reserva
GET    /api/bookings/my-bookings    Mis reservas
PUT    /api/bookings/:id            Actualizar
POST   /api/bookings/:id/cancel     Cancelar

POST   /api/invoices                Crear factura
GET    /api/invoices/my-invoices    Mis facturas
PUT    /api/invoices/:id            Actualizar
```

---

## 🔐 Autenticación

**Flow automático:**
1. Usuario se registra/login
2. Backend devuelve JWT token
3. Frontend guarda en localStorage
4. ApiClient incluye token en headers automáticamente
5. Errores 401 redirigen a login

---

## 📝 Tecnologías

**Backend:**
- Express.js (servidor)
- SQLite3 (base de datos)
- JWT (autenticación)
- bcryptjs (hash contraseñas)
- express-validator (validación)
- CORS (frontend-backend)
- UUID (IDs únicos)

**Frontend:**
- React 18+ TypeScript
- Vite
- React Router
- Tailwind CSS
- Radix UI

---

## 🛠️ Archivos Generados

### Backend (18 archivos nuevos)
- `backend/src/models/` - 7 modelos CRUD
- `backend/src/routes/` - 5 rutas API
- `backend/src/middleware/` - 2 middlewares
- `backend/src/utils/` - database.js + sampleData.js
- `backend/src/server.js` - Express principal
- `backend/package.json` - Dependencias
- `backend/.env` - Configuración
- `backend/README.md` - Documentación

### Frontend (1 archivo nuevo)
- `src/utils/apiClient.ts` - Cliente HTTP

### Documentación (4 archivos)
- `QUICKSTART.md`
- `BACKEND_SETUP.md`
- `INTEGRATION_GUIDE.md`
- `EXAMPLES.md`

---

## ✨ Características Implementadas

✅ Registro y login seguro
✅ Validación de emails únicos
✅ Contraseñas hasheadas con bcrypt
✅ Tokens JWT de 7 días
✅ Roles (client, staff, admin)
✅ CRUD completo para todas las tablas
✅ Verificación de disponibilidad de habitaciones
✅ Cálculo automático de precios
✅ Generación de facturas
✅ Manejo de errores global
✅ Validación de campos
✅ CORS configurado
✅ Datos de prueba precargados

---

## 🎯 Próximos Pasos (Opcional)

1. **Integrar contextos React** - Usar INTEGRATION_GUIDE.md
2. **Copiar componentes** - Ver EXAMPLES.md
3. **Conectar páginas** - Reemplazar mock data con apiClient
4. **Testing** - Probar endpoints con Postman/Insomnia
5. **Producción** - Cambiar JWT_SECRET y usar PostgreSQL

---

## 📚 Documentación

- **Quick Start:** Abre `QUICKSTART.md`
- **Setup Detallado:** Abre `BACKEND_SETUP.md`
- **Integración React:** Abre `INTEGRATION_GUIDE.md`
- **Ejemplos código:** Abre `EXAMPLES.md`
- **Referencia técnica:** Abre `backend/README.md`

---

## 🚨 Importante

```⚠️ No subir .env a Git (está en .gitignore)
⚠️ Cambiar JWT_SECRET en producción
⚠️ Usar HTTPS en producción (no HTTP)
⚠️ Validar siempre en el backend
⚠️ Backend debe correr ANTES que frontend
```

---

## ✅ Todo Listo!

Tu backend está **completamente funcional** y listo para:

✅ Registrar/login usuarios
✅ Listar hoteles y habitaciones
✅ Crear reservas con validación
✅ Generar facturas
✅ Gestionar datos
✅ Conectar con React

**¿Requieres algo más?**
- Agregar más modelos: Fácil, sigue el patrón
- Integrar servicios de pago: Strapi, PayPal, etc
- Deploy: Vercel (frontend) + Heroku/Railway (backend)
- Tests: Jest + Supertest

---

**¡Felicidades! Tu aplicación ViniHotel está lista para desarrollar!** 🎉

Happy coding! 🚀
