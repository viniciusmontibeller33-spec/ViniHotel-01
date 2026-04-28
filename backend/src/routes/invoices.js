import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as invoiceModel from '../models/invoiceModel.js';
import { authMiddleware } from '../middleware/auth.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Obtener facturas del usuario
router.get('/my-invoices', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const invoices = await invoiceModel.getInvoicesByUser(decoded.userId);
    res.json(invoices);
  } catch (error) {
    console.error('Get my invoices error:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

// Obtener una factura por ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await invoiceModel.getInvoiceById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Error al obtener factura' });
  }
});

// Crear una nueva factura
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { bookingId, subtotal, taxes, total, additionalCharges = {}, paymentMethod, paymentStatus = 'pending' } = req.body;
    const id = uuidv4();

    await invoiceModel.createInvoice({
      id,
      bookingId,
      userId: req.userId,
      subtotal,
      taxes,
      total,
      additionalCharges,
      paymentMethod,
      paymentStatus
    });

    res.status(201).json({
      message: 'Factura creada exitosamente',
      id
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Error al crear factura' });
  }
});

// Actualizar factura
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    const updated = await invoiceModel.updateInvoice(req.params.id, {
      paymentStatus,
      paymentMethod
    });

    if (!updated) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    res.json({ message: 'Factura actualizada exitosamente' });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Error al actualizar factura' });
  }
});

// Obtener todas las facturas (admin)
router.get('/', async (req, res) => {
  try {
    const invoices = await invoiceModel.getAllInvoices();
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

export default router;
