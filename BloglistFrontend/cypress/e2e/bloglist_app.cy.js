describe('Bloglist app', function () {
  beforeEach(function () {
    cy.request('POST', `${Cypress.env('BACKEND')}/testing/reset`)
    const userOne = {
      username: 'DennisJ',
      name: 'Dennis Josefsson',
      password: 'dennisdennis',
    }
    const userTwo = {
      username: 'DummyUser',
      name: 'DummyUser',
      password: 'dummydummy',
    }
    cy.createUser(userOne)
    cy.createUser(userTwo)
    cy.visit('')
  })

  it('Login form is shown', function () {
    cy.visit('')
    cy.contains('Log in to application')
  })
  describe('Login', function () {
    it('succeeds with correct credentials', function () {
      cy.get('#username').type('DennisJ')
      cy.get('#password').type('dennisdennis')
      cy.get('#loginButton').click()
      cy.contains('Dennis Josefsson logged in')
    })

    it('fails with wrong credentials', function () {
      cy.get('#username').type('DennisJ')
      cy.get('#password').type('wrongpassword')
      cy.get('#loginButton').click()
      cy.contains('Wrong username or password')
      cy.get('html').should('not.contain', 'Dennis Josefsson logged in')
    })
  })
  describe('After login', function () {
    it('Adds blog post', function () {
      cy.login({ username: 'DennisJ', password: 'dennisdennis' })
      cy.contains('Create new blog').click()
      cy.get('#author').type('Chef John')
      cy.get('#title').type('Torta Caprese (Italian Flourless Chocolate Torte)')
      cy.get('#url').type(
        'https://www.allrecipes.com/recipe/8536477/italian-flourless-chocolate-torte-torta-caprese/'
      )
      cy.contains('Submit').click()
      cy.contains('Torta Caprese')
    })
  })
  describe('After login, multiple posts', function () {
    beforeEach(function () {
      cy.login({ username: 'DennisJ', password: 'dennisdennis' })
      cy.createBlog({
        author: 'Chef John',
        title: 'Torta Caprese (Italian Flourless Chocolate Torte',
        url: 'https://www.allrecipes.com/recipe/8536477/italian-flourless-chocolate-torte-torta-caprese/',
      })
      cy.createBlog({
        author: 'Nidal Kersh',
        title: 'Så gör du falafel från grunden',
        url: 'https://www.youtube.com/watch?v=pAr6a_lKWLc',
      })
      cy.visit('')
      cy.contains('Logout').click()
      cy.login({ username: 'DummyUser', password: 'dummydummy' })
      cy.createBlog({
        author: 'Rick Stein',
        title: 'Cheese and mushroom buckwheat pancakes',
        url: 'https://www.bbc.co.uk/food/recipes/buckwheat_pancakes_with_04857',
      })
    })
    it('Check existing blog posts', function () {
      cy.visit('')
      cy.contains('Torta Caprese')
      cy.contains('falafel')
      cy.contains('Cheese and mushroom')
    })
    it('Like blog post', function () {
      cy.contains('Torta Caprese').click()
      cy.contains('Likes 0')
      cy.contains('Like').click()
      cy.contains('Likes 1')
    })
    it('User list', function () {
      cy.contains('Users').click()
      cy.contains('Blogs created')
      cy.contains('Dennis Josefsson')
      cy.contains('DummyUser')
    })
  })
})
