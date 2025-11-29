const express = require('express')
const { body, validationResult } = require('express-validator')
const { PrismaClient } = require('@prisma/client')
const router = express.Router()
const prisma = new PrismaClient()

// Validation middleware
const validateWaitlistEntry = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('monthly_billing_usd')
    .toInt()
    .isInt({ min: 500 })
    .withMessage('La facturación mensual debe ser al menos $500 USD')
]

// POST /api/waitlist - Join waitlist
router.post('/', validateWaitlistEntry, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Por favor, verifica los datos ingresados',
        details: errors.array()
      })
    }

    const { email, monthly_billing_usd } = req.body

    // Check if email already exists
    const existingEntry = await prisma.waitlist.findUnique({
      where: { email }
    })

    if (existingEntry) {
      return res.status(409).json({
        error: 'Email ya registrado',
        message: 'Este email ya está en nuestra lista de espera'
      })
    }

    // Create new waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email,
        monthlyBillingUsd: monthly_billing_usd
      }
    })


    res.status(201).json({
      message: 'Te has unido exitosamente a la lista de espera',
      data: {
        id: waitlistEntry.id,
        email: waitlistEntry.email,
        monthly_billing_usd: waitlistEntry.monthlyBillingUsd,
        created_at: waitlistEntry.createdAt
      }
    })

  } catch (error) {
    console.error('❌ Error al crear entrada en lista de espera:', error)
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo procesar la solicitud. Por favor, intenta nuevamente.'
    })
  }
})

// GET /api/waitlist/stats - Get waitlist statistics
router.get('/stats', async (req, res) => {
  try {
    const totalEntries = await prisma.waitlist.count()
    
    const billingStats = await prisma.waitlist.groupBy({
      by: ['monthlyBillingUsd'],
      _count: {
        monthlyBillingUsd: true
      },
      orderBy: {
        monthlyBillingUsd: 'asc'
      }
    })

    const totalBilling = await prisma.waitlist.aggregate({
      _sum: {
        monthlyBillingUsd: true
      }
    })

    const recentEntries = await prisma.waitlist.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        monthlyBillingUsd: true,
        createdAt: true
      }
    })

    res.json({
      total_entries: totalEntries,
      total_billing_usd: totalBilling._sum.monthlyBillingUsd || 0,
      billing_distribution: billingStats,
      recent_entries: recentEntries
    })

  } catch (error) {
    console.error('❌ Error al obtener estadísticas de lista de espera:', error)
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las estadísticas'
    })
  }
})

// GET /api/waitlist - Get all waitlist entries (admin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const entries = await prisma.waitlist.findMany({
      skip,
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    })

    const total = await prisma.waitlist.count()

    res.json({
      entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })

  } catch (error) {
    console.error('❌ Error al obtener entradas de lista de espera:', error)
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las entradas'
    })
  }
})

module.exports = router
