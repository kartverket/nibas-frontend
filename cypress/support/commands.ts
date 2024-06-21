/// <reference types="cypress" />
/* eslint-disable @typescript-eslint/no-namespace */

declare namespace Cypress {
  interface Chainable {
    login: () => void;
    createUtkast: () => void;
    deleteUtkast: () => void;
    toggleRedigerInndeling: (inndelingsType: string, fylke: string, kommuner: string) => void;
    simulateOpenLayersEvent: (ol, map, type, x, y, opt_shiftKey) => void;
  }
}

const baseUrl = Cypress.env("baseUrl") ?? "http://localhost:3000";

Cypress.Commands.add("login", () => {
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

Cypress.Commands.add("toggleRedigerInndeling", (inndelingsType, fylke, kommune) => {
  cy.contains("Rediger en inndeling").click();
  cy.contains(inndelingsType).click();
  cy.contains(fylke).click();

  cy.contains(kommune).click();

  cy.contains("Rediger valgte inndelinger").click();
});

const utkastName = "Cypress_utkast";

Cypress.Commands.add("createUtkast", () => {
  cy.contains("Opprett et nytt utkast").click();
  cy.get('input[type="text"]').type(utkastName);
  cy.get("select").select("Vedtatt grensejustering");
  cy.contains("Opprett utkast").click();
});

Cypress.Commands.add("deleteUtkast", () => {
  //Sjekker om utkastet man prøver å slette har samme navn som createUtkast-metoden sitt utkast
  cy.contains(utkastName);
  cy.contains("Slett utkast").click();
  cy.get(".chakra-modal__footer").contains("Slett utkast").click();
});

// Cypress.Commands.add("simulateOpenLayersEvent", (ol, map, type, x, y, opt_shiftKey = undefined) => {
//   const viewport = map.getViewport();
//   const position = viewport.getBoundingClientRect();
//   cy.log(`left: ${position.left}, top: ${position.top}, width: ${position.width}, height: ${position.height}`);
//   cy.get("canvas").trigger(type, {
//     clientX: position.left + x + position.width / 2,
//     clientY: position.top + y + position.height / 2,
//   });
// });
