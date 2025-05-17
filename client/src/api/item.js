import axios from 'axios';

const ItemClient = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api/item`,
  timeout: 1000,
});

export const getItem = ({ id }) => ItemClient.get(`/${id}`);

export const getItems = () => ItemClient.get();

export const getForecast = async () => {
  return axios.get('/api/reports/forecast');
};

export const createItem = async (item) => {
  if (item.itemNo == null) item.itemNo = "ph"
  if (item.unit == null) item.unit = "ph"
  item.lastRestockDate = new Date(item.lastRestockDate)
  item.grossUnitWeight = 0
  item.history = []
  // COMPLIMENTARY ITEMS IS TBD
  item.complimentaryItems = [] 
  const response = await ItemClient.post('/', item)
  return response.data.item
}

export const updateItem = ({
                             _id: id, itemNo, itemName, unit, grossUnitWeight, lastRestockQuantity = null, currentQuantity,
                             lastRestockDate = null, category, history = [], complimentaryItems = [],
                           }) =>
  ItemClient.patch(`/${id}`, {
    itemNo, itemName, unit, grossUnitWeight, lastRestockQuantity, currentQuantity,
    lastRestockDate, category, history, complimentaryItems,
  });
  
export const updateQuantity = async (id, quantityToAdd, oldQuantity) => {
  ItemClient.patch(`/${id}`, {
    currentQuantity: quantityToAdd + oldQuantity,
    lastRestockQuantity: quantityToAdd - oldQuantity
  })
}

export const deleteItem = async ({ id }) => await ItemClient.delete(`/${id}`);

export const deleteItems = async (items) => {
  for (const item of items) {
    await ItemClient.delete(`/${item._id}`)
  }
}