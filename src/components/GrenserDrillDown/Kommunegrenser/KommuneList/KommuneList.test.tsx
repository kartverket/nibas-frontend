import { render, screen } from "test/test-utils";
import React from "react";
import KommuneList from "./KommuneList";

const defaultProps: React.ComponentProps<typeof KommuneList> = {
  fylke: {
    id: {
      gyldighetsdato: "",
      lokalid: { value: "2" },
    },
    administrativenhetnavn: [{ navn: "Fylke", spraak: "nor", version: 1 }],
    fylkesnummer: {
      id: "id",
      kodeverdi: "1234",
    },
    samiskforvaltningsomraade: false,
    oppdateringsdato: "",
    representasjonspunkt: {
      type: "",
      id: undefined,
      properties: {
        type: "",
        srid: 0,
        metadata: undefined,
        kontekstEgenskaper: [],
        version: 0,
        shouldArchive: false,
      },
      geometry: {
        type: "",
      },
    },
    version: 0,
  },
};

describe("KommuneList", () => {
  it("should render two kommuner from API request", async () => {
    const { user } = render(<KommuneList {...defaultProps} />);

    await user.click(await screen.findByRole("button", { name: "Åpne 1234 Fylke" }));

    expect(await screen.findByText("5031 Malvik")).toBeInTheDocument();
    expect(await screen.findByText("1532 Giske")).toBeInTheDocument();
  });
});
