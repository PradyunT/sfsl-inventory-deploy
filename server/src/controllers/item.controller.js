import Item from 'models/item.model'
import to from 'await-to-js'

// GET / - Retrieve all items
export const getItems = async (req, res) => {
  const [error, items] = await to(Item.find({}).lean())
  if (error) return res.status(500).send({ error })
  return res.json({ items })
}

// GET /item/:id - Retrieve a single item by id
export const getItem = async (req, res) => {
  const { id } = req.params
  const [error, item] = await to(Item.findById(id).lean())
  if (error) return res.status(500).send({ error })
  if (!item) return res.status(404).send({ error: 'Item not found' })
  return res.json({ item })
}

// POST /item - Create a new item
export const createItem = async (req, res) => {
  const {
    itemNo,
    itemName,
    unit,
    grossUnitWeight,
    lastRestockQuantity,
    currentQuantity,
    lastRestockDate,
    category,
    history,
  } = req.body

  // Validate required fields
  if (
    !itemNo ||
    !itemName ||
    !unit ||
    grossUnitWeight === undefined ||
    currentQuantity === undefined ||
    !category
  ) {
    return res.status(400).send({ error: 'Missing required fields' })
  }

  const [error, item] = await to(
    Item.create({
      itemNo,
      itemName,
      unit,
      grossUnitWeight,
      lastRestockQuantity,
      currentQuantity,
      lastRestockDate,
      category,
      history,
    })
  )
  if (error) return res.status(500).send({ error })
  return res.json({ item })
}

// PUT /item/:id - Update an existing item
export const updateItem = async (req, res) => {
  const { id } = req.params
  const { itemName, lastRestockQuantity, currentQuantity } = req.body

  const updateData = {}
  if (itemName !== undefined) updateData.itemName = itemName
  if (lastRestockQuantity !== undefined)
    updateData.lastRestockQuantity = lastRestockQuantity
  if (currentQuantity !== undefined)
    updateData.currentQuantity = currentQuantity

  const [error, item] = await to(
    Item.findByIdAndUpdate(id, updateData, { new: true }).lean()
  )
  if (error) return res.status(500).send({ error })
  if (!item) return res.status(404).send({ error: 'Item not found' })
  return res.json({ item })
}

// PUT /item/category/:id - Updates the category of an existing item
export const updateCategory = async (req, res) => {
  const { id } = req.params
  const { category } = req.body
  console.log("category", category)

  const updateData = { category }
  console.log("update data", updateData)

  const [error, item] = await to(
    Item.findByIdAndUpdate(id, updateData, { new: true }).lean()
  )
  if (error) return res.status(500).send({ error })
  if (!item) return res.status(404).send({ error: 'Item not found' })
  return res.json({ item })
}

// DELETE /item/:id - Delete an item
export const deleteItem = async (req, res) => {
  const { id } = req.params
  const [error, item] = await to(Item.findByIdAndDelete(id).lean())
  if (error) return res.status(500).send({ error })
  if (!item) return res.status(404).send({ error: 'Item not found' })
  return res.status(200).json({ item })
}

// GET /item/available - Retrieve all items with quantity > 0 -- only returns their id and name as an object { id, name }
export const getAvailableItems = async (req, res) => {
  const [error, items] = await to(Item.find({}).lean())
  if (error) return res.status(500).send({ error })
  const availableItems = items.filter(item => item.currentQuantity > 0).map(item => { return { id: item._id, name: item.itemName } })
  return res.status(200).json({ availableItems })
}

// PUT /item/order - Reduce all items in input by the quantity of that item ordered
export const reduceQuantities = async (req, res) => {
  const { orderList } = req.body
  let itemList = []
  // validate inputs first before updating so that updates don't get made if an error occurs in the middle
  for (let i = 0; i < orderList.length; i++) {
    const { id, orderQuantity } = orderList[i];
    const [error, item] = await to(Item.findById(id).lean())
    if (error) return res.status(500).send({ error })
    if (item.currentQuantity < orderQuantity ) return res.status(400).json({ "error": "bad request. unable to reduce quantity below 0" })
    if (orderQuantity <= 0) return res.status(400).json({"error": "all items must have an order quantity greater than 0"})
    itemList.push({id, orderQuantity})
  }

  let updatedItems = []
  for (let i = 0; i < itemList.length; i++) {
    const item = itemList[i]
    const { id, orderQuantity } = item;
    const [error, newItem] = await to(Item.findByIdAndUpdate(id, { $inc: {currentQuantity: -1 * (orderQuantity)} }, {new: true}).lean())
    if (error) return res.status(500).send({ error }) // theoretically this shouldn't happen
    updatedItems.push({ id, newQuantity: newItem.currentQuantity })
  }
  res.status(200).json({ updatedItems })
}

export const deleteAll = async (req, res) => {
  try {
    await Item.deleteMany({})
    res.status(204).end()
  }
  catch(e) {
    console.error(e)
    res.status(500).json({'error': 'server error'})
  }
}
