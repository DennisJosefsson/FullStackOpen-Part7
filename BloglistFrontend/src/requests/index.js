import axios from 'axios'

const baseUrl = 'http://localhost:3003/api/blogs'
const usersUrl = 'http://localhost:3003/api/users'

let token = null

export const setToken = (newToken) => {
  token = `Bearer ${newToken}`
}

export const getBlogs = () => axios.get(baseUrl).then((res) => res.data)

export const getUsers = () => axios.get(usersUrl).then((res) => res.data)

export const createBlog = (newBlog) => {
  const config = {
    headers: { Authorization: token },
  }
  const response = axios.post(baseUrl, newBlog, config).then((res) => res.data)
  return response
}

export const updatedBlog = (blogData) =>
  axios.put(`${baseUrl}/${blogData.id}`, blogData).then((res) => res.data)

export const remove = async (blogData) => {
  const config = {
    headers: { Authorization: token },
  }
  const url = `${baseUrl}/${blogData.id}`
  const response = await axios.delete(url, config)
  return response.data
}

export const createComment = (commentObject) => {
  const url = `${baseUrl}/${commentObject.blog.id}/comments`

  const newComment = { comment: commentObject.comment }
  const response = axios.post(url, newComment).then((res) => res.data)
  return response
}

export const getComments = (blog) => {
  const url = `${baseUrl}/${blog.id}/comments`
  const response = axios.get(url).then((res) => res.data)
  return response
}

export default {
  setToken,
  createBlog,
  getBlogs,
  updatedBlog,
  remove,
  getUsers,
  createComment,
  getComments,
}
