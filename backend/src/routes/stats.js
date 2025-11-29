const express = require('express')
const { PrismaClient } = require('@prisma/client')
const router = express.Router()
const prisma = new PrismaClient()

// GET /api/stats - Get general statistics
router.get('/', async (req, res) => {
  try {
    // 1. Comercios en lista de espera
    const waitlistCount = await prisma.waitlist.count()
    
    // 2. Facturación total en espera
    const totalBilling = await prisma.waitlist.aggregate({
      _sum: {
        monthlyBillingUsd: true
      }
    })
    const totalBillingUsd = totalBilling._sum.monthlyBillingUsd || 0

    res.json({
      waitlist_count: waitlistCount,
      total_billing_usd: totalBillingUsd
    })

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error)
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las estadísticas'
    })
  }
})

module.exports = router

