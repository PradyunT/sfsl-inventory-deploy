import { model, Schema, SchemaTypes } from 'mongoose'

const ItemSchema = new Schema({
  itemNo: {
    type: SchemaTypes.String,
    required: true,
    immutable: true,
  },
  itemName: {
    type: SchemaTypes.String,
    required: true,
  },
  unit: {
    type: SchemaTypes.String,
    required: true,
    immutable: true,
  },
  grossUnitWeight: {
    type: SchemaTypes.Number,
    required: true,
    immutable: true,
  },
  lastRestockQuantity: {
    type: SchemaTypes.Number,
  },
  currentQuantity: {
    type: SchemaTypes.Number,
    required: true,
  },
  lastRestockDate: {
    type: SchemaTypes.Date,
  },
  category: {
    type: SchemaTypes.String,
    required: true,
    immutable: true,
  },
  history: [{ type: SchemaTypes.ObjectId, ref: 'Purchase' }],
})

const Item = model('item', ItemSchema)

export default Item
