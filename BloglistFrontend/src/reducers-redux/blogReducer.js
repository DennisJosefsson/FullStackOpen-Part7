import { createSlice } from '@reduxjs/toolkit'
import blogService from '../services/blogs'

const initialState = []

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    likeBlog(state, action) {
      const id = action.payload.id
      const likedBlog = state.find((blog) => blog.id === id)
      const updatedBlog = { ...likedBlog, likes: likedBlog.likes + 1 }
      return state.map((blog) => (blog.id !== id ? blog : updatedBlog))
    },
    appendBlog(state, action) {
      state.push(action.payload)
    },
    setBlogs(state, action) {
      return action.payload
    },
  },
})

export const { likeBlog, appendBlog, setBlogs } = blogSlice.actions

export const initializeBlogs = () => {
  return async (dispatch) => {
    const blogs = await blogService.getAll()
    dispatch(setBlogs(blogs))
  }
}

export const createBlog = (blogData) => {
  return async (dispatch) => {
    const newBlog = await blogService.create(blogData)
    dispatch(appendBlog(newBlog))
  }
}

export const likeBlogPost = (blogData) => {
  return async (dispatch) => {
    await blogService.update(blogData)
    dispatch(likeBlog(blogData))
  }
}

export const removeBlogPost = (blogData, updatedBlogList) => {
  return async (dispatch) => {
    await blogService.remove(blogData)
    dispatch(setBlogs(updatedBlogList))
  }
}

export default blogSlice.reducer
