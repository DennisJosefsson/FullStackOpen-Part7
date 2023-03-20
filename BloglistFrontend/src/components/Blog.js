import PropTypes from 'prop-types'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import blogService from '../requests'
import { Button, Form, Card } from 'react-bootstrap'

const Blog = ({ blog, updateBlog, deleteBlog, user }) => {
  const queryClient = useQueryClient()
  const newCommentMutation = useMutation(blogService.createComment, {
    onSuccess: (returnComment) => {
      {
        const comments = queryClient.getQueryData('comments')
        queryClient.setQueryData('comments', comments.concat(returnComment))
      }
    },
  })
  const commentsResult = useQuery(['comments'], () =>
    blogService.getComments(blog)
  )
  const comments = commentsResult.data
  if (commentsResult.isLoading) {
    return <div>loading comments...</div>
  }

  if (!blog) {
    return null
  }

  const CommentForm = () => {
    const [newComment, setNewComment] = useState('')
    const handleCommentForm = (event) => {
      event.preventDefault()
      const commentData = { comment: newComment, blog: blog }
      newCommentMutation.mutate(commentData)
      setNewComment('')
    }
    return (
      <Form onSubmit={handleCommentForm}>
        <Form.Group>
          <Form.Label>Add comment</Form.Label>
          <Form.Control
            id="newComment"
            type="text"
            value={newComment}
            name="newComment"
            onChange={({ target }) => setNewComment(target.value)}
            placeholder="Comment"
          />
        </Form.Group>
        <Button variant="info" type="submit">
          Submit comment
        </Button>
      </Form>
    )
  }

  const CommentList = ({ comments }) => {
    if (!comments) {
      return null
    }
    if (comments.length === 0) {
      return <h4>No comments</h4>
    }
    return (
      <div>
        <h4>Comments</h4>
        {comments.map((comment) => (
          <p key={comment.id}>{comment.comment}</p>
        ))}
      </div>
    )
  }

  const addLike = () => {
    const likes = blog.likes + 1
    updateBlog({ ...blog, likes })
  }

  const handleDelete = () => {
    deleteBlog(blog)
  }
  return (
    <Card style={{ width: '36rem' }}>
      <Card.Body>
        <Card.Title>{blog.title}</Card.Title>
        <Card.Text>
          {blog.author}
          <Card.Link href={`${blog.url}`}>Visit blogpost</Card.Link>
          Likes {blog.likes}{' '}
          <Button variant="info" onClick={addLike}>
            Like
          </Button>
          Added by {blog.user.name}
        </Card.Text>
      </Card.Body>
      <CommentForm />
      {comments && <CommentList comments={comments} />}
      {user.username === blog.user.username && (
        <Button variant="info" onClick={handleDelete}>
          Remove blogpost
        </Button>
      )}
    </Card>
  )
}

Blog.propTypes = {
  blog: PropTypes.object,
  updateBlog: PropTypes.func.isRequired,
  deleteBlog: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
}

export default Blog
