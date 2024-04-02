describe("utkast page", () => {
  const baseUrl = Cypress.env("baseUrl") ?? "http://localhost:3000";
  beforeEach(() => {
    cy.visit("/utkast");
  });

  it('should display the form with all elements after clicking "Opprett et nytt utkast"', () => {
    cy.contains("Opprett et nytt utkast").click();
    cy.get("form")
      .should("be.visible")
      .within(() => {
        cy.get('input[type="text"]').should("exist");
        cy.get("select").should("exist");
        cy.contains("button", "Avbryt").should("exist");
        cy.contains("button", "Opprett utkast").should("exist");
      });
  });

  it("should be able to create a new utkast (without sending it to backend)", () => {
    cy.intercept("POST", `${baseUrl}/v1/utkast`, (req) => {
      expect(req.body).to.deep.equal({
        navn: "Cypress test utkast",
        endringstype: "Fastsetting",
      });

      req.reply({
        statusCode: 200,
        body: { id: "123", message: "Mock response" },
      });
    }).as("createUtkast");

    cy.contains("Opprett et nytt utkast").click();
    cy.get("form")
      .should("be.visible")
      .within(() => {
        cy.get('input[type="text"]').type("Cypress test utkast");
        cy.get("select").select("Fastsetting");
        cy.contains("button", "Opprett utkast").click();
      });

    cy.wait("@createUtkast").its("request.body").should("deep.equal", {
      navn: "Cypress test utkast",
      endringstype: "Fastsetting",
    });

    cy.visit("/utkast");

    cy.contains("Cypress test utkast").should("not.exist");
  });
});
