import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

const BlogForm = ({ createBlog, toggle }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleBlogForm = (event) => {
    event.preventDefault()
    createBlog({ author: author, title: title, url: url })
    toggle()
    setAuthor('')
    setTitle('')
    setUrl('')
  }

  return (
    <Form onSubmit={handleBlogForm} className="blogForm">
      <Form.Group className="mb-3">
        <Form.Label>Author</Form.Label>
        <Form.Control
          id="author"
          type="text"
          value={author}
          name="author"
          onChange={({ target }) => setAuthor(target.value)}
          placeholder="Author"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control
          id="title"
          type="text"
          value={title}
          name="title"
          onChange={({ target }) => setTitle(target.value)}
          placeholder="Title"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>URL</Form.Label>
        <Form.Control
          id="url"
          type="text"
          value={url}
          name="url"
          onChange={({ target }) => setUrl(target.value)}
          placeholder="URL"
        />
      </Form.Group>
      <Button variant="info" className="m-1" type="submit">
        Submit
      </Button>
    </Form>
  )
}

export default BlogForm
