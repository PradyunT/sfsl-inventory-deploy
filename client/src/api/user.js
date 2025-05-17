import axios from 'axios'

const UserClient = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api/user`,
  timeout: 1000,
})

export const getUser = ({ id }) => UserClient.get(`/${id}`)

export const getUsers = () => UserClient.get()

export const createUser = ({ firstName, lastName }) =>
  UserClient.post('/', {
    firstName,
    lastName,
  })

export const updateUser = ({ id, firstName, lastName }) =>
  UserClient.patch(`/${id}`, {
    firstName,
    lastName,
  })

export const deleteUser = ({ id }) => UserClient.delete(`/${id}`)
