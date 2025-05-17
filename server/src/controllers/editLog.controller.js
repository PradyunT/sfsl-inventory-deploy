// Import necessary models
import to from 'await-to-js'
import EditLog from 'models/editLog.model'
import Item from '../models/item.model';

// GET /editLog - Get all edit logs
export const getEditLogs = async (req, res) => {
  const [error, editLogs] = await to(EditLog.find({}).lean())
  if (error) return res.status(500).send({ error })
  return res.json({ editLogs })
}

// GET /editLog/:id - Get a single edit log by ID
export const getEditLog = async (req, res) => {
  const { id } = req.params
  const [error, editLog] = await to(EditLog.findById(id).lean())
  if (error) return res.status(500).send({ error })
  if (!editLog) return res.status(404).send({ error: 'Edit log not found' })
  return res.json({ editLog })
}

// POST /editLog - Create a new edit log - Updated
export const createEditLog = async (req, res) => {
  const {
    purchaseDate,
    editor,
    restock,
    newItem,
    itemId, // Get the itemId instead of prevItem
  } = req.body

  // Validate required fields
  if (
    !purchaseDate ||
    !editor ||
    restock === undefined ||
    !newItem ||
    !newItem.name ||
    newItem.currentQuantity === undefined ||
    !itemId // Validate itemId is provided
  ) {
    return res.status(400).send({ error: 'Missing required fields' })
  }

  // First, fetch the original item from the database
  const [itemError, originalItem] = await to(Item.findById(itemId).lean())

  if (itemError) {
    return res.status(500).send({ error: 'Failed to fetch the original item' })
  }

  if (!originalItem) {
    return res.status(404).send({ error: 'Original item not found' })
  }

  // Construct the prevItem from the original item
  const prevItem = {
    name: originalItem.itemName,
    currentQuantity: originalItem.currentQuantity,
  }

  // Now create the edit log with the fetched prevItem
  const [error, editLog] = await to(
    EditLog.create({
      purchaseDate,
      editor,
      restock,
      prevItem,
      newItem,
    })
  )

  if (error) return res.status(500).send({ error })
  return res.json({ editLog })
}

// DELETE /editLog/:id - Delete an edit log by ID
export const deleteEditLog = async (req, res) => {
  const { id } = req.params
  const [error, editLog] = await to(EditLog.findByIdAndDelete(id).lean())
  if (error) return res.status(500).send({ error })
  if (!editLog) return res.status(404).send({ error: 'Edit log not found' })
  return res.json({ editLog })
}
