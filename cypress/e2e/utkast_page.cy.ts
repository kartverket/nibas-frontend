describe("kart page", () => {
  it("should open stemmekrets, remove point, add point, splitt grense, draw grense, splitt flate, and set tilhørigheter, save and publish", () => {
    cy.login();
    cy.visit("/utkast");

    cy.setupTestingGlobal("map");

    cy.createUtkast();
    cy.wait(1000);
    const inndelingsType = "Stemmekrets";
    cy.toggleRedigerInndeling(inndelingsType, "Akershus", "Frogn");
    cy.wait(6000);

    cy.get("@map").then((map) => {
      cy.toggleTool("remove");
      // klikker på grensen for å velge å redigere den
      cy.clickAtCoordinate(map, [251343, 6627657]);
      // Klikker på punkt på nytt for å fjerne punkt
      cy.clickAtCoordinate(map, [251343, 6627657]);

      cy.toggleTool("add");
      // klikker på grensen for å velge å redigere den
      cy.clickAtCoordinate(map, [251343, 6627657]);
      // Klikker på punkt på nytt for å legge til punkt
      cy.clickAtCoordinate(map, [251343, 6627657]);

      cy.toggleTool("split");
      // klikker på grensen sitt punkt for å velge å splitte den på punktet
      cy.clickAtCoordinate(map, [251343, 6627657]);
      cy.contains("Del grense").click();

      const nyGrenseCoordinates = [
        [251343, 6627657],
        [253854.9, 6627663.16],
        [257099.81, 6627826.09],
      ] as [number, number][];
      cy.drawGrense(map, nyGrenseCoordinates);

      const nyFlate = { navn: "Testsplitt", nummer: "10" };
      cy.splittFlate("07 Nordre Frogn", [nyFlate]);

      cy.settTilhorighetNyGrense(map, nyGrenseCoordinates[1], "Stemmekretser", [
        { navn: "Testsplitt", nummer: "10" },
        { navn: "Nordre Frogn", nummer: "07" },
      ]);

      cy.settTilhorighetEksisterendeGrense(map, [255274.61, 6627364.6], "Stemmekretser", [
        { fra: "07 Nordre Frogn", til: "10 Testsplitt" },
        { fra: "03 Heer", til: "03 Heer" },
      ]);

      cy.settTilhorighetEksisterendeGrense(map, [251748, 6626277.99], "Stemmekretser", [
        { fra: "07 Nordre Frogn", til: "10 Testsplitt" },
        { fra: "01 Drøbak", til: "01 Drøbak" },
      ]);
    });

    cy.saveUtkast();
    cy.publiserUtkast();
  });
});
