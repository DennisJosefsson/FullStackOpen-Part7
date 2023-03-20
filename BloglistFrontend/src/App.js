import { useState, useEffect, useRef, useContext } from 'react'
import Blog from './components/Blog'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import loginService from './services/login'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import blogService from './requests'
import { NotificationContext } from './notificationContext'
import { UserContext } from './userContext'
import {
  useMatch,
  Routes,
  Route,
  useNavigate,
  Navigate,
  Link,
} from 'react-router-dom'
import {
  Button,
  Table,
  Alert,
  ListGroup,
  Container,
  Navbar,
  Nav,
  Form,
} from 'react-bootstrap'

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return <Alert variant={message.status}>{message.string}</Alert>
}

const NavBar = ({ user, handleLogOut }) => {
  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    handleLogOut()
  }

  if (!user) {
    return <div>Not logged in.</div>
  }

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand>FullStackOpen Bloglist Part 7</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/blogs">Blogs</Nav.Link>
          <Nav.Link href="/users">Users</Nav.Link>
          <Navbar.Text>{user.name} logged in</Navbar.Text>
          <Button variant="info" className="m-1" onClick={logout}>
            Logout
          </Button>
        </Nav>
      </Container>
    </Navbar>
  )
}

const IndUsers = ({ user, blogs }) => {
  if (!user) {
    return null
  }
  const userBlogs = blogs.filter((blog) => blog.user.id === user.id)
  return (
    <div>
      <h1>{user.name}</h1>
      <h3>Added blogs</h3>
      <ListGroup>
        {userBlogs.map((blog) => {
          return <ListGroup.Item key={blog.id}>{blog.title}</ListGroup.Item>
        })}
      </ListGroup>
    </div>
  )
}

const Users = ({ users }) => {
  return (
    <div>
      <h1>Users</h1>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Blogs created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((item) => {
            return (
              <tr key={item.id}>
                <td>
                  <Link to={`/users/${item.id}`}>{item.name}</Link>
                </td>
                <td>{item.blogs.length}</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </div>
  )
}

const Login = ({
  setPassword,
  setUsername,
  username,
  password,

  notificationDispatch,
  userDispatch,
}) => {
  const navigate = useNavigate()

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username,
        password,
      })
      window.localStorage.setItem('blogUser', JSON.stringify(user))
      blogService.setToken(user.token)
      userDispatch({ type: 'SET', payload: user })
      setUsername('')
      setPassword('')
      navigate('/blogs')
    } catch (exception) {
      setUsername('')
      setPassword('')
      notificationDispatch({
        type: 'SET',
        payload: { string: 'Wrong username or password', status: 'warning' },
      })
      setTimeout(() => {
        notificationDispatch({ type: 'REMOVE' })
      }, 5000)
    }
  }

  return (
    <div>
      <h2>Log in to application</h2>

      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            id="username"
            type="text"
            value={username}
            name="Username"
            onChange={({ target }) => setUsername(target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            id="password"
            type="password"
            value={password}
            name="Password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </Form.Group>
        <Button variant="info" type="submit" id="loginButton">
          login
        </Button>
      </Form>
    </div>
  )
}

const Blogs = ({ blogs, toggleRef, addBlog }) => {
  const toggle = () => {
    toggleRef.current.toggleVisibility()
  }

  return (
    <div>
      <Togglable buttonLabel="Create new blog" ref={toggleRef}>
        Create new
        <BlogForm createBlog={addBlog} toggle={toggle} />
      </Togglable>
      <ListGroup>
        {blogs
          .sort((a, b) => b.likes - a.likes)
          .map((blog) => (
            <ListGroup.Item variant="info" key={blog.id}>
              <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
            </ListGroup.Item>
          ))}
      </ListGroup>
    </div>
  )
}

const App = () => {
  const queryClient = useQueryClient()

  const newBlogMutation = useMutation(blogService.createBlog, {
    onSuccess: (newBlog) => {
      {
        const blogs = queryClient.getQueryData('blogs')
        queryClient.setQueryData('blogs', blogs.concat(newBlog))
      }
    },
  })

  const updateBlogMutation = useMutation(blogService.updatedBlog, {
    onSuccess: () => {
      queryClient.invalidateQueries('blogs')
    },
  })

  const removeBlogMutation = useMutation(blogService.remove, {
    onSuccess: () => {
      queryClient.invalidateQueries('blogs')
    },
  })

  const [notification, notificationDispatch] = useContext(NotificationContext)
  const [user, userDispatch] = useContext(UserContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('blogUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      userDispatch({ type: 'SET', payload: user })
      blogService.setToken(user.token)
    }
  }, [])

  const userMatch = useMatch('users/:id')
  const blogMatch = useMatch('blogs/:id')

  const toggleRef = useRef()

  const blogResult = useQuery('blogs', blogService.getBlogs)

  const blogs = blogResult.data

  const usersResult = useQuery('users', blogService.getUsers)

  const users = usersResult.data

  if (blogResult.isLoading) {
    return <div>loading blogs...</div>
  }

  if (usersResult.isLoading) {
    return <div>loading users</div>
  }

  const indUser = userMatch
    ? users.find((user) => user.id === userMatch.params.id)
    : null

  const indBlog = blogMatch
    ? blogs.find((blog) => blog.id === blogMatch.params.id)
    : null

  const handleLogOut = () => {
    notificationDispatch({
      type: 'SET',
      payload: { string: `${user.name} logged out`, status: 'success' },
    })
    setTimeout(() => {
      notificationDispatch({ type: 'REMOVE' })
    }, 5000)

    window.localStorage.removeItem('blogUser')
    userDispatch({ type: 'LOGOUT' })
  }

  const addBlog = async (blogData) => {
    try {
      const fullBlogData = { ...blogData, user }
      newBlogMutation.mutate(fullBlogData)

      // toggleRef.current.toggleVisibility()
      notificationDispatch({
        type: 'SET',
        payload: {
          string: `Added ${blogData.title} by ${blogData.author} to the list`,
          status: 'success',
        },
      })
      setTimeout(() => {
        notificationDispatch({ type: 'REMOVE' })
      }, 5000)
    } catch (error) {
      notificationDispatch({
        type: 'SET',
        payload: { string: `${error.message}`, status: 'warning' },
      })
      setTimeout(() => {
        notificationDispatch({ type: 'REMOVE' })
      }, 5000)
    }
  }

  const updateBlog = async (blogData) => {
    try {
      updateBlogMutation.mutate(blogData)
      notificationDispatch({
        type: 'SET',
        payload: { string: `Voted on ${blogData.title}`, status: 'success' },
      })
      setTimeout(() => {
        notificationDispatch({ type: 'REMOVE' })
      }, 5000)
    } catch (error) {
      notificationDispatch({
        type: 'SET',
        payload: { string: `${error.message}`, status: 'warning' },
      })
      setTimeout(() => {
        notificationDispatch({ type: 'REMOVE' })
      }, 5000)
    }
  }

  const deleteBlog = async (blogData) => {
    try {
      if (window.confirm(`remove blog ${blogData.title}`)) {
        removeBlogMutation.mutate(blogData)
        notificationDispatch({
          type: 'SET',
          payload: { string: `Removed ${blogData.title}`, status: 'success' },
        })
        setTimeout(() => {
          notificationDispatch({ type: 'REMOVE' })
        }, 5000)
      }
    } catch (error) {
      notificationDispatch({
        type: 'SET',
        payload: { string: `${error.message}`, status: 'warning' },
      })
      setTimeout(() => {
        notificationDispatch({ type: 'REMOVE' })
      }, 5000)
    }
  }

  return (
    <div>
      <NavBar user={user} handleLogOut={handleLogOut} />
      <h2>Blogs</h2>

      <Notification message={notification} />

      <Routes>
        <Route
          path="/"
          element={
            !user ? (
              <Login
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                notification={notification}
                userDispatch={userDispatch}
                notificationDispatch={notificationDispatch}
              />
            ) : (
              <Navigate replace to={'/blogs'} />
            )
          }
        />
        <Route
          path="/blogs"
          element={
            user ? (
              <Blogs
                blogs={blogs}
                user={user}
                updateBlog={updateBlog}
                deleteBlog={deleteBlog}
                addBlog={addBlog}
                handleLogOut={handleLogOut}
                toggleRef={toggleRef}
              />
            ) : (
              <Navigate replace to={'/'} />
            )
          }
        />
        <Route
          path="/users"
          element={
            user ? <Users users={users} /> : <Navigate replace to={'/'} />
          }
        />
        <Route
          path="/users/:id"
          element={
            user ? (
              <IndUsers user={indUser} blogs={blogs} />
            ) : (
              <Navigate replace to={'/'} />
            )
          }
        />

        <Route
          path="/blogs/:id"
          element={
            user ? (
              <Blog
                blog={indBlog}
                user={user}
                updateBlog={updateBlog}
                deleteBlog={deleteBlog}
              />
            ) : (
              <Navigate replace to={'/'} />
            )
          }
        />
      </Routes>
    </div>
  )
}

export default App
