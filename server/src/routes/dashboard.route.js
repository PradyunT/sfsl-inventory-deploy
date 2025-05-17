import express from 'express'
import {
  getLowStockItems,
  getPopularItems,
  getTotalUnitsTaken,
  getWeeklyNeighbors,
  getWeeklyVisits,
} from '../controllers/dashboard.controller'

const router = express.Router()

// Define routes
router.get('/weekly-neighbors', getWeeklyNeighbors)
router.get('/popular-items', getPopularItems)
router.get('/low-stock-items', getLowStockItems)
router.get('/weekly-visits', getWeeklyVisits)
router.get('/total-units-taken', getTotalUnitsTaken)

export default router
