/// <reference types="cypress" />

/* eslint-disable @typescript-eslint/no-namespace */

type InndelingsType = "Fylke" | "Kommune" | "Stemmekrets" | "Grunnkrets";

const toolValues = ["add", "remove", "draw", "split", "grenseinfo", "koordinater", "archive"] as const;
const modeToolValues = ["move", "matrikkel", "snap_nibas", "snap_matrikkel"] as const;
const sidepanelValues = ["splitt", "sammenslaaing", "kartlag"] as const;
type Tool = (typeof toolValues)[number];
type ModeTool = (typeof modeToolValues)[number];
type Sidepanel = (typeof sidepanelValues)[number];

declare namespace Cypress {
  interface Chainable {
    setupTestingGlobal: (globalKey: string) => void;
    login: () => void;
    createUtkast: () => void;
    saveUtkast: () => void;
    publiserUtkast: () => void;
    deleteUtkast: () => void;
    toggleRedigerInndeling: (inndelingsType: InndelingsType, fylke: string, kommune: string) => void;
    toggleTool: (tool: Tool) => void;
    toggleModeTool: (tool: ModeTool) => void;
    toggleSidePanel: (sidepanel: Sidepanel) => void;
    escape: () => void;
    clickAtCoordinate: (map, coordinate: number[], doubleClick?: boolean) => Chainable<JQuery<HTMLCanvasElement>>;
    drawGrense: (map, coordinates: [number, number][]) => void;
    splittFlate: (opprinneligFlateName: string, nyeFlater: { navn: string; nummer: string }[]) => void;
    settTilhorighetNyGrense: (
      map,
      grensepunkt: number[],
      inndelingstype: "Stemmekretser" | "Grunnkretser",
      flater: [{ navn: string; nummer: string }, { navn: string; nummer: string }],
    ) => void;
    settTilhorighetEksisterendeGrense: (
      map,
      grensepunkt: number[],
      inndelingstype: "Stemmekretser" | "Grunnkretser",
      fraTil: [{ fra: string; til: string }, { fra: string; til: string }],
    ) => void;
    clickOnFeature: (map, layer: string, id: string, coordinateIndex: number) => object;
  }
}

const baseUrl = Cypress.env("baseUrl") ?? "http://localhost:3000";

// Sjekker om det finnes en global testing variable med navn lik globalKey, og setter denne med samme navn hvis den finnes, ellers venter den 100ms og sjekker på nytt.
Cypress.Commands.add("setupTestingGlobal", (globalKey) => {
  cy.window()
    .then((win) => {
      return new Cypress.Promise((resolve) => {
        const checkGlobal = () => {
          if (win.testingGlobals?.[globalKey] != null) {
            resolve(win.testingGlobals[globalKey]);
          } else {
            setTimeout(checkGlobal, 100);
          }
        };
        checkGlobal();
      });
    })
    .as(`${globalKey}`);
});

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
  cy.contains("Slett utkast").click();
  cy.get(".chakra-modal__footer").contains("Slett utkast").click();
});

Cypress.Commands.add("toggleTool", (tool) => {
  switch (tool) {
    case "add": {
      cy.get("body").type("{ctrl}L");
      break;
    }
    case "remove": {
      cy.get("body").type("{ctrl}{shift}L");
      break;
    }
    case "draw": {
      cy.get("body").type("{ctrl}T");
      break;
    }
    case "split": {
      cy.get("body").type("{ctrl}{shift}P");
      break;
    }
    case "grenseinfo": {
      cy.get("body").type("{ctrl}I");
      break;
    }
    case "koordinater": {
      cy.get("body").type("{ctrl}F");
      break;
    }
    case "archive": {
      cy.get("body").type("{ctrl}A");
      break;
    }
  }
});

Cypress.Commands.add("toggleModeTool", (modeTool) => {
  switch (modeTool) {
    case "move": {
      cy.get("body").type("V");
      break;
    }
    case "matrikkel": {
      cy.get("body").type("{ctrl}E");
      break;
    }
    case "snap_nibas": {
      cy.get("body").type("{ctrl}G");
      cy.contains("Snap til egne grenser").click();
      break;
    }
    case "snap_matrikkel": {
      cy.get("body").type("{ctrl}G");
      cy.contains("Snap til teiggrenser").click();
      break;
    }
  }
});

Cypress.Commands.add("toggleSidePanel", (sidepanel) => {
  switch (sidepanel) {
    case "splitt": {
      cy.get("body").type("{ctrl}{shift}M");
      break;
    }
    case "sammenslaaing": {
      cy.get("body").type("{ctrl}M");
      break;
    }
    case "kartlag": {
      cy.get("body").type("{ctrl}K");
      break;
    }
  }
});

Cypress.Commands.add("escape", () => {
  cy.get("body").type("{esc}");
});

Cypress.Commands.add("clickAtCoordinate", (map, coordinate, doubleClick = false) => {
  const featurePointPixelValue = map.getPixelFromCoordinate(coordinate);
  if (doubleClick === true) {
    return cy.get("canvas").dblclick(featurePointPixelValue[0], featurePointPixelValue[1]);
  } else {
    return cy.get("canvas").click(featurePointPixelValue[0], featurePointPixelValue[1]);
  }
});

Cypress.Commands.add("saveUtkast", () => {
  cy.get("body").type("{ctrl}S");
});

Cypress.Commands.add("publiserUtkast", () => {
  cy.contains("Publiser utkast").click();
  cy.get(".chakra-modal__footer").contains("Publiser utkast").click();
});

Cypress.Commands.add("drawGrense", (map, coordinates) => {
  cy.toggleTool("draw");
  coordinates.forEach((coordinate, i) => {
    cy.wait(250); // Wait for å kunne se at grensa tegnes
    if (i > 0) {
      cy.get(`@drawGrensepunkt-${i - 1}`).then(() => {
        if (i === coordinates.length - 1) {
          cy.clickAtCoordinate(map, coordinate, true).as(`drawGrensepunkt-${i}`);
        } else {
          cy.clickAtCoordinate(map, coordinate).as(`drawGrensepunkt-${i}`);
        }
      });
    } else {
      cy.clickAtCoordinate(map, coordinate).as(`drawGrensepunkt-${i}`);
    }
  });
  cy.get(`@drawGrensepunkt-${coordinates.length - 1}`).then(() => {
    // lukker grenseinfopanel etter opprettng av ny grense
    cy.escape();
    // lukker tegning
    cy.toggleTool("draw");
  });
});

Cypress.Commands.add("splittFlate", (opprinneligFlateName, nyeFlater) => {
  cy.toggleSidePanel("splitt");
  cy.get("select").select(opprinneligFlateName);

  nyeFlater.forEach((nyFlate, i) => {
    const fillOutNyFlateInputs = () => {
      cy.contains("button", "Legg til ny splitt").click();
      cy.get("label")
        .filter(":contains(Nytt nummer)")
        .last()
        .siblings()
        .type(nyFlate.nummer)
        .then(() => {
          cy.get("label").filter(":contains(Nytt navn)").last().siblings().type(nyFlate.navn);
        })
        .as(`split-${i}`);
    };
    if (i > 0) {
      cy.get(`@split-${i - 1}`).then(fillOutNyFlateInputs);
    } else {
      fillOutNyFlateInputs();
    }
  });

  cy.get(`@split-${nyeFlater.length - 1}`).then(() => {
    cy.contains("button", "Splitt").click();
    cy.escape();
  });
});

Cypress.Commands.add("settTilhorighetNyGrense", (map, grensepunkt, inndelingsType, flater) => {
  cy.toggleTool("grenseinfo");
  cy.clickAtCoordinate(map, grensepunkt);
  cy.contains("Tilhørighet").parent().contains("Rediger").click();
  cy.contains(inndelingsType)
    .parent()
    .parent()
    .siblings()
    .within(() => {
      const flate1 = flater[0];
      cy.contains("Skriv inn navnet eller nummeret til kretsen").click({ force: true });
      cy.wait(200);
      cy.contains(`${flate1.nummer} ${flate1.navn}`).dblclick({ force: true });

      cy.wait(500);
      const flate2 = flater[1];
      cy.contains("Skriv inn navnet eller nummeret til kretsen").click({ force: true });
      cy.wait(200);
      cy.contains(`${flate2.nummer} ${flate2.navn}`).dblclick({ force: true });
    });
  cy.contains("Bekreft").click();
  cy.escape();
  cy.toggleTool("grenseinfo");
});

Cypress.Commands.add("settTilhorighetEksisterendeGrense", (map, grensepunkt, inndelingsType, fraTil) => {
  cy.toggleTool("grenseinfo");
  cy.clickAtCoordinate(map, grensepunkt);
  cy.contains("Tilhørighet").parent().contains("Rediger").click();
  cy.contains(inndelingsType)
    .parent()
    .parent()
    .siblings()
    .within(() => {
      const bytte1 = fraTil[0];
      cy.contains(bytte1.fra).click({ force: true });
      cy.wait(200);
      cy.contains(`${bytte1.til}`).dblclick({ force: true });

      cy.wait(500);
      const bytte2 = fraTil[1];
      cy.contains(bytte2.fra).click({ force: true });
      cy.wait(200);
      cy.contains(`${bytte2.til}`).dblclick({ force: true });
    });
  cy.contains("Bekreft").click();
  cy.escape();
  cy.toggleTool("grenseinfo");
});

Cypress.Commands.add("clickOnFeature", (map, layer, id, coordinateIndex) => {
  const layers = map.getAllLayers();
  const editLayer = layers.find((l) => l.get("id") === layer);
  const editSource = editLayer.getSource();
  const feature = editSource.getFeatureById(id);
  const coordinates = feature.getGeometry().getCoordinates();
  cy.clickAtCoordinate(map, coordinates[coordinateIndex]);
});
