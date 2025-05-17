import express from 'express'
import {
  getWeeklyItemTakers,
  getItemsBySeason,
  getGenderDistribution,
  getAgeDistribution,
  predictForecast,
} from '../controllers/reports.controller'

const router = express.Router()

router.get('/items-weekly', getWeeklyItemTakers)
router.get('/items-by-season', getItemsBySeason)
router.get('/gender-distribution', getGenderDistribution)
router.get('/age-distribution', getAgeDistribution)
router.get('/forecast', predictForecast)

export default router
