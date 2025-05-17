import { Box, Container, Stack, TextField, Typography } from '@mui/material'
import { deleteUser, getUser, getUsers, updateUser, createUser } from '../api/user'
import Button from '../components/Button'
import { useEffect, useState } from 'react'
import to from 'await-to-js'

export default function Axios() {
  const [users, setUsers] = useState([])
  const [user, setUser] = useState()
  const [userId, setUserId] = useState('')
  const [deleteUserId, setDeleteUserId] = useState('')

  // this useEffect will run ONCE on component mount
  // useful for setting initial values
  useEffect(() => {
    getAllUsers()
  }, [])

  const getAllUsers = async () => {
    const [error, res] = await to(getUsers())
    if (error) return

    const { data } = res
    if (data.users) setUsers(data.users)
  }

  const onUserIdChange = (e) => {
    setUserId(e.target.value.trim())
  }

  const onUserFind = async () => {
    const [error, res] = await to(getUser({ id: userId }))
    if (error) {
      setUser(null)
      return
    }

    const { data } = res
    if (data.user) setUser(data.user)
  }

  const onUserDelete = async () => {
    await to(deleteUser({ id: deleteUserId }))
    setDeleteUserId('')
  }

  const onCreateUser = async (e) => {
    e.preventDefault()
    // A much better way is to store each field value in a state
    const firstName = e.target.firstName.value.trim()
    const lastName = e.target.lastName.value.trim()

    await to(createUser({ firstName, lastName }))

    e.target.firstName.value = ''
    e.target.lastName.value = ''
    getAllUsers()
  }

  const onUpdateUser = async (e) => {
    e.preventDefault()
    // A much better way is to store each field value in a state
    const firstName = e.target.firstName.value.trim()
    const lastName = e.target.lastName.value.trim()
    const id = e.target.id.value.trim()

    await to(updateUser({ id, firstName, lastName }))

    e.target.firstName.value = ''
    e.target.lastName.value = ''
    e.target.id.value = ''
    getAllUsers()
  }

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h5">User API Demo with Axios</Typography>

      <Box my={4}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="body1">All users</Typography>
          <Button onClick={getAllUsers}>Refresh</Button>
        </Stack>
        {users.length ? (
          <ul>
            {users.map(({ firstName, lastName, _id }) => (
              <li key={_id}>
                {firstName} {lastName} (id: {_id})
              </li>
            ))}
          </ul>
        ) : (
          <Typography variant="body1">No users currently</Typography>
        )}
      </Box>

      <hr />

      <Box my={4}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <TextField
            label="Search by user id"
            value={userId}
            onChange={onUserIdChange}
            sx={{ width: '300px' }}
          />
          <Button onClick={onUserFind}>Find!</Button>
        </Stack>
        <Typography sx={{ mt: 2 }}>
          {user
            ? `${user?.firstName} ${user?.lastName || ''} (id: ${user?._id})`
            : 'No user found'}
        </Typography>
      </Box>

      <hr />

      <Box my={4} py={3}>
        <Typography>Create a user</Typography>

        <form onSubmit={onCreateUser}>
          <Stack direction="row" alignItems="center" spacing={2} mt={2}>
            <TextField label="First Name" name="firstName" required />
            <TextField label="Last Name" name="lastName" />
            <Button type="submit">Create!</Button>
          </Stack>
        </form>
      </Box>

      <hr />

      <Box my={4} py={3}>
        <Typography>Update a user</Typography>

        <form onSubmit={onUpdateUser}>
          <Stack direction="row" alignItems="center" spacing={2} mt={2}>
            <TextField
              label="User id"
              name="id"
              required
              sx={{ width: '300px' }}
            />
            <TextField label="First Name" name="firstName" />
            <TextField label="Last Name" name="lastName" />
            <Button type="submit">Update!</Button>
          </Stack>
        </form>
      </Box>

      <hr />

      <Box mt={4}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <TextField
            label="Delete by user id"
            value={deleteUserId}
            onChange={(e) => setDeleteUserId(e.target.value.trim())}
            sx={{ width: '300px' }}
          />
          <Button onClick={onUserDelete}>Delete!</Button>
        </Stack>
      </Box>
    </Container>
  )
}
