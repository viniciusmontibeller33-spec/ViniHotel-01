import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as userModel from '../models/userModel.js';
import * as clienteModel from '../models/clienteModel.js';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { validateRegister, validateLogin, validationMiddleware } from '../middleware/validation.js';

const router = express.Router();

// Registro
router.post('/register', validateRegister, validationMiddleware, async (req, res) => {
  try {
    const { nombre, apellido, email, contrasena, phone, address, dateOfBirth, nationality, documentId } = req.body;

    // Verificar si el usuario ya existe
    const exisUser = await userModel.getUserByEmail(email);
    if (exisUser) {
      return res.status(400).json({ error: 'Email ya está registrado' });
    }

    // Crear usuario
    const idUsuario = await userModel.createUser({
      nombre,
      apellido,
      email,
      contrasena,
      rol: 'client',
      phone,
      address,
      dateOfBirth,
      nationality,
      documentId
    });

    // Crear cliente
    await clienteModel.createCliente(idUsuario, phone, documentId);

    // Generar token
    const token = generateToken(idUsuario, 'client');

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: { idUsuario, nombre, apellido, email, rol: 'client' }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', validateLogin, validationMiddleware, async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const passwordMatch = await userModel.verifyPassword(contrasena, user.contrasena);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const token = generateToken(user.idUsuario, user.rol);

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        idUsuario: user.idUsuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Obtener perfil del usuario
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await userModel.getUserById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      idUsuario: user.idUsuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
      phone: user.phone,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      nationality: user.nationality,
      documentId: user.documentId
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Actualizar perfil
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { nombre, apellido, phone, address, dateOfBirth, nationality, documentId } = req.body;

    const updated = await userModel.updateUser(decoded.userId, {
      nombre,
      apellido,
      phone,
      address,
      dateOfBirth,
      nationality,
      documentId
    });

    if (!updated) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Perfil actualizado exitosamente' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

// Obtener todos los usuarios (admin)
router.get('/', async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

export default router;
