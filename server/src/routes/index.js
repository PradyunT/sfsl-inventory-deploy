import { Router } from 'express'
import itemRouter from 'routes/item.route'
import editLogRouter from './editlog.route'
import purchaseRouter from './purchase.route'
import neighborRouter from './neighbor.route'

const rootRouter = Router()

rootRouter.use('/item', itemRouter)
rootRouter.use('/editLog', editLogRouter)
rootRouter.use('/purchase', purchaseRouter)
rootRouter.use('/neighbor', neighborRouter)

export default rootRouter
