/// <reference types="cypress" />
/* eslint-disable @typescript-eslint/no-namespace */

declare namespace Cypress {
  interface Chainable {
    login: () => void;
  }
}

Cypress.Commands.add("login", () => {
  const baseUrl = Cypress.env("baseUrl") ?? "http://localhost:3000";

  cy.intercept("GET", `${baseUrl}/v1/authz/status`, (req) => {
    req.reply({
      statusCode: 200,
      body: { authorized: true },
    });
  }).as("authzStatus");

  cy.visit("/auth");
  cy.contains("Logg inn i Nasjonal inndelingsbase").click();
  cy.origin("https://login.test.idporten.no", () => {
    cy.contains("TestID").click();
  });
  cy.origin("https://testid.test.idporten.no", () => {
    cy.contains("Hent tilfeldig person").click();
    cy.wait(200);
    cy.get("#pid").invoke("val").should("have.length", 11);
    cy.contains("Autentiser").click();
  });
  cy.url().should("equal", `${baseUrl}/`);
  cy.contains("Gjør en eller flere endringer").should("exist");
});
