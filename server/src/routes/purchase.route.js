import { Router } from 'express'
import {
  createPurchase,
  deletePurchase,
  getPurchase,
  getPurchases,
  getPurchasesByItemId,
} from 'controllers/purchase.controller'

const purchaseRouter = Router()

purchaseRouter.get('/', getPurchases)
purchaseRouter.get('/:id', getPurchase)
purchaseRouter.post('/', createPurchase)
purchaseRouter.delete('/:id', deletePurchase)
purchaseRouter.get('/item/:itemId', getPurchasesByItemId)

export default purchaseRouter
