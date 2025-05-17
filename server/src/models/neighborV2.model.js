import { model, Schema, SchemaTypes } from 'mongoose'

const NeighborV2Schema = new Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  zipcode: { type: String, required: true },
  history: [{ type: SchemaTypes.ObjectId, ref: 'Purchase' }],
})

const NeighborV2 = model('NeighborV2', NeighborV2Schema)

export default NeighborV2
