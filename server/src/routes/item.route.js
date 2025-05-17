import { Router } from 'express'
import {
  createItem,
  deleteItem,
  getAvailableItems,
  getItem,
  getItems,
  reduceQuantities,
  updateItem,
  updateCategory,
  deleteAll
} from 'controllers/item.controller'

const itemRouter = Router()

itemRouter.get('/', getItems)
itemRouter.get('/available', getAvailableItems)
itemRouter.get('/:id', getItem)
itemRouter.post('/', createItem)
itemRouter.delete('/deleteall', deleteAll)
itemRouter.delete('/:id', deleteItem)
itemRouter.put('/category/:id', updateCategory)
itemRouter.put('/order', reduceQuantities)
itemRouter.patch('/:id', updateItem)

export default itemRouter
