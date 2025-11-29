const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { authenticateHybrid } = require('../middleware/clerkAuth');

const router = express.Router();

// Registro de usuario
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('phone').optional().isMobilePhone()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Por favor, verifica los datos ingresados',
        details: errors.array()
      });
    }

    const { email, password, name, phone } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Usuario ya existe',
        message: 'Ya existe una cuenta con este email',
        code: 'USER_EXISTS'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario con rol MERCHANT por defecto
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: 'MERCHANT', // Asegurar que sea MERCHANT
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
});

// Login de usuario
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Por favor, verifica los datos ingresados',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Obtener perfil del usuario autenticado (soporta Clerk y JWT)
router.get('/profile', authenticateHybrid, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        walletAddress: true,
        walletCreatedAt: true,
        clerkId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario no existe'
      });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Actualizar perfil (soporta Clerk y JWT)
router.put('/profile', authenticateHybrid, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('phone').optional().isMobilePhone()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Por favor, verifica los datos ingresados',
        details: errors.array()
      });
    }

    const { name, phone } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        walletAddress: true,
        walletCreatedAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Perfil actualizado exitosamente',
      user
    });
  } catch (error) {
    next(error);
  }
});

// Crear wallet automáticamente para el usuario
router.post('/create-wallet', authenticateHybrid, async (req, res, next) => {
  try {
    const WalletService = require('../services/walletService');
    
    // Verificar si el usuario ya tiene wallet
    const existingUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        walletAddress: true,
        walletCreatedAt: true
      }
    });

    if (existingUser?.walletAddress) {
      return res.status(400).json({
        error: 'Wallet ya existe',
        message: 'El usuario ya tiene una wallet creada',
        user: existingUser
      });
    }

    // Generar nueva wallet
    const walletData = WalletService.generateWallet();
    
    // Guardar wallet en la base de datos
    const user = await WalletService.saveWallet(req.user.id, walletData);

    console.log('✅ Wallet creada automáticamente para usuario:', user.email);

    res.json({
      message: 'Wallet creada exitosamente',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        walletAddress: user.walletAddress,
        walletCreatedAt: user.walletCreatedAt
      }
    });
  } catch (error) {
    console.error('Error creando wallet:', error);
    next(error);
  }
});

// Actualizar wallet del usuario
router.post('/update-wallet', authenticateHybrid, [
  body('walletAddress').notEmpty().isLength({ min: 20 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Por favor, verifica los datos ingresados',
        details: errors.array()
      });
    }

    const { walletAddress } = req.body;

    // Actualizar wallet del usuario
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { walletAddress },
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Wallet actualizada exitosamente',
      user
    });
  } catch (error) {
    next(error);
  }
});

// Cambiar contraseña
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Por favor, verifica los datos ingresados',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Obtener usuario con contraseña
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(400).json({
        error: 'Contraseña incorrecta',
        message: 'La contraseña actual no es correcta',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Encriptar nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
