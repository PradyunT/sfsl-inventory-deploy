import { model, Schema, SchemaTypes } from 'mongoose'

const PurchaseSchema = new Schema({
  ItemsPurchased: [
    {
      Item: { type: SchemaTypes.ObjectId, ref: 'Item' },
      itemId: { type: SchemaTypes.String },
      quantity: { type: SchemaTypes.Number },
      startQuantity: { type: SchemaTypes.Number },
    },
  ],
  Neighbor: {
    type: SchemaTypes.ObjectId,
    ref: 'Neighbor',
    required: true,
  },
  purchaseDate: {
    type: SchemaTypes.Date,
    required: true,
  },
})

const Purchase = model('Purchase', PurchaseSchema)

export default Purchase
