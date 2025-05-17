// controllers/neighbor.controller.js
import Neighbor from 'models/neighborV2.model'
import to from 'await-to-js'

// GET /neighbors - Get all neighbors
export const getNeighbors = async (req, res) => {
  const { gender, age, zipcode } = req.query

  const filter = {}
  if (gender) filter.gender = gender
  if (age) filter.age = Number(age)
  if (zipcode) filter.zipcode = zipcode

  const [error, neighbors] = await to(
    Neighbor.find(filter).select('name dob age gender zipcode').lean()
  )

  if (error) {
    return res.status(500).send({ error: 'Error retrieving neighbors' })
  }

  return res.json({ neighbors })
}

// GET /neighbors/:id - Get a single neighbor by ID
export const getNeighbor = async (req, res) => {
  const { id } = req.params
  const [error, neighbor] = await to(
    Neighbor.findById(id).select('name dob age gender zipcode').lean()
  )
  if (error) {
    return res.status(500).send({ error: 'Error retrieving neighbor' })
  }
  if (!neighbor) {
    return res.status(500).send({ error: 'Neighbor not found' })
  }
  return res.json({ neighbor })
}

// POST /neighbors - Create a new neighbor
export const createNeighbor = async (req, res) => {
  const { name, dob, age, gender, zipcode } = req.body

  if (!name || !dob || !age || !gender || !zipcode) {
    return res.status(400).send({ error: 'Missing fields' })
  }

  const [error, neighbor] = await to(
    Neighbor.create({
      name,
      dob,
      age,
      gender,
      zipcode,
      history: [],
    })
  )
  if (error) {
    return res.status(500).send({ error: 'Error creating neighbor' })
  }
  return res.json({ neighbor })
}

// DELETE /neighbors/:id - Delete a neighbor by ID
export const deleteNeighbor = async (req, res) => {
  const { id } = req.params
  const [error, neighbor] = await to(Neighbor.findByIdAndDelete(id).lean())
  if (error) {
    return res.status(500).send({ error: 'Error retrieving neighbor' })
  }
  if (!neighbor) {
    return res.status(404).send({ error: 'Neighbor not found' })
  }
  return res.json({ neighbor })
}
