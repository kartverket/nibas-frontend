describe("main page", () => {
  beforeEach(() => {
    cy.visit("");
  });

  it("should load the front page with a greeting header", () => {
    cy.get("h2").should("contain", "Hva har du lyst til å gjøre nå?");
  });

  it("should contain at least one button", () => {
    cy.get("button");
  });

  it("should contain a clickable button for creating or editing endringer", () => {
    cy.contains("Gjør en eller flere endringer").click();
    cy.url().should("include", "/utkast");
  });

  it("should contain a clickable button for navigating to the map view", () => {
    cy.contains("Finn og utforsk").click();
    cy.url().should("include", "/kart");
  });
});
