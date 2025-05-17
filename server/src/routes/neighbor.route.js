import { Router } from 'express'
import {
  createNeighbor,
  deleteNeighbor,
  getNeighbor,
  getNeighbors,
} from 'controllers/neighbor.controller'

const neighborRouter = Router()

neighborRouter.get('/', getNeighbors)
neighborRouter.get('/:id', getNeighbor)
neighborRouter.post('/', createNeighbor)
neighborRouter.delete('/:id', deleteNeighbor)

export default neighborRouter
