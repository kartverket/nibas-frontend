import { render, screen } from "test/test-utils";
import React from "react";
import KommuneList from "./KommuneList";
import { EditGrenserProvider } from "contexts/EditGrenserContext";

const defaultProps: React.ComponentProps<typeof KommuneList> = {
  fylke: {
    id: "2",
    navn: [{ navn: "Fylke", spraak: "nor" }],
    href: "href1",
  },
};

describe("KommuneList", () => {
  it("should render two kommuner from API request", async () => {
    render(
      <EditGrenserProvider>
        <KommuneList {...defaultProps} />
      </EditGrenserProvider>
    );

    expect(await screen.findByText("Malvik")).toBeInTheDocument();
    expect(await screen.findByText("Giske")).toBeInTheDocument();
  });
});
