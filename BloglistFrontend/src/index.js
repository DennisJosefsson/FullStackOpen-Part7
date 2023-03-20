import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import App from './App'

import { NotificationContextProvider } from './notificationContext'
import { UserContextProvider } from './userContext'
import { BrowserRouter as Router } from 'react-router-dom'
import Container from 'react-bootstrap/Container'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <NotificationContextProvider>
      <UserContextProvider>
        <Router>
          <Container>
            <App />
          </Container>
        </Router>
      </UserContextProvider>
    </NotificationContextProvider>
  </QueryClientProvider>
)
