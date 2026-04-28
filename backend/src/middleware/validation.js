import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
  body('apellido').trim().notEmpty().withMessage('Apellido es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('contrasena').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('contrasena').notEmpty().withMessage('Contraseña requerida'),
];

export const validateHotel = [
  body('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
  body('description').trim().notEmpty().withMessage('Descripción es requerida'),
  body('location').trim().notEmpty().withMessage('Ubicación es requerida'),
  body('rating').isFloat({ min: 0, max: 5 }).withMessage('Rating debe estar entre 0 y 5'),
];

export const validateRoom = [
  body('name').trim().notEmpty().withMessage('Nombre es requerido'),
  body('type').trim().notEmpty().withMessage('Tipo es requerido'),
  body('price').isFloat({ min: 0 }).withMessage('Precio debe ser positivo'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacidad debe ser mayor a 0'),
];

export const validateBooking = [
  body('checkIn').isISO8601().withMessage('CheckIn inválido'),
  body('checkOut').isISO8601().withMessage('CheckOut inválido'),
  body('guests').isInt({ min: 1 }).withMessage('Guests debe ser mayor a 0'),
];

export function validationMiddleware(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}
