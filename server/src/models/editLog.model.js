import { model, Schema, SchemaTypes } from 'mongoose'

const EditLogSchema = new Schema({
  purchaseDate: { type: SchemaTypes.Date, required: true },
  editor: { type: SchemaTypes.String, required: true },
  restock: { type: SchemaTypes.Boolean, required: true },
  prevItem: {
    name: { type: SchemaTypes.String, required: true },
    currentQuantity: { type: SchemaTypes.Number, required: true },
  },
  newItem: {
    name: { type: SchemaTypes.String, required: true },
    currentQuantity: { type: SchemaTypes.Number, required: true },
  },
})

const EditLog = model('EditLog', EditLogSchema)

export default EditLog
