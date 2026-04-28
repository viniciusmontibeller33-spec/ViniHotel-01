import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as hotelModel from '../models/hotelModel.js';
import { validateHotel, validationMiddleware } from '../middleware/validation.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los hoteles (público)
router.get('/', async (req, res) => {
  try {
    const hotels = await hotelModel.getAllHotels();
    res.json(hotels);
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({ error: 'Error al obtener hoteles' });
  }
});

// Obtener un hotel por ID (público)
router.get('/:idHotel', async (req, res) => {
  try {
    const hotel = await hotelModel.getHotelById(req.params.idHotel);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel no encontrado' });
    }
    res.json(hotel);
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ error: 'Error al obtener hotel' });
  }
});

// Crear un nuevo hotel (admin)
router.post('/', authMiddleware, adminMiddleware, validateHotel, validationMiddleware, async (req, res) => {
  try {
    const { nombre, description, location, image, rating, amenities } = req.body;
    const idHotel = uuidv4();

    await hotelModel.createHotel({
      idHotel,
      nombre,
      description,
      location,
      image,
      rating,
      amenities
    });

    res.status(201).json({
      message: 'Hotel creado exitosamente',
      idHotel
    });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({ error: 'Error al crear hotel' });
  }
});

// Actualizar un hotel (admin)
router.put('/:idHotel', authMiddleware, adminMiddleware, validateHotel, validationMiddleware, async (req, res) => {
  try {
    const { nombre, description, location, image, rating, amenities } = req.body;

    const updated = await hotelModel.updateHotel(req.params.idHotel, {
      nombre,
      description,
      location,
      image,
      rating,
      amenities
    });

    if (!updated) {
      return res.status(404).json({ error: 'Hotel no encontrado' });
    }

    res.json({ message: 'Hotel actualizado exitosamente' });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({ error: 'Error al actualizar hotel' });
  }
});

// Eliminar un hotel (admin)
router.delete('/:idHotel', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deleted = await hotelModel.deleteHotel(req.params.idHotel);
    if (!deleted) {
      return res.status(404).json({ error: 'Hotel no encontrado' });
    }
    res.json({ message: 'Hotel eliminado exitosamente' });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({ error: 'Error al eliminar hotel' });
  }
});

export default router;
