import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as roomModel from '../models/roomModel.js';
import { validateRoom, validationMiddleware } from '../middleware/validation.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Obtener todas las habitaciones (público)
router.get('/', async (req, res) => {
  try {
    const rooms = await roomModel.getAllRooms();
    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Error al obtener habitaciones' });
  }
});

// Obtener habitaciones por hotel (público)
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const rooms = await roomModel.getRoomsByHotel(req.params.hotelId);
    res.json(rooms);
  } catch (error) {
    console.error('Get rooms by hotel error:', error);
    res.status(500).json({ error: 'Error al obtener habitaciones' });
  }
});

// Obtener una habitación por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const room = await roomModel.getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }
    res.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Error al obtener habitación' });
  }
});

// Crear una nueva habitación (admin)
router.post('/', authMiddleware, adminMiddleware, validateRoom, validationMiddleware, async (req, res) => {
  try {
    const { hotelId, name, type, price, capacity, image, amenities, available, status } = req.body;
    const id = uuidv4();

    await roomModel.createRoom({
      id,
      hotelId,
      name,
      type,
      price,
      capacity,
      image,
      amenities,
      available: available !== undefined ? available : 1,
      status: status || 'available'
    });

    res.status(201).json({
      message: 'Habitación creada exitosamente',
      id
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Error al crear habitación' });
  }
});

// Actualizar una habitación (admin)
router.put('/:id', authMiddleware, adminMiddleware, validateRoom, validationMiddleware, async (req, res) => {
  try {
    const { name, type, price, capacity, image, amenities, available, status } = req.body;

    const updated = await roomModel.updateRoom(req.params.id, {
      name,
      type,
      price,
      capacity,
      image,
      amenities,
      available,
      status
    });

    if (!updated) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }

    res.json({ message: 'Habitación actualizada exitosamente' });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ error: 'Error al actualizar habitación' });
  }
});

// Eliminar una habitación (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deleted = await roomModel.deleteRoom(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Habitación no encontrada' });
    }
    res.json({ message: 'Habitación eliminada exitosamente' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Error al eliminar habitación' });
  }
});

// Verificar disponibilidad
router.post('/check-availability', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'roomId, checkIn y checkOut son requeridos', available: false });
    }

    const availability = await roomModel.checkAvailability(roomId, checkIn, checkOut, guests);
    res.json(availability);
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ error: 'Error al verificar disponibilidad', available: false });
  }
});

export default router;
