import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Blog from './components/Blog'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import blogService from './services/blogs'
import { login, setUser, logoutUser } from './reducers/userReducer'
import { setNotification } from './reducers/notificationReducer'
import {
  createBlog,
  likeBlogPost,
  initializeBlogs,
  removeBlogPost,
} from './reducers/blogReducer'

const Notification = () => {
  const message = useSelector((state) => state.notification)
  if (message === null) {
    return null
  }

  return <div className={message.status}>{message.string}</div>
}

const App = () => {
  const dispatch = useDispatch()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const user = useSelector((state) => state.user)
  const blogs = useSelector((state) => state.blog)
  const allBlogs = [...blogs]

  useEffect(() => {
    dispatch(initializeBlogs())
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('blogUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      dispatch(setUser(user))
      blogService.setToken(user.token)
    }
  }, [])

  const toggleRef = useRef()

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      dispatch(login({ username, password }))
      setUsername('')
      setPassword('')
    } catch (exception) {
      setUsername('')
      setPassword('')
      dispatch(
        setNotification(
          { string: 'Wrong username or password', status: 'error' },
          5
        )
      )
    }
  }
  const handleLogOut = () => {
    dispatch(
      setNotification(
        { string: `${user.name} logged out`, status: 'success' },
        5
      )
    )
    window.localStorage.removeItem('blogUser')
    dispatch(logoutUser(null))
    setUsername('')
    setPassword('')
  }

  const addBlog = async (blogData) => {
    try {
      blogData['user'] = user
      dispatch(createBlog(blogData))
      dispatch(initializeBlogs())
      toggleRef.current.toggleVisibility()
      dispatch(
        setNotification(
          {
            string: `Added ${blogData.title} by ${blogData.author} to the list`,
            status: 'success',
          },
          5
        )
      )
    } catch (error) {
      dispatch(
        setNotification({ string: `${error.message}`, status: 'error' }, 5)
      )
    }
  }

  const updateBlog = async (blogData) => {
    try {
      dispatch(likeBlogPost(blogData))
    } catch (error) {
      dispatch(
        setNotification({ string: `${error.message}`, status: 'error' }, 5)
      )
    }
  }

  const deleteBlog = async (blogData) => {
    try {
      if (window.confirm(`remove blog ${blogData.title}`)) {
        const updatedBlogList = blogs.filter((item) => item.id !== blogData.id)
        dispatch(removeBlogPost(blogData, updatedBlogList))
      }
    } catch (error) {
      dispatch(
        setNotification({ string: `${error.message}`, status: 'error' }, 5)
      )
    }
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification />
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              id="username"
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              id="password"
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit" id="loginButton">
            login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification />
      <p>{user.name} is logged in</p>
      <button onClick={handleLogOut}>Logout</button>

      <Togglable buttonLabel="Create new blog" ref={toggleRef}>
        Create new
        <BlogForm createBlog={addBlog} />
      </Togglable>
      {allBlogs
        .sort((a, b) => b.likes - a.likes)
        .map((blog) => (
          <Blog
            key={blog.id}
            blog={blog}
            updateBlog={updateBlog}
            deleteBlog={deleteBlog}
            user={user}
          />
        ))}
    </div>
  )
}

export default App
