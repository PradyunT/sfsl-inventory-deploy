import { model, Schema, SchemaTypes } from 'mongoose'

const NeighborSchema = new Schema(
  {
    Gender: {
      type: SchemaTypes.String,
      required: true,
    },
    Age: {
      type: SchemaTypes.Number,
      required: true,
    },
    Zipcode: {
      type: SchemaTypes.String,
      required: true,
    },
    History: [{ type: SchemaTypes.ObjectId, ref: 'Purchase' }],
  },
  { collection: 'neighbor' }
) // <-- Explicitly set the collection name

const Neighbor = model('Neighbor', NeighborSchema)

export default Neighbor
