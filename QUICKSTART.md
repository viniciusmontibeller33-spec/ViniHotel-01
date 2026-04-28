## ⚡ Quick Start - ViniHotel Backend

### 📋 Setup Checklist

- [ ] Tener Node.js 16+ instalado
- [ ] Abrir 2 terminales (una para backend, otra para frontend)
- [ ] Backend: `cd backend && npm install`
- [ ] Backend: `npm run dev`
- [ ] Frontend: `npm run dev` (en la raíz del proyecto)

### 🚀 Resumen Rápido

**Backend Running:** http://localhost:5000 ✅
- Base de datos SQLite auto-creada en `backend/data/vinihotel.db`
- Rutas API en `/api/*`
- CORS habilitado para port 5173

**Frontend Running:** http://localhost:5173 ✅
- React con Vite
- Conectado automáticamente al backend
- Cliente HTTP en `src/utils/apiClient.ts`

---

## 📁 Estructura Archivos Backend

```
backend/
├── src/
│   ├── models/          [Consultas BD SQLite]
│   ├── routes/          [API endpoints]
│   ├── middleware/      [Auth, validación]
│   ├── utils/           [Database, datos prueba]
│   └── server.js        [Express principal]
├── data/
│   └── vinihotel.db     [BD SQLite (auto-creada)]
├── package.json
├── .env
└── README.md
```

---

## 🔌 Endpoints Principales

| Ruta | Método | Auth | Descripción |
|------|--------|------|-------------|
| `/api/auth/login` | POST | ❌ | Iniciar sesión |
| `/api/auth/register` | POST | ❌ | Registrarse |
| `/api/auth/me` | GET | ✅ | Obtener perfil |
| `/api/hotels` | GET | ❌ | Listar hoteles |
| `/api/rooms` | GET | ❌ | Listar habitaciones |
| `/api/bookings` | POST | ✅ | Crear reserva |
| `/api/bookings/my-bookings` | GET | ✅ | Mis reservas |
| `/api/invoices` | POST | ✅ | Crear factura |

---

## 🔐 Autenticación

**Flow:**
1. User registra/login
2. Backend devuelve JWT token (7 días)
3. Frontend guarda en localStorage
4. ApiClient incluye token en cada request

**Header requerido:**
```
Authorization: Bearer <tu_token_aqui>
```

---

## 💾 Base de Datos

**Tablas creadas automáticamente:**
- `usuarios` - Usuarios (email, contraseña hasheada, rol)
- `clientes` - Info clientes
- `hoteles` - Hoteles
- `rooms` - Habitaciones
- `bookings` - Reservas
- `invoices` - Facturas
- `staff` - Personal hotelero

---

## 🧪 Testing Quick Commands

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","contrasena":"password123"}'

# Ver hoteles
curl http://localhost:5000/api/hotels

# Con token (reemplaza TOKEN)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/auth/me
```

---

## 🔧 Troubleshooting

| Problema | Solución |
|----------|----------|
| `npm install` error | `npm cache clean --force` luego reintentar |
| Puerto 5000 ocupado | Cambiar `PORT=5001` en `.env` |
| CORS error | Verificar `CORS_ORIGIN` en `.env` = `http://localhost:5173` |
| BD error | Eliminar `backend/data/vinihotel.db` y reiniciar |
| Token inválido | Limpiar localStorage: F12 → Application → Storage |

---

## 📞 Credenciales de Prueba

```
Email: juan@example.com
Contraseña: password123
Rol: client

Email: maria@example.com
Contraseña: password123
Rol: client

Email: admin@example.com
Contraseña: admin123
Rol: admin
```

---

## 🌐 Arquitectura

```
[Frontend React]
       ↓ (HTTP)
   [Express API]
       ↓ (SQL)
    [SQLite BD]
```

---

## 📚 Documentación

- **Backend detallado:** `backend/README.md`
- **Setup paso a paso:** `BACKEND_SETUP.md`
- **Integración Frontend:** `INTEGRATION_GUIDE.md`

---

## 🎯 Próximos Pasos

1. ✅ Iniciar backend: `npm run dev`
2. ✅ Iniciar frontend: `npm run dev`
3. 📝 Registrarse en la app
4. 📅 Crear una reserva
5. 💰 Generar una factura
6. ⚙️ Conectar contextos React al backend (ver INTEGRATION_GUIDE.md)

---

## ⚠️ Importante

- Backend debe estar corriendo ANTES que el frontend
- Cambiar `JWT_SECRET` en `.env` para producción
- `.env` NO debe subirse a Git (está en .gitignore)
- Las contraseñas se hashean automáticamente con bcrypt
- Para producción: cambiar a MySQL/PostgreSQL

---

**¿Necesitas ayuda?** 
- Revisa `backend/README.md` para errores específicos
- Usa DevTools (F12) para ver requerimientos de red
- Verifica que ambos servidores estén corriendo (`npm run dev`)

Happy coding! 🚀
