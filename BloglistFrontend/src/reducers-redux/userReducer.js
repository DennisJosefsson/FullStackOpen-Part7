import { createSlice } from '@reduxjs/toolkit'
import loginService from '../services/login'
import blogService from '../services/blogs'

import { setNotification } from '../reducers/notificationReducer'

const initialState = null

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      return action.payload
    },
    logoutUser(state, action) {
      return action.payload
    },
  },
})

export const { setUser, logoutUser } = userSlice.actions

export const login = ({ username, password }) => {
  return async (dispatch) => {
    try {
      const user = await loginService.login({
        username,
        password,
      })
      window.localStorage.setItem('blogUser', JSON.stringify(user))
      blogService.setToken(user.token)
      dispatch(setUser(user))
      dispatch(
        setNotification(
          { string: `${user.name} logged on`, status: 'success' },
          5
        )
      )
    } catch (error) {
      dispatch(
        setNotification(
          { string: 'Wrong username or password', status: 'error' },
          5
        )
      )
    }
  }
}

export default userSlice.reducer
