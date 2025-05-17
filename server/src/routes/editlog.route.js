import { Router } from 'express'
import {
  getEditLogs,
  getEditLog,
  createEditLog,
  deleteEditLog,
  updateEditLog,
} from '../controllers/editLog.controller.js'

const editLogRouter = Router()

editLogRouter.get('/', getEditLogs)
editLogRouter.get('/:id', getEditLog)
editLogRouter.post('/', createEditLog)
editLogRouter.delete('/:id', deleteEditLog)

export default editLogRouter
