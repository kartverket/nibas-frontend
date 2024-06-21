describe("kart page", () => {
  it("should toggle kommune", () => {
    cy.login();
    cy.visit("/utkast");
    cy.createUtkast();
    cy.wait(1000);
    cy.toggleRedigerInndeling("Kommune", "32 Akershus", "Frogn");
    cy.wait(10000);
    cy.deleteUtkast();
  });
});
