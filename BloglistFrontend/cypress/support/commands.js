// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('createUser', ({ username, name, password }) => {
  cy.request('POST', `${Cypress.env('BACKEND')}/users`, {
    username,
    name,
    password,
  })
})

Cypress.Commands.add('login', ({ username, password }) => {
  cy.request('POST', `${Cypress.env('BACKEND')}/login`, {
    username,
    password,
  }).then(({ body }) => {
    localStorage.setItem('blogUser', JSON.stringify(body))
    cy.visit('')
  })
})

Cypress.Commands.add('createBlog', ({ author, title, url }) => {
  cy.request({
    url: `${Cypress.env('BACKEND')}/blogs`,
    method: 'POST',
    body: { author, title, url },
    headers: {
      Authorization: `Bearer ${
        JSON.parse(localStorage.getItem('blogUser')).token
      }`,
    },
  })

  cy.visit('')
})
