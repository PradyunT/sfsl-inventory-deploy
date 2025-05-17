// editLog.js - Updated version
import axios from 'axios';

const EditLogClient = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api/editLog`, timeout: 1000,
});

export const getEditLog = ({ id }) => EditLogClient.get(`/${id}`);

export const getEditLogs = () => EditLogClient.get();

// Modified to only send newItem details
export const createEditLog = ({ purchaseDate, editor, restock, newItem, itemId, }) => EditLogClient.post('/', {
  purchaseDate, editor, restock, newItem, itemId,
});

export const updateEditLog = ({ _id: id, purchaseDate, editor, restock, newItems, }) => EditLogClient.patch(`/${id}`, {
  purchaseDate, editor, restock, newItems,
});

export const deleteEditLog = ({ id }) => EditLogClient.delete(`/${id}`);