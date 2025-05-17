import Purchase from 'models/purchase.model'
import to from 'await-to-js'
import Item from 'models/item.model'
import Neighbor from 'models/neighbor.model'
import NeighborV2 from 'models/neighborV2.model'

// GET /purchase - Get all purchases
export const getPurchases = async (req, res) => {
  const [error, purchases] = await to(Purchase.find({}).lean())
  if (error) {
    return res.status(500).send({ error: 'Error retrieving purchases' })
  }
  return res.json({ purchases })
}

export const createPurchase = async (req, res) => {
  const { itemId, quantity, name, dob, age, gender, zipcode } = req.body
  console.log('Purchase POST body NEW:', req.body)
  if (!dob) {
    return res.status(400).json({ error: 'Missing dob (V2)' })
  }

  if (!itemId || !name || !dob || !age || !gender || !zipcode) {
    return res.status(400).json({ error: 'Missing required fields (V2)' })
  }

  const [itemErr, item] = await to(Item.findById(itemId))
  if (itemErr || !item) return res.status(404).json({ error: 'Item not found' })

  if (item.currentQuantity < quantity) {
    return res
      .status(400)
      .json({ error: 'Not enough inventory to complete sale' })
  }

  // Use NeighborV2
  let [neighborErr, neighbor] = await to(
    NeighborV2.findOne({ name: name.trim(), dob: new Date(dob) })
  )

  if (!neighbor) {
    const [createErr, newNeighbor] = await to(
      NeighborV2.create({ name, dob, age, gender, zipcode, history: [] })
    )
    if (createErr)
      return res.status(500).json({ error: 'Error creating neighbor' })
    neighbor = newNeighbor
  }

  const purchaseDate = new Date()
  const purchaseData = {
    ItemsPurchased: [
      {
        Item: item._id,
        itemId: item._id.toString(),
        quantity,
        startQuantity: item.currentQuantity,
      },
    ],
    Neighbor: neighbor._id,
    purchaseDate,
  }

  const [purchaseErr, newPurchase] = await to(Purchase.create(purchaseData))
  if (purchaseErr)
    return res.status(500).json({ error: 'Error creating purchase' })

  item.currentQuantity -= quantity
  await item.save()

  neighbor.history.push(newPurchase._id)
  await neighbor.save()

  return res.status(201).json({ purchase: newPurchase })
}

// GET /purchase/:id - Get a single purchase by ID
export const getPurchase = async (req, res) => {
  const { id } = req.params
  const [error, purchase] = await to(Purchase.findbyId(id).lean())
  if (error) {
    return res.status(500).send({ error: 'Error retrieving purchase' })
  }
  if (!purchase) {
    return res.status(500).send({ error: 'Purchase not found' })
  }
  return res.json({ purchase })
}

// POST /purchase - Create a new purchase
export const createPurchaseWithNeighbor = async (req, res) => {
  const { ItemsPurchased, Neighbor, purchaseDate } = req.body

  if (ItemsPurchased == null || Neighbor == null || purchaseDate == null) {
    return res.status(500).send({ error: 'Missing fields' })
  }

  const [error, purchase] = await to(
    Purchase.create({
      ItemsPurchased,
      Neighbor,
      purchaseDate,
    })
  )
  if (error) {
    return res.status(500).send({ error: 'Error creating purchase' })
  }
  return res.json({ purchase })
}

export const createPurchaseV2 = async (req, res) => {
  console.log('Purchase POST body:', req.body)
  const { itemId, quantity, neighborId } = req.body

  if (!itemId || !neighborId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const [itemErr, item] = await to(Item.findById(itemId))
  if (itemErr || !item) return res.status(404).json({ error: 'Item not found' })

  const [neighborErr, neighbor] = await to(Neighbor.findById(neighborId))
  if (neighborErr || !neighbor)
    return res.status(404).json({ error: 'Neighbor not found' })

  if (item.currentQuantity < quantity) {
    return res
      .status(400)
      .json({ error: 'Not enough inventory to complete sale' })
  }

  const purchaseDate = new Date()
  const newPurchaseData = {
    ItemsPurchased: [
      {
        Item: item._id,
        itemId: item._id.toString(),
        quantity: quantity,
        startQuantity: item.currentQuantity,
      },
    ],
    Neighbor: neighbor._id,
    purchaseDate,
  }

  const [purchaseErr, newPurchase] = await to(Purchase.create(newPurchaseData))
  if (purchaseErr)
    return res.status(500).json({ error: 'Error creating purchase' })

  item.currentQuantity -= quantity
  await item.save()

  neighbor.History.push(newPurchase._id)
  await neighbor.save()

  return res.status(201).json({ purchase: newPurchase })
}

// DELETE /purchase/:id - Delete a purchase by ID
export const deletePurchase = async (req, res) => {
  const { id } = req.params
  const [error, purchase] = await to(Purchase.findbyIdAndDelete(id).lean())
  if (error) {
    return res.status(500).send({ error: 'Error retrieving purchase' })
  }
  if (!purchase) {
    return res.status(500).send({ error: 'Purchase not found' })
  }
  return res.json({ purchase })
}

export const getPurchasesByItemId = async (req, res) => {
  const { itemId } = req.params
  const [error, purchases] = await to(
    Purchase.find({ 'ItemsPurchased.itemId': itemId })
      .sort({ purchaseDate: -1 })
      .lean()
  )

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch purchase history' })
  }

  return res.json({ purchases })
}
