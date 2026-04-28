import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './utils/database.js';
import { errorMiddleware } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import hotelRoutes from './routes/hotels.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';
import invoiceRoutes from './routes/invoices.js';
import { sampleUsers, sampleHotels, sampleRooms } from './utils/sampleData.js';
import * as userModel from './models/userModel.js';
import * as hotelModel from './models/hotelModel.js';
import * as roomModel from './models/roomModel.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/invoices', invoiceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend running' });
});

// Error middleware
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function loadSampleData() {
  try {
    // Verificar si ya existen usuarios
    const existingUser = await userModel.getUserByEmail('juan@example.com');
    if (existingUser) {
      console.log('📊 Datos de prueba ya cargados');
      return;
    }

    console.log('📊 Cargando datos de prueba...');

    // Cargar usuarios
    for (const user of sampleUsers) {
      await userModel.createUser(user);
    }
    console.log('✅ Usuarios cargados');

    // Cargar hoteles
    for (const hotel of sampleHotels) {
      const hotelWithId = {
        ...hotel,
        idHotel: uuidv4()
      };
      await hotelModel.createHotel(hotelWithId);
    }
    console.log('✅ Hoteles cargados');

    // Cargar habitaciones (necesitamos los IDs de hoteles reales)
    const hotels = await hotelModel.getAllHotels();
    if (hotels.length > 0) {
      for (let i = 0; i < sampleRooms.length; i++) {
        const roomData = {
          ...sampleRooms[i],
          id: uuidv4(),
          hotelId: hotels[i % hotels.length].idHotel
        };
        await roomModel.createRoom(roomData);
      }
      console.log('✅ Habitaciones cargadas');
    }

  } catch (error) {
    console.error('⚠️ Error al cargar datos de prueba:', error.message);
  }
}

async function startServer() {
  try {
    await initializeDatabase();
    await loadSampleData();
    
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
      console.log(`🔌 CORS habilitado para: ${CORS_ORIGIN}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

export default app;
