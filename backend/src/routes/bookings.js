import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as bookingModel from '../models/bookingModel.js';
import * as clienteModel from '../models/clienteModel.js';
import * as invoiceModel from '../models/invoiceModel.js';
import * as roomModel from '../models/roomModel.js';
import { validateBooking, validationMiddleware } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Obtener todas las reservas del cliente
router.get('/my-bookings', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const cliente = await clienteModel.getClienteByUsuario(decoded.userId);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const bookings = await bookingModel.getBookingsByCliente(cliente.idCliente);
    res.json(bookings);
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// Obtener una reserva por ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await bookingModel.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Error al obtener reserva' });
  }
});

// Crear una nueva reserva
router.post('/', authMiddleware, validateBooking, validationMiddleware, async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, paymentMethod, paymentStatus = 'pending' } = req.body;

    // Verificar que el cliente existe
    const cliente = await clienteModel.getClienteByUsuario(req.userId);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Verificar disponibilidad con validaciones completas
    const availabilityCheck = await roomModel.checkAvailability(roomId, checkIn, checkOut, guests);
    if (!availabilityCheck.available) {
      return res.status(400).json({ error: availabilityCheck.reason });
    }

    const id = uuidv4();

    // Calcular precio total (esto debería venir del frontend con el cálculo correcto)
    let totalPrice = req.body.totalPrice || 0;

    await bookingModel.createBooking({
      id,
      roomId,
      idCliente: cliente.idCliente,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      paymentMethod,
      status: 'confirmed',
      paymentStatus
    });

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      id
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
});

// Actualizar estatus de reserva
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const updated = await bookingModel.updateBooking(req.params.id, {
      status,
      paymentStatus
    });

    if (!updated) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json({ message: 'Reserva actualizada exitosamente' });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Error al actualizar reserva' });
  }
});

// Cancelar reserva
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const cancelled = await bookingModel.cancelBooking(req.params.id);
    if (!cancelled) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    res.json({ message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Error al cancelar reserva' });
  }
});

// Obtener todas las reservas (admin/staff)
router.get('/', async (req, res) => {
  try {
    const bookings = await bookingModel.getAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

export default router;
