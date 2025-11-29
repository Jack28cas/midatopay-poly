// Wallet Routes - API para manejar wallets
const express = require('express');
const WalletService = require('../services/walletService');
const router = express.Router();

// Middleware para verificar autenticación (simplificado)
const requireAuth = (req, res, next) => {
  // En producción, verificar JWT token
  const userId = req.headers['user-id'] || req.body.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }
  req.userId = userId;
  next();
};

// Guardar wallet
router.post('/save', requireAuth, async (req, res) => {
  try {
    const { walletData } = req.body;
    
    if (!walletData || !walletData.address || !walletData.privateKey) {
      return res.status(400).json({ error: 'Datos de wallet incompletos' });
    }

    const user = await WalletService.saveWallet(req.userId, walletData);
    
    res.json({
      success: true,
      message: 'Wallet guardada correctamente',
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('Error guardando wallet:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener wallet
router.get('/get', requireAuth, async (req, res) => {
  try {
    const wallet = await WalletService.getWallet(req.userId);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet no encontrada' });
    }

    res.json({
      success: true,
      wallet: {
        id: wallet.id,
        email: wallet.email,
        address: wallet.address,
        publicKey: wallet.publicKey,
        createdAt: wallet.createdAt
        // No enviar privateKey por seguridad
      }
    });
  } catch (error) {
    console.error('Error obteniendo wallet:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar si tiene wallet
router.get('/has-wallet', requireAuth, async (req, res) => {
  try {
    const hasWallet = await WalletService.hasWallet(req.userId);
    
    res.json({
      success: true,
      hasWallet
    });
  } catch (error) {
    console.error('Error verificando wallet:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar wallet
router.delete('/clear', requireAuth, async (req, res) => {
  try {
    await WalletService.clearWallet(req.userId);
    
    res.json({
      success: true,
      message: 'Wallet eliminada correctamente'
    });
  } catch (error) {
    console.error('Error eliminando wallet:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener usuario por email
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await WalletService.getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasWallet: !!user.walletAddress
      }
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear usuario con wallet
router.post('/create-user', async (req, res) => {
  try {
    const { userData, walletData } = req.body;
    
    if (!userData || !walletData) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const user = await WalletService.createUserWithWallet(userData, walletData);
    
    res.json({
      success: true,
      message: 'Usuario creado con wallet',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
